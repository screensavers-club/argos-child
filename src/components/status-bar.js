import styled from "styled-components";

import { useEffect, useState } from "react";
import moment from "moment";
import { Calendar, Time, Folder } from "react-ikonate";

export default function StatusBar({ room, version }) {
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
		<Bar>
			<div className="left">
				<div
					style={{
						background: "#434349",
						width: "12px",
						height: "12px",
						marginRight: "10px",
						borderRadius: "50%",
					}}
				/>
				{room ? room : "not connected"}
			</div>
			<div className="right">
				<Folder /> v{version} {renderTime()}
			</div>
		</Bar>
	);
}

const Bar = styled.div`
	font-family: "Noto Sans";
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

	svg {
		stroke-width: 1.5px;
		margin: 0 10px 0 20px;
		font-size: 14px;
	}
`;
