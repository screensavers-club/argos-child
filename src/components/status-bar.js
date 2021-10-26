import styled from "styled-components";

import { useEffect, useState } from "react";
import moment from "moment";
import { Calendar, Time, Folder } from "react-ikonate";

export default function StatusBar({ context, room, version }) {
	let [time, setTime] = useState(moment());

	function renderTime() {
		return (
			<>
				<Calendar /> {time.format("ddd DD MMM")}
				<Time /> {time.format("hh:mm:ssA")}
			</>
		);
	}

	useEffect(() => {
		setTimeout(() => {
			setTime(moment());
		}, 1000);
	}, [time]);
	return (
		<Bar color={context.color}>
			<div className="left">
				<div className="roomColour" />
				{room ? room : "not connected"}
			</div>

			<div className="center">
				<img src="/ximi-logo.svg" alt="XIMI logo" />
			</div>

			<div className="right">
				<Folder /> v{version} {renderTime()}
			</div>
		</Bar>
	);
}

const Bar = styled.div`
	font-family: "Rubik";
	font-size: 10px;
	text-transform: uppercase;
	font-weight: 600;
	pointer-events: none;
	user-select: none;
	display: flex;
	background: #343439;
	color: white;
	align-items: center;
	padding: 4px 8px;
	box-sizing: border-box;
	height: 35px;
	position: relative;

	div.roomColour {
		background: ${(p) =>
			p.color.length > 0
				? `linear-gradient(135deg, ${p.color[0]}, ${p.color[1]})`
				: "#434349"};
		width: 12px;
		height: 12px;
		margin-right: 10px;
		border-radius: 50%;
	}

	div.left {
		width: 50%;
		display: flex;
		align-items: center;
	}

	div.right {
		width: 50%;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	div.center {
		position: absolute;
		left: 50%;
		top: 55%;
		transform: translate(-50%, -50%);

		img {
			width: 50px;
		}
	}

	svg {
		stroke-width: 1.5px;
		margin: 0 10px 0 20px;
		font-size: 14px;
	}
`;
