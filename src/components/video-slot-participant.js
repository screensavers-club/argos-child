import { useParticipant, VideoRenderer } from "livekit-react";

export default function SlotParticipant({
	publishingVideo,
	participant,
	isLocal,
}) {
	let { publications } = useParticipant(participant);
	let videoPub = publications.find((pub) => pub.kind === "video");

	if (videoPub && videoPub.track) {
		if (isLocal && !publishingVideo) {
			return <></>;
		}
		console.log({
			sid: videoPub.trackSid,
			track: videoPub.track,
			isLocal,
			nick: JSON.parse(participant.metadata || "{}")?.nickname,
		});
		return (
			<VideoRenderer
				key={videoPub.trackSid}
				track={videoPub.track}
				isLocal={isLocal}
			/>
		);
	} else {
		return <></>;
	}

	// return <>{nickname}</>;}
}
