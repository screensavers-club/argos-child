import { useParticipant, VideoRenderer } from "livekit-react";
import { Fragment } from "react";

export default function SlotParticipant({
	publishingVideo,
	participant,
	isLocal,
	flip,
}) {
	let { publications } = useParticipant(participant);
	let videoPub = publications.find((pub) => pub.kind === "video");

	if (videoPub && videoPub.track) {
		if (isLocal && !publishingVideo) {
			return <></>;
		}
		return (
			<Fragment key={videoPub.trackSid}>
				<span
					style={{
						color: "white",
						position: "absolute",
						bottom: 0,
						right: 0,
						zIndex: "3",
						fontSize: "10px",
					}}
				>
					streamstate: {videoPub.track.streamState}
					<br />
					simulcasted: {videoPub.simulcasted ? "yes" : "no"}
					<br />
				</span>
				<VideoRenderer
					key={`${videoPub.trackSid}_${videoPub.track.streamState}_${
						flip ? "f" : "n"
					}`}
					track={videoPub.track}
					isLocal={isLocal}
				/>
			</Fragment>
		);
	} else {
		return <></>;
	}

	// return <>{nickname}</>;}
}
