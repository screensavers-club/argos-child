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
	VideoQuality,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { Microphone, Exit, Film, Hamburger, Undo, Chat } from "react-ikonate";
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
	const { connect, room, participants } = useRoom();
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

	function handleTrackSubscribed(track, publication) {
		console.log("handling track subscribe");
		if (track.kind === Track.Kind.Video) {
			if (typeof publication.setVideoDimensions === "function") {
				console.log("set video dimensions");
				publication.setVideoDimensions({ width: 480, height: 270 });
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
							track.setEnabled(subscribed);
						}
					} else {
						if (typeof track.setEnabled === "function") {
							track.setEnabled(false);
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
		document.addEventListener("keyup", handleEsc);
		document.addEventListener("mousedown", handleOnboardClick);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("mousedown", handleOnboardClick);
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

	useEffect(() => {
		connect(process.env.REACT_APP_LIVEKIT_SERVER, context.token, {
			// autoSubscribe: false,
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
			});

			return () => {
				room.removeAllListeners(RoomEvent.DataReceived);
			};
		}
	}, [room, context, participants]);

	return (
		<StageDiv drawerActive={drawerActive} onboard={onboard}>
			<AudioMix mix={mix} participants={participants} context={context} />
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
							.map((participant) => ({
								participant: {
									nickname: JSON.parse(participant.metadata || "{}")?.nickname,
								},
							}))
							.map((slot, i) => {
								return (
									<VideoSlot
										publishingVideo={publishingVideo}
										context={context}
										slot={slot}
										participants={participants}
										key={`${videoLayout?.layout || "default"}_slot-${i}_${
											slot.participant?.nickname
										}`}
									/>
								);
							})}
					</VideoDefaultGrid>
				) : (
					videoLayout?.slots?.map((slot, i) => (
						<VideoSlot
							publishingVideo={publishingVideo}
							context={context}
							slot={slot}
							participants={participants}
							key={`${videoLayout?.layout}_slot-${i}_${slot.participant?.nickname}`}
						/>
					))
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

					// {
					// 	tab: "message",
					// 	icon: <Chat />,
					// 	onClick: () => {
					// 		setExiting(true);
					// 	},
					// },
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
				<svg
					width="203"
					height="292"
					viewBox="0 0 203 292"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g filter="url(#filter0_d)">
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M91 0C63.3857 0 41 22.3857 41 50V105C20.5654 105 4 121.565 4 142C4 162.435 20.5654 179 41 179V234C41 261.614 63.3857 284 91 284H199V0H91Z"
							fill="#434349"
						/>
					</g>
					<defs>
						<filter
							id="filter0_d"
							x="0"
							y="0"
							width="203"
							height="292"
							filterUnits="userSpaceOnUse"
							colorInterpolationFilters="sRGB"
						>
							<feFlood floodOpacity="0" result="BackgroundImageFix" />
							<feColorMatrix
								in="SourceAlpha"
								type="matrix"
								values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
								result="hardAlpha"
							/>
							<feOffset dy="4" />
							<feGaussianBlur stdDeviation="2" />
							<feComposite in2="hardAlpha" operator="out" />
							<feColorMatrix
								type="matrix"
								values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
							/>
							<feBlend
								mode="normal"
								in2="BackgroundImageFix"
								result="effect1_dropShadow"
							/>
							<feBlend
								mode="normal"
								in="SourceGraphic"
								in2="effect1_dropShadow"
								result="shape"
							/>
						</filter>
					</defs>
				</svg>
			</div>

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
		</StageDiv>
	);
}

const StageDiv = styled.div`
	position: fixed;
	display: block;
	width: 100%;
	height: calc(100%-35px);
	background: #111119;

	div.streamTabs {
		> svg {
			position: absolute;
			z-index: 0;
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
			display: ${(p) => (p.onboard == "active" ? "block" : "none")};

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
		width: ${(p) => `${100 / Math.ceil(Math.sqrt(p.gridSize))}`}%;
		position: relative;
	}
`;
