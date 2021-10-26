import { useParticipant, VideoRenderer } from "livekit-react";

export default function SlotParticipant({ participant, isLocal }) {
	let { publications } = useParticipant(participant);
	let nickname = JSON.parse(participant.metadata || "{}")?.nickname;
	let videoPub = publications.find((pub) => pub.kind === "video");
	if (isLocal) {
		console.log(videoPub, videoPub?.track);
	}

	if (videoPub && videoPub.track) {
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
