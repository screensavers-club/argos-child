import { AudioRenderer } from "livekit-react";
import { Fragment, useEffect, useState } from "react";
import { VolumeLoud } from "react-ikonate";
import styled from "styled-components";

export default function AudioMix({
	mix,
	participants,
	context,
	audioTracks = [],
}) {
	const [mutedTracks, setMutedTracks] = useState([]);
	const [trackNames, setTrackNames] = useState([]);
	useEffect(() => {
		const remoteAudioTracks = participants
			.map((p) => {
				let _nick = JSON.parse(p.metadata || "{}")?.nickname;
				return { ...p, nick: _nick };
			})
			.filter((p) => {
				return p.nick && p.nick !== context.nickname;
			})
			.reduce((p, c) => {
				let tracks = Array.from(c.audioTracks, ([key, track]) => {
					return { trackSid: track.trackSid, nickname: c.nick };
				});
				return [...p, ...tracks];
			}, []);
		setTrackNames(remoteAudioTracks);

		const mutedTrackSids = remoteAudioTracks
			.filter((t) => mix?.mute?.indexOf(t.nickname) > -1)
			.map((t) => t.trackSid);

		setMutedTracks(mutedTrackSids);

		audioTracks.forEach((track) => {
			const currentlyEnabled = track.mediaStreamTrack.enabled;
			console.log({ currentlyEnabled });
			if (mutedTrackSids.indexOf(track.sid) > -1 && currentlyEnabled) {
				console.log(`disabling ${track.sid}`);
				track.stop();
			} else if (mutedTrackSids.indexOf(track.sid) < 0 && !currentlyEnabled) {
				console.log(`enabling ${track.sid}`);
				track.start();
			}
		});
	}, [mix, context.nickname, participants]);

	return (
		<div>
			<AudioIndicator>
				<VolumeLoud />{" "}
				{audioTracks.map((track) => {
					const nick = trackNames.find(
						(t) => t.trackSid === track.sid
					)?.nickname;
					if (mutedTracks.indexOf(track.sid) > -1) {
						return <s>{nick}</s>;
					} else {
						return <b>{nick}</b>;
					}
				})}
			</AudioIndicator>

			{audioTracks.map((track) => {
				return <AudioRenderer key={track.sid} track={track} isLocal={false} />;
			})}
		</div>
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

	s,
	b {
		margin-left: 0.5em;
		font-weight: normal;
		position: relative;
		display: inline-block;

		& + b,
		& + s {
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
