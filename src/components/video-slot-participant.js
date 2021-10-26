import { useParticipant, VideoRenderer } from "livekit-react";

export default function SlotParticipant({
	publishingVideo,
	participant,
	isLocal,
}) {
	let { publications } = useParticipant(participant);
	let nickname = JSON.parse(participant.metadata || "{}")?.nickname;
	let videoPub = publications.find((pub) => pub.kind === "video");

	if (videoPub && videoPub.track) {
		if (isLocal && !publishingVideo) {
			return <></>;
		}
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

	// return <>{nickname}</>;
}
