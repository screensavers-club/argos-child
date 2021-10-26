import { AudioRenderer } from "livekit-react";
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
				return track;
			});
			if (Array.isArray(mix.mute) && mix.mute?.indexOf(_nick) < 0) {
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
	console.log(remoteAudioTracks);
	return (
		<AudioIndicator>
			<VolumeLoud />
			{participants
				.filter((p) => {
					let _nick = JSON.parse(p.metadata || "{}")?.nickname;
					let muted = Array.isArray(mix.mute) && mix.mute?.indexOf(_nick) >= 0;
					return _nick && _nick !== context.nickname && !muted;
				})
				.map((p) => {
					let _nick = JSON.parse(p.metadata || "{}")?.nickname;
					return <b>{_nick}</b>;
				})}
			{remoteAudioTracks.map((pub) => {
				if (pub.track) {
					return <AudioRenderer key={pub.trackSid} track={pub.track} />;
				} else {
					return false;
				}
			})}
		</AudioIndicator>
	);
}

const AudioIndicator = styled.div`
	color: white;
	font-weight: normal;
	font-size: 1rem;
	display: flex;
	align-items: center;
	justify-content: center;
	position: fixed;
	bottom: 16px;
	left: 16px;

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
