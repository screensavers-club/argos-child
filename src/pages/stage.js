import styled from "styled-components";
import {
	useRoom,
	useParticipant,
	VideoRenderer,
	AudioRenderer,
} from "livekit-react";
import {
	createLocalAudioTrack,
	createLocalVideoTrack,
	RoomEvent,
	DataPacket_Kind,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import {
	Microphone,
	Mute,
	Exit,
	Film,
	Phone,
	VolumeOff,
	Controls,
	EyeCrossed,
} from "react-ikonate";

const StageDiv = styled.div`
	position: fixed;
	display: block;
	width: 100%;
	height: 100%;

	div.streamTabs {
		display: flex;
		justify-content: space-around;
		width: 80%;
		height: 3em;
		position: absolute;
		bottom: 5em;
		left: 50%;
		transform: translate(-50%, 0);
		border: 1px solid black;
		border-radius: 0.5em;

		> button {
			width: 100%;
			height: 100%;
			padding: 0.5em 0;
			appearance: none;
			border: none;
			border-right: 1px solid black;
			font-size: 1.5em;

			/* background:${(p) => (!p.selected ? "black" : "white")} */

			&:hover {
				background: #ddd;

				&.active {
					background: #888;
				}
			}

			&.active {
				background: #aaa;
			}

			svg {
				stroke-linecap: round;
				stroke-width: 1.5;
			}

			&:first-child {
				border-top-left-radius: 0.3em;
				border-bottom-left-radius: 0.3em;
			}

			&:last-child {
				border: none;
				border-top-right-radius: 0.3em;
				border-bottom-right-radius: 0.3em;
			}
		}
	}
`;

const VideoGrid = styled.div`
	display: flex;
	height: 70%;

	label.participantNumber {
		position: absolute;
		font-size: 5em;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	> div {
		position: relative;
		display: block;
		justify-self: stretch;
		align-self: stretch;

		span {
			position: absolute;
			bottom: 0;
			right: 0;
			background: #000;
			font-size: 0.5em;
			color: white;
		}
	}

	> div.remote-participant {
		position: relative;
		display: flex;
		width: ${(p) => {
			let COL_COUNT = [
				1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5,
				5, 6, 6, 6, 6, 6,
			];
			let numP = p.participants.filter((p) => !p.isLocal).length;
			return 100 / COL_COUNT[numP - 1];
		}}%;
		order: 2;

		video {
			position: absolute;
			object-fit: contain;
			width: 100%;
			height: 100%;
		}
	}

	div.participants {
		border: 1px solid black;
	}

	> div.local-participant {
		position: fixed;
		width: 50%;
		top: 50%;
		left: 0;
		transform: translate(0, -50%);

		video {
			object-fit: contain;
			width: 100%;
			height: 100%;
			border: 1px solid black;
		}
	}
`;

export default function Stage({ send, context, state, tabs }) {
	const { connect, isConnecting, room, error, participants, audioTracks } =
		useRoom();

	function getCurrentLayout() {
		return context.current_layout;
	}

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	const [localVideoTrack, setLocalVideoTrack] = useState();

	const [renderState, setRenderState] = useState(0);

	const localAudioTrackRef = useRef(null);
	const localVideoTrackRef = useRef(null);

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

	if (room) {
		room.on(RoomEvent.DataReceived, (payload, participant) => {
			const payloadStr = decoder.decode(payload);
			const payloadObj = JSON.parse(payloadStr);

			const requesterSid = participant.sid;

			if (payloadObj.action === "REQUEST_CURRENT_LAYOUT") {
				sendCurrentLayout(requesterSid);
			}
		});
	}

	useEffect(() => {
		connect(process.env.REACT_APP_LIVEKIT_SERVER, context.token).then(
			(_room) => {
				send("INIT_LAYOUT_WITH_SELF", { sid: _room.localParticipant.sid });
			}
		);
		return () => {
			room.disconnect();
		};
	}, []);

	return (
		<StageDiv selected={localVideoTrackRef.current}>
			<VideoGrid participants={participants}>
				{participants
					.reduce((p, c) => {
						if (!p.find((_p) => _p.identity === c.identity)) {
							p.push(c);
						}
						return p;
					}, [])
					.map((participant, i, arr) => {
						return (
							<Participant
								participant={participant}
								participantNumber={i}
								totalParticipants={arr.length}
							/>
						);
					})}
			</VideoGrid>
			<br />

			<div className="streamTabs">
				{(tabs = [
					{
						tab: "mic",
						icon: !localAudioTrackRef.current ? <Microphone /> : <Mute />,
						onClick: async () => {
							if (localAudioTrackRef.current) {
								room.localParticipant.unpublishTrack(
									localAudioTrackRef.current
								);
								localAudioTrackRef.current = null;
							} else {
								localAudioTrackRef.current =
									await createLocalAudioTrack().catch((err) => {
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
						tab: "volume",
						icon: <VolumeOff />,
					},
					{
						tab: "video",
						icon: localVideoTrackRef.current ? <Film /> : <EyeCrossed />,
						onClick: async () => {
							// console.log(localVideoTrackRef.current);
							if (localVideoTrackRef.current) {
								room.localParticipant.unpublishTrack(
									localVideoTrackRef.current
								);
								localVideoTrackRef.current = null;
							} else {
								localVideoTrackRef.current =
									await createLocalVideoTrack().catch((err) => {
										alert(err);
									});
								if (localVideoTrackRef.current) {
									room.localParticipant.publishTrack(
										localVideoTrackRef.current
									);
								}
							}
							setLocalVideoTrack(localVideoTrackRef.current);
						},
					},
					{
						tab: "end",
						icon: <Exit />,
						onClick: () => {
							room?.disconnect();
							send("DISCONNECT");
						},
					},
					{ tab: "call", icon: <Phone /> },
					{ tab: "controls", icon: <Controls /> },
				]).map(function ({ tab, icon, onClick }, i) {
					let key = `key_${i}`;
					return (
						<button key={key} onClick={onClick}>
							{icon}
						</button>
					);
				})}
			</div>
		</StageDiv>
	);
}

function Participant({ participant, participantNumber, totalParticipants }) {
	const { subscribedTracks, isLocal } = useParticipant(participant);

	const [videoPub, setVideoPub] = useState();

	// const currentGridLayout = videoGridLayout[totalParticipants];
	// console.log(currentGridLayout);

	useEffect(() => {
		let _pub;
		subscribedTracks.forEach((pub) => {
			if (pub.kind === "video") {
				_pub = pub;
			}
			setVideoPub(_pub);
		});
	}, [subscribedTracks]);

	useEffect(() => {
		if (videoPub?.setEnabled) {
			videoPub?.setEnabled(true);
		}
	}, [videoPub]);

	return videoPub?.track ? (
		<div
			className={`participants ${
				isLocal ? "local-participant" : "remote-participant"
			}`}
		>
			<VideoRenderer track={videoPub.track} />
			<br />
			<span>{participant.identity}</span>
		</div>
	) : (
		<div
			className={`participants ${
				isLocal ? "local-participant" : "remote-participant"
			}`}
		>
			<br />

			<label className="participantNumber">{participantNumber}</label>
			<span>{participant.identity}</span>
		</div>
	);
}
