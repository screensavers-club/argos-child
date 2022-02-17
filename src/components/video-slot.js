import { useState } from "react";
import styled from "styled-components";
import SlotParticipant from "./video-slot-participant";

export default function VideoSlot({
	slot,
	participants,
	context,
	publishingVideo,
}) {
	const nickname = slot.participant?.nickname;
	const isLocal = nickname === context.nickname;
	const participant = participants.find((p) => {
		return nickname === JSON.parse(p.metadata || "{}")?.nickname;
	});
	const [flip, setFlip] = useState(false);

	return (
		<Slot
			style={
				slot.size && slot.position
					? {
							width: `${slot.size[0]}%`,
							height: `${slot.size[1]}%`,
							top: `${slot.position[1]}%`,
							left: `${slot.position[0]}%`,
					  }
					: {}
			}
			flip={flip}
			onClick={() => {
				setFlip(!flip);
			}}
		>
			{participant && (
				<SlotParticipant
					publishingVideo={publishingVideo}
					participant={participant}
					isLocal={isLocal}
				/>
			)}
			<label className="nickname">{nickname}</label>
		</Slot>
	);
}

const Slot = styled.div`
	position: absolute;
	background: linear-gradient(
		115deg,
		rgba(10, 10, 27, 1) 15%,
		rgba(42, 43, 47, 1) 100%
	);

	video {
		background: #252529;
		width: 100%;
		height: 100%;
		position: absolute;
		z-index: 2;
		object-fit: cover;
		transform: ${(p) => (p.flip ? "scaleX(1)" : "scaleX(-1)")};
	}

	label {
		position: absolute;
		z-index: 3;
		color: #fff;
		background: rgba(0, 0, 3, 0.2);
	}
`;
