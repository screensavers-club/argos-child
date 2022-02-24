import axios from "axios";
import styled from "styled-components";
import { useRoom } from "livekit-react";
import {
	createLocalAudioTrack,
	createLocalVideoTrack,
	RoomEvent,
	DataPacket_Kind,
	VideoPresets,
	Track,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import {
	Microphone,
	Exit,
	Film,
	Hamburger,
	Undo,
	Chat,
	Delete,
	Cancel,
	Send,
} from "react-ikonate";
import Key from "../components/keys";
import Button from "../components/button";
import VideoSlot from "../components/video-slot";
import AudioMix from "../components/audio-mix";

function getLayoutState(room, nickname) {
	return axios.get(
		`${process.env.REACT_APP_PEER_SERVER}/${room}/${nickname}/layout`
	);
}

export default function Stage({ send, context, state, tabs }) {
	const { connect, room, participants, audioTracks } = useRoom();
	let [drawerActive, setDrawerActive] = useState(true);

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	const [exiting, setExiting] = useState(false);
	const [onboard, setOnboard] = useState("active");
	const [videoLayout, setVideoLayout] = useState([]);
	const [forceRender, setForceRender] = useState(false);

	const [mix, setMix] = useState({});

	const [publishingAudio, setPublishingAudio] = useState(false);
	const [publishingVideo, setPublishingVideo] = useState(false);

	const exitingModalRef = useRef();
	const onboardModalRef = useRef();
	const msgInputModalRef = useRef();

	const [enteringMessage, setEnteringMessage] = useState(false);
	const [message, setMessage] = useState("");

	const [messageFlash, setMessageFlash] = useState(null);
	const messageFlashTimeout = useRef();

	function handleMessageInput(msg) {
		setMessage(msg.slice(0, 50).toUpperCase());
	}

	function sendMessage(msg) {
		const messageObj = {
			message: msg,
			sender: context.nickname,
			action: "MESSAGE",
		};
		const payload = encoder.encode(JSON.stringify(messageObj));

		if (typeof room?.localParticipant?.publishData === "function") {
			room.localParticipant
				.publishData(payload, DataPacket_Kind.RELIABLE)
				.then(() => {
					flashMessage({ sender: context.nickname, message: msg });
				});
		}

		setMessage("");
	}

	useEffect(() => {
		if (messageFlash === null) {
			return;
		}
		if (messageFlashTimeout.current) {
			window.clearTimeout(messageFlashTimeout.current);
		}
		messageFlashTimeout.current = window.setTimeout(() => {
			setMessageFlash(null);
		}, 5000);
	}, [messageFlash]);

	function handleTrackSubscribed(track, publication) {
		console.log("handling track subscribe");
		if (track.kind === Track.Kind.Video) {
			if (typeof publication.setVideoDimensions === "function") {
				console.log("set video dimensions");
				// publication.setVideoDimensions({ width: 320, height: 240 });
			}

			if (typeof publication.setVideoQuality === "function") {
				console.log("set video quality");
				// publication.setVideoQuality(VideoQuality.LOW);
			}
		}
	}

	function updateMix() {
		axios
			.get(
				`${process.env.REACT_APP_PEER_SERVER}/${room.name}/${context.nickname}/mix`
			)
			.then(({ data }) => {
				setMix(data.mix);
			});
	}

	function updateSubscriptions(participants) {
		getLayoutState(room?.name, context.nickname).then(({ data }) => {
			const layout = data.layout;
			setVideoLayout(layout);
			participants.forEach((participant) => {
				let _nickname = JSON.parse(participant.metadata || "{}")?.nickname;
				participant.videoTracks.forEach((track) => {
					if (layout && layout.slots) {
						let subscribed = !!layout.slots.find(
							(slot) => slot.participant?.nickname === _nickname
						);
						if (typeof track.setEnabled === "function") {
							// track.setEnabled(subscribed);
						}
					} else {
						if (typeof track.setEnabled === "function") {
							// track.setEnabled(true);
						}
					}
				});
			});
			setForceRender(!forceRender);
		});
	}

	useEffect(() => {
		// enable or disable participants
		if (!room || !room.name || !context.nickname) {
			return;
		}
		updateSubscriptions(participants);
		updateMix(participants);
	}, [room, participants, context]);

	useEffect(() => {
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("mousedown", handleOnboardClick);
		document.addEventListener("mousedown", handleMessageInputClick);
		document.addEventListener("keyup", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("mousedown", handleOnboardClick);
			document.removeEventListener("mousedown", handleMessageInputClick);
			document.removeEventListener("keyup", handleEsc);
		};
	}, []);

	const handleOnboardClick = (e) => {
		if (onboardModalRef.current.contains(e.target)) {
			return;
		}
		setOnboard("inactive");
	};

	const handleClick = (e) => {
		if (exitingModalRef.current.contains(e.target)) {
			return;
		}
		setExiting(false);
	};

	const handleMessageInputClick = (e) => {
		if (msgInputModalRef.current.contains(e.target)) {
			return;
		}
		setEnteringMessage(false);
	};

	const handleEsc = (e) => {
		if (e.key === "Escape") {
			setExiting(false);
			setOnboard("inactive");
		} else return;
	};

	function sendPong(recipient) {
		if (room) {
			const strData = JSON.stringify({
				type: "PONG",
			});
			const data = encoder.encode(strData);
			room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE, [
				recipient,
			]);
		}
	}

	function flashMessage({ message, sender }) {
		if (message?.length > 0) {
			setMessageFlash({ message, sender });
		}
	}

	useEffect(() => {
		connect(process.env.REACT_APP_LIVEKIT_SERVER, context.token, {
			// autoSubscribe: false,
			adaptiveStream: true,
		}).then((room) => {
			axios
				.post(
					`${process.env.REACT_APP_PEER_SERVER}/child/participant/set-nickname`,
					{
						identity: context.identity,
						room: context.room.name,
						nickname: context.nickname,
					}
				)
				.then(() => {
					room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
				});
		});
		return () => {
			if (room && typeof room.disconnect === "function") {
				room.disconnect();
			}
		};
	}, []);

	useEffect(() => {
		if (room) {
			room.on(RoomEvent.DataReceived, (payload, participant) => {
				const payloadStr = decoder.decode(payload);
				const payloadObj = JSON.parse(payloadStr);
				const requesterSid = participant.sid;

				if (payloadObj.action === "PING") {
					sendPong(requesterSid);
				}

				if (payloadObj.action === "LAYOUT") {
					updateSubscriptions(participants);
				}

				if (payloadObj.action === "MIX") {
					updateMix(participants);
				}

				if (payloadObj.action === "MESSAGE") {
					flashMessage(payloadObj);
				}
			});

			return () => {
				room.removeAllListeners(RoomEvent.DataReceived);
			};
		}
	}, [room, context, participants]);

	return (
		<StageDiv drawerActive={drawerActive} onboard={onboard}>
			<AudioMix
				mix={mix}
				participants={participants}
				context={context}
				audioTracks={audioTracks}
			/>

			<VideoGrid>
				{videoLayout?.layout === "Default" ||
				videoLayout?.layout === undefined ? (
					<VideoDefaultGrid
						gridSize={Math.ceil(
							Math.sqrt(
								participants.filter(
									(p) => JSON.parse(p.metadata)?.type === "CHILD"
								).length
							)
						)}
					>
						{participants
							.filter((p) => JSON.parse(p.metadata)?.type === "CHILD")
							.map((participant) => {
								const meta = JSON.parse(participant.metadata);
								return {
									participant: {
										nickname: meta.nickname,
									},
								};
							})
							.sort((a, b) =>
								a.participant.nickname > b.participant.nickname ? 1 : -1
							)
							.map((slot, i) => {
								return (
									<VideoSlot
										publishingVideo={publishingVideo}
										context={context}
										slot={slot}
										participants={participants}
										key={`${videoLayout?.layout || "default"}_slot-${i}_${
											slot.participant.nickname
										}`}
										data-key={`${videoLayout?.layout || "default"}_slot-${i}_${
											slot.participant.nickname
										}`}
									/>
								);
							})}
					</VideoDefaultGrid>
				) : (
					videoLayout?.slots?.map((slot, i) => {
						return (
							<VideoSlot
								publishingVideo={publishingVideo}
								context={context}
								slot={slot}
								participants={participants}
								key={`${videoLayout?.layout}_slot-${i}_${slot.participant?.nickname}`}
							/>
						);
					})
				)}
			</VideoGrid>

			<div className="streamTabs">
				<div className="onboard" ref={onboardModalRef}>
					<div>Start by switching your camera and mic</div>
					<div className="triangle" />
				</div>

				{[
					{
						tab: "mic",
						tabActive: publishingAudio,
						icon: publishingAudio ? (
							<Microphone />
						) : (
							<>
								<span></span>
								<Microphone />
							</>
						),
						onClick: async () => {
							if (publishingAudio) {
								room.localParticipant.unpublishTracks(
									Array.from(
										room.localParticipant.audioTracks,
										([name, value]) => {
											return value.track;
										}
									)
								);
								setPublishingAudio(false);
							} else {
								let track = await createLocalAudioTrack({
									echoCancellation: false,
									noiseSuppression: false,
								});

								if (track) {
									room.localParticipant
										.publishTrack(track)
										.then(() => {
											setPublishingAudio(true);
										})
										.catch((err) => console.log(err));
								}
							}
						},
					},
					{
						tab: "video",
						tabActive: publishingVideo,
						icon: publishingVideo ? (
							<Film />
						) : (
							<>
								<span></span>
								<Film />
							</>
						),
						onClick: async () => {
							if (publishingVideo) {
								room.localParticipant.unpublishTracks(
									Array.from(
										room.localParticipant.videoTracks,
										([name, value]) => {
											return value.track;
										}
									)
								);
								setPublishingVideo(false);
							} else {
								let track = await createLocalVideoTrack({
									resolution: VideoPresets.hd,
								});

								if (track) {
									room.localParticipant
										.publishTrack(track, { simulcast: true })
										.then((track) => {
											setPublishingVideo(true);
										})
										.catch((err) => console.log(err));
								}
							}
						},
					},

					{
						tab: "message",
						icon: <Chat />,
						onClick: () => {
							setEnteringMessage(true);
						},
					},
					{
						tab: "end",
						icon: <Exit />,
						onClick: () => {
							setExiting(true);
						},
					},
				].map(function ({ tab, icon, onClick, tabActive }, i) {
					return (
						<Key
							key={`key_${tab}`}
							variant="streamTabs"
							type={tab === "end" ? "cancel" : ""}
							tabActive={tabActive}
							k={icon}
							indicator={tab === "end" ? false : true}
							onClick={onClick}
							className={`${tab} ${tabActive === true ? "activated" : ""}`}
						/>
					);
				})}

				<span
					className="hamburger"
					onClick={() => {
						drawerActive === false
							? setDrawerActive(true)
							: setDrawerActive(false);
					}}
				>
					<Hamburger />
				</span>
			</div>

			<MessageInput visible={enteringMessage} ref={msgInputModalRef}>
				<div>
					<input
						type="text"
						placeholder="type your message"
						className="message"
						value={message}
						onChange={(e) => {
							handleMessageInput(e.target.value);
						}}
					/>
				</div>
				<Keyboard>
					{"1 2 3 4 5 6 7 8 9 0 Q W E R T Y U I O P A S D F G H J K L clr Z X C V B N M space bsp send"
						.split(" ")
						.map((key, i) => {
							return (
								<Key
									k={
										key === "bsp" ? (
											<Delete />
										) : key === "clr" ? (
											<Cancel />
										) : key === "space" ? (
											" "
										) : key === "send" ? (
											<Send />
										) : (
											key
										)
									}
									variant="keyboard"
									key={key}
									type={
										key === "clr"
											? "cancel"
											: key === "send"
											? "primary"
											: key === "bsp"
											? "long"
											: "default"
									}
									className={`keys ${key} `}
									onClick={() => {
										let _msg = message;
										if (key === "send") {
											sendMessage(message);
											return;
										}
										if (key === "bsp") {
											_msg = _msg.slice(0, _msg.length - 1);
										} else if (key === "clr") {
											_msg = "";
										} else if (key === "space") {
											_msg = `${message} `;
										} else {
											_msg = `${message}${key}`;
										}
										handleMessageInput(_msg);
									}}
								/>
							);
						})}
				</Keyboard>
			</MessageInput>

			<MessageFlash flashing={messageFlash !== null}>
				<div className="sender">{messageFlash?.sender}</div>
				<div className="message">{messageFlash?.message}</div>
			</MessageFlash>

			<div
				className={`exitingModal ${exiting === true ? "active" : ""}`}
				ref={exitingModalRef}
			>
				Are you sure you want to exit?
				<div>
					<Button
						icon={<Undo />}
						className="no"
						variant="navigation"
						onClick={() => {
							setExiting(false);
						}}
					>
						Back
					</Button>
					<Button
						icon={<Exit />}
						className="yes"
						variant="navigation"
						type="secondary"
						onClick={() => {
							room?.disconnect();
							send("DISCONNECT");
							setExiting(false);
						}}
					>
						Exit
					</Button>
				</div>
			</div>
			{room && (
				<div className={`debug`}>
					vol: {room.localParticipant.audioLevel}
					<br />
					simulcast:{" "}
					{Array.from(room.localParticipant.videoTracks.values())
						.map((t) => {
							return t.simulcasted ? "√" : "x";
						})
						.join(" ")}
					<br />
					conn: {room.localParticipant.connectionQuality}
				</div>
			)}
		</StageDiv>
	);
}

const StageDiv = styled.div`
	position: fixed;
	display: block;
	width: 100%;
	height: calc(100%-35px);
	background: #111119;

	div.debug {
		position: fixed;
		color: white;
		right: 20px;
		top: 40px;
		font-size: 10px;
	}

	div.streamTabs {
		&::before {
			content: " ";
			position: absolute;
			z-index: 0;
			height: 100%;
			left: 55px;
			right: 0;
			top: 0;
			display: block;
			background: #434349;
			border-radius: 50px 0 0 50px;
		}

		> div {
			z-index: 10;
			position: relative;
			right: -50px;
			margin: 10px 0;
			top: 50%;
			transform: translate(0, -5%);
		}

		div.onboard {
			position: absolute;
			margin: 0;
			font-weight: 600;
			text-align: center;
			right: 80%;
			top: 50%;
			transform: translate(0, -50%);
			display: ${(p) => (p.onboard === "active" ? "block" : "none")};

			> div {
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 25px;
				background: #5736fd;
				color: white;
				width: 100%;
				height: 100%;
				z-index: 1;
				border-radius: 50px;
				width: 190px;
				height: 90px;
				box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
			}

			div.triangle {
				padding: 0;
				background: none;
				position: absolute;
				top: 50%;
				right: 0px;
				transform: translate(80%, -50%);
				width: 0;
				height: 0;
				border-top: 20px solid transparent;
				border-bottom: 20px solid transparent;
				border-left: 30px solid #5736fd;
				border-radius: 0;
				z-index: 2;
				box-shadow: none;
			}
		}

		display: flex;
		flex-direction: column;
		justify-content: space-around;
		width: 150px;
		position: absolute;
		transition: right 0.3s;
		right: ${(p) => (p.drawerActive === true ? "-35px" : "-125px")};
		padding: 15px;
		top: 50%;
		transform: translate(0, -50%);
		border-radius: 50px;
		z-index: 5;

		span.hamburger {
			border-radius: 50px;
			position: absolute;
			width: 50px;
			height: 50px;
			top: 50%;
			right: 105px;
			background: #434349;
			transform: translate(0, -55%);
			display: flex;
			justify-content: flex-start;
			align-items: center;
			font-size: 28px;
			z-index: 2;

			:hover {
				cursor: pointer;
			}

			svg {
				color: white;
				padding-left: 5px;
			}
		}

		button {
			z-index: 10;
			:hover {
				background: white;
				cursor: pointer;
			}
		}
	}

	div.exitingModal {
		display: none;

		&.active {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			background: #333;
			color: white;
			position: fixed;
			width: 350px;
			height: 170px;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			border-radius: 25px;
			font-size: 14px;
			font-weight: 500;
			box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
			z-index: 20;

			button {
				margin: 0 10px;
			}
			> div {
				width: 100%;
				margin-top: 25px;
				display: inline-flex;
				justify-content: center;
			}
		}
	}
`;

const VideoGrid = styled.div`
	position: relative;
	height: 0;
	width: 100%;
	padding-top: ${(9 / 16) * 100}%;
	box-sizing: border-box;
	background: #252529;

	label.participantNumber {
		position: absolute;
		font-size: 5em;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
`;

const VideoDefaultGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	align-items: stretch;

	> div {
		width: ${(p) => `${100 / Math.ceil(p.gridSize)}`}%;
		position: relative;
	}
`;

const MessageInput = styled.div`
	position: fixed;
	z-index: ${(p) => (p.visible ? 20 : -2)};
	top: ${(p) => (p.visible ? "50%" : "-200%")};
	left: 50%;
	transform: translate(-50%, -50%);
	background: #e5e5ea;
	padding: 20px;
	border-radius: 25px;

	input.message {
		font-size: 20px;
		width: 100%;
		text-align: center;
		margin: 0 0 20px 0;
		outline: none;
		appearance: none;
		border: 1px solid #111119;
		padding: 8px 0;
		background: transparent;
		border-radius: 5px;
	}
`;

const Keyboard = styled.div`
	display: grid;
	grid-template-columns: repeat(10, 1fr);
	grid-column-gap: 20px;
	grid-row-gap: 10px;
	flex-wrap: wrap;
	justify-content: center;
	margin-bottom: 1em;

	div.bsp {
		/* grid-column: 8 / span 2; */
	}
`;

const MessageFlash = styled.div`
	padding: 20px;
	position: fixed;
	display: ${(p) => (p.flashing ? "block" : "none")};
	bottom: 0;
	left: 0;
	box-sizing: border-box;
	width: 100%;
	color: black;
	background: rgba(255, 255, 255, 0.7);
	z-index: 30;
	text-align: center;

	.sender {
		font-size: 15px;
	}

	.message {
		font-size: 30px;
	}
`;
