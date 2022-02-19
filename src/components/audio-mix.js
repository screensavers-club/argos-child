import { AudioRenderer } from "livekit-react";
import { Fragment } from "react";
import { VolumeLoud } from "react-ikonate";
import styled from "styled-components";

export default function AudioMix({ mix, participants, context }) {
	const remoteAudioTracks = participants
		.filter((p) => {
			let _nick = JSON.parse(p.metadata || "{}")?.nickname;
			return _nick && _nick !== context.nickname;
		})
		.reduce((p, c) => {
			let _nick = JSON.parse(c.metadata || "{}")?.nickname;
			let tracks = Array.from(c.audioTracks, ([key, track]) => {
				return { ...track, nickname: _nick };
			});
			if (Array.isArray(mix?.mute) && mix?.mute?.indexOf(_nick) < 0) {
				tracks.forEach((track) => {
					if (typeof track.setEnabled === "function") {
						track.setEnabled(true);
					}
				});
				return [...p, ...tracks];
			} else {
				tracks.forEach((track) => {
					if (typeof track.setEnabled === "function") {
						track.setEnabled(false);
					}
				});
				return p;
			}
		}, []);

	return (
		<AudioIndicator>
			<div style={{ width: "100%" }}>
				<VolumeLoud />
				{participants
					.filter((p) => {
						let _nick = JSON.parse(p.metadata || "{}")?.nickname;
						let muted =
							Array.isArray(mix?.mute) && mix.mute?.indexOf(_nick) >= 0;
						let publishingAudio = p.audioTracks.size > 0;
						return (
							_nick && _nick !== context.nickname && !muted && publishingAudio
						);
					})
					.map((p) => {
						let _nick = JSON.parse(p.metadata || "{}")?.nickname;
						return <b>{_nick}</b>;
					})}
			</div>

			<div style={{ fontSize: "10px" }}>
				[A.R]{" "}
				{remoteAudioTracks.map((pub) => {
					if (pub.track) {
						return (
							<Fragment key={pub.trackSid}>
								<span>
									/ {pub.nickname} {pub.track.isMuted ? "[M]" : "[ ]"}{" "}
									{pub.track.streamState ? "[S]" : "[ ]"}
								</span>
								<AudioRenderer key={pub.trackSid} track={pub.track} />
							</Fragment>
						);
					} else {
						return false;
					}
				})}
			</div>
		</AudioIndicator>
	);
}

const AudioIndicator = styled.div`
	color: white;
	font-weight: normal;
	font-size: 1rem;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	flex-wrap: wrap;
	position: fixed;
	bottom: 16px;
	left: 16px;
	z-index: 3;

	b {
		margin-left: 0.5em;
		font-weight: normal;
		position: relative;
		display: inline-block;

		& + b {
			&:before {
				content: "/";
				margin-right: 0.5em;
			}
		}
	}
	svg {
		font-size: 1.2rem;
	}
`;
