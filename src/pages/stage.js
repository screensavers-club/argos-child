import styled from "styled-components";
import { useRoom } from "livekit-react";
import Key from "../components/keys";
import {
	createLocalAudioTrack,
	createLocalVideoTrack,
	RoomEvent,
	DataPacket_Kind,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { Microphone, Exit, Film, Hamburger, Undo } from "react-ikonate";
import Button from "../components/button";
import axios from "axios";

const StageDiv = styled.div`
	position: fixed;
	display: block;
	width: 100%;
	height: calc(100%-35px);
	background: #252529;

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
		z-index: 1;

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
	}

	div.active {
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

	.videoSlot {
		position: absolute;
		background: #252529;

		video {
			background: #252529;
			width: 100%;
			height: 100%;
			position: absolute;
			object-fit: cover;
		}
	}
`;

export default function Stage({ send, context, state, tabs }) {
	const { connect, room, participants, audioTracks } = useRoom();
	let [drawerActive, setDrawerActive] = useState(false);

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	const [active, setActive] = useState([false, false]);
	const [exiting, setExiting] = useState(false);
	const [renderState, setRenderState] = useState(0);
	const [availableVideoTracks, setAvailableVideoTracks] = useState([]);
	const localAudioTrackRef = useRef(null);
	const localVideoTrackRef = useRef(null);
	const audioMonitorDomRef = useRef();
	const exitingModalRef = useRef();

	useEffect(() => {
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keyup", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keyup", handleEsc);
		};
	}, []);

	const handleClick = (e) => {
		if (exitingModalRef.current.contains(e.target)) {
			return;
		}
		setExiting(false);
	};

	const handleEsc = (e) => {
		if (e.key === "Escape") {
			setExiting(false);
		} else return;
	};

	function sendCurrentLayout(recipient) {
		if (room) {
			const strData = JSON.stringify({
				current_layout: context.current_layout,
			});
			const data = encoder.encode(strData);
			room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE, [
				recipient,
			]);
		}
	}

	function sendCueMixState(recipient) {
		if (room) {
			const strData = JSON.stringify({
				cue_mix_state: context.cue_mix_state,
			});
			const data = encoder.encode(strData);
			room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE, [
				recipient,
			]);
		}
	}

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
		let _tracks = participants.map((p) => {
			let track = null;
			p?.videoTracks.forEach((thisTrack) => {
				if (!track) {
					track = thisTrack;
				}
			});
			return track;
		});
		setAvailableVideoTracks(_tracks);
	}, [participants, room, renderState]);

	useEffect(() => {
		if (room) {
			room.removeAllListeners(RoomEvent.DataReceived);
			room.on(RoomEvent.DataReceived, (payload, participant) => {
				console.log({ event: "DataReceived", payload, participant });
				const payloadStr = decoder.decode(payload);
				const payloadObj = JSON.parse(payloadStr);

				const requesterSid = participant.sid;

				if (payloadObj.action === "REQUEST_CURRENT_LAYOUT") {
					sendCurrentLayout(requesterSid);
				}

				if (payloadObj.action === "UPDATE_LAYOUT") {
					send("UPDATE_LAYOUT", { layout: payloadObj.layout });
				}

				if (payloadObj.action === "GET_CUE_MIX_STATE") {
					sendCueMixState(requesterSid);
				}

				if (payloadObj.action === "TOGGLE_CUE_MIX_TRACK") {
					send("TOGGLE_CUE_MIX_TRACK", { ...payloadObj });
				}

				if (payloadObj.action === "PING") {
					sendPong(requesterSid);
				}
			});
		}
	}, [room, context]);

	useEffect(() => {
		participants
			.filter((p) => JSON.parse(p.metadata)?.type === "PARENT")
			.forEach((p) => {
				sendCueMixState(p.sid);
			});
	}, [context.cue_mix_state]);

	useEffect(() => {
		Array.from(audioMonitorDomRef.current.children).forEach((elem) => {
			elem.remove();
		});

		audioTracks.forEach((track) => {
			let trackSid = track.sid;
			let _p = participants.find((participant) => {
				return participant.getTracks().find((_track) => {
					return _track.audioTrack && _track.audioTrack.sid === trackSid;
				});
			});

			if (_p?.identity === context.identity) {
				return;
			}

			if (
				context.cue_mix_state.source === "peers" &&
				JSON.parse(_p?.metadata || "{}")?.type === "CHILD" &&
				context.cue_mix_state.mute.indexOf(_p?.identity) > -1
			) {
				return;
			}

			if (
				context.cue_mix_state.source === "peers" &&
				JSON.parse(_p?.metadata || "{}")?.type === "PARENT"
			) {
				return;
			}

			let a = track?.attach();
			a.setAttribute("identity", _p?.identity);
			a.setAttribute("nickname", JSON.parse(_p?.metadata || "false")?.nickname);
			audioMonitorDomRef.current.append(a);
		});
	}, [audioTracks, participants, context.cue_mix_state]);

	useEffect(() => {
		connect(process.env.REACT_APP_LIVEKIT_SERVER, context.token).then(() => {
			axios.post(
				`${process.env.REACT_APP_PEER_SERVER}/child/participant/set-nickname`,
				{
					identity: context.identity,
					room: context.room.name,
					nickname: context.nickname,
				}
			);
		});
		return () => {
			room?.disconnect();
		};
	}, []);

	return (
		<StageDiv drawerActive={drawerActive}>
			<VideoGrid>
				{context.current_layout.slots.map((slot, i) => {
					return (
						<VideoSlot
							key={`slot_${i}_${slot?.track}`}
							slot={slot}
							availableVideoTracks={availableVideoTracks}
						/>
					);
				})}
			</VideoGrid>
			<div ref={audioMonitorDomRef}></div>

			<div className="streamTabs">
				{(tabs = [
					{
						tab: "mic",
						tabActive: active[0],
						icon: !localAudioTrackRef.current ? (
							<Microphone />
						) : (
							<>
								<span></span>
								<Microphone />
							</>
						),
						onClick: async () => {
							let _active = [...active];
							_active[0] = !active[0];
							setActive(_active);

							if (localAudioTrackRef.current) {
								room.localParticipant.unpublishTrack(
									localAudioTrackRef.current
								);
								localAudioTrackRef.current = null;
							} else {
								localAudioTrackRef.current = await createLocalAudioTrack({
									echoCancellation: false,
									noiseSuppression: false,
								}).catch((err) => {
									alert(err);
								});
								if (localAudioTrackRef.current) {
									room.localParticipant.publishTrack(
										localAudioTrackRef.current
									);
								}
							}
							setRenderState(renderState + 1);
						},
					},
					{
						tab: "video",
						tabActive: active[1],
						icon: !localVideoTrackRef.current ? (
							<Film />
						) : (
							<>
								<span></span>
								<Film />
							</>
						),
						onClick: async () => {
							let _active = [...active];
							_active[1] = !active[1];
							setActive(_active);

							if (localVideoTrackRef.current) {
								room.localParticipant.unpublishTrack(
									localVideoTrackRef.current
								);
								localVideoTrackRef.current = null;
							} else {
								localVideoTrackRef.current = await createLocalVideoTrack({
									width: { min: 1280, ideal: 1280, max: 1920 },
									height: { min: 720, ideal: 720, max: 1080 },
									frameRate: 30,
									facingMode: "environment",
								}).catch((err) => {
									console.log(err);
									alert("Error");
								});
								if (localVideoTrackRef.current) {
									room.localParticipant
										.publishTrack(localVideoTrackRef.current)
										.then((track) => {
											if (
												!context.current_layout.slots.reduce((p, c) => {
													return p || c.track;
												}, null)
											) {
												send("INIT_LAYOUT_WITH_SELF", {
													sid: track.trackSid,
												});
											}
											setRenderState(renderState + 1);
										});
								}
							}
						},
					},
					{
						tab: "end",
						icon: <Exit />,
						onClick: () => {
							setExiting(true);
						},
					},
				]).map(function ({ tab, icon, onClick, tabActive }, i) {
					let key = `key_${i}`;
					return (
						<Key
							key={key}
							variant="streamTabs"
							type={tab === "end" ? "cancel" : ""}
							tabActive={tabActive}
							k={icon}
							indicator={tab === "end" ? false : true}
							onClick={() => {
								onClick();
							}}
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
							color-interpolation-filters="sRGB"
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

function VideoSlot({ slot, availableVideoTracks }) {
	const videoRef = useRef(null);

	const trackSid = slot?.track;

	useEffect(() => {
		let track = availableVideoTracks.find((t) => {
			return t?.track?.sid === trackSid;
		});
		if (videoRef.current && track?.track) {
			let el = videoRef.current;
			if (typeof track.track.attach === "function") {
				track.track.attach(el);
				console.log("x");
			}
			el.muted = true;
			el.play();
		}
	}, [trackSid, availableVideoTracks]);
	return (
		<div
			className="videoSlot"
			style={{
				width: `${slot.size[0]}%`,
				height: `${slot.size[1]}%`,
				top: `${slot.position[1]}%`,
				left: `${slot.position[0]}%`,
			}}
		>
			<video
				ref={videoRef}
				muted
				autoPlay
				style={{ transform: "scaleX(-1)" }}
				key={trackSid}
			/>
		</div>
	);
}
