import styled from "styled-components";
import Button from "../components/button";
import React, { useRef, useState } from "react";
import axios from "axios";
import "../animate.min.css";
import { set } from "lodash";

import Key from "../components/keys";

import { ArrowRight, ArrowLeft, Delete, Cancel, Lock } from "react-ikonate";

const StyledPage = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	background: #252529;
	height: calc(100% - 35px);

	label {
		color: white;
		font-size: 18px;
		font-weight: 600;
		margin: 0;
	}

	h3.joiningRoom {
		margin: 0;
		background: ${(p) =>
			`-webkit-linear-gradient(135deg, ${p.color[0]}, ${p.color[1]})`};
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	div.passwordSection {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		background: #434349;
		border-radius: 100px;
		width: 265px;
		height: 56px;
		margin: 10px 90px;

		svg {
			stroke-width: 1.5px;
			font-size: 36px;
			stroke: white;
			margin: 0 15px;
			stroke-linecap: "round";
			stroke-linejoin: "round";
		}

		input::-webkit-outer-spin-button,
		input::-webkit-inner-spin-button {
			-webkit-appearance: none;
			margin: 0;
			width: 10px;
			position: absolute;
			text-align: center;
		}

		input,
		select {
			padding-left: 15px;
			font-family: Noto Sans;
			font-style: normal;
			font-weight: 600;
			background: none;
			font-size: 36px;
			color: white;
			border-style: none;
			width: 165px;
			height: 75%;
			border-left: 1px solid white;
			outline: none;
		}
	}

	div.header {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	div.keyboard {
		display: grid;
		margin-top: 5px;
		grid-template-columns: 1fr 1fr 1fr;
		grid-row-gap: 10px;
		grid-column-gap: 30px;
	}
`;

export default function EnterPassword({ send, context, state, icon }) {
	const [passcode, setPasscode] = useState("");
	const inputRef = useRef();

	function shakePasswordScreen() {
		inputRef.current.classList.add("animate__animated", "animate__shakeX");
		window.setTimeout(() => {
			inputRef.current?.classList?.remove(
				"animate__animated",
				"animate__shakeX"
			);
		}, 2000);
	}

	function tryJoinRoom() {
		return axios
			.post(`${process.env.REACT_APP_PEER_SERVER}/child/room/join`, {
				room: context.joining_room,
				identity: context.identity,
				passcode: passcode,
				nickname: context.nickname,
			})
			.then((result) => {
				send("JOIN_ROOM_WITH_TOKEN", {
					token: result.data.token,
					room: { name: context.joining_room },
				});
			})
			.catch((err) => {
				if (err.response.data.err.indexOf("Wrong passcode provided") > -1) {
					shakePasswordScreen();
				}
				console.log(err.response);
			});
	}

	return (
		<StyledPage color={context.color}>
			<label>Enter password for</label>
			<h3 className="joiningRoom">{context.joining_room}</h3>
			<div className="header">
				<Button
					variant="navigation"
					icon={<ArrowLeft />}
					onClick={() => {
						send("BACK");
					}}
				>
					Back
				</Button>

				<div className="passwordSection" ref={inputRef}>
					<Lock />
					<input
						type="password"
						pattern="[0-9]*"
						inputMode="numeric"
						value={passcode}
						onChange={(e) => {
							setPasscode(e.target.value.slice(0, 5));
						}}
					/>
				</div>
				<Button
					variant="navigation"
					type="primary"
					icon={<ArrowRight />}
					onClick={() => {
						tryJoinRoom();
					}}
				>
					Enter
				</Button>
			</div>

			<div className="keyboard">
				{[
					{ k: "1" },
					{ k: "2" },
					{ k: "3" },
					{ k: "4" },
					{ k: "5" },
					{ k: "6" },
					{ k: "7" },
					{ k: "8" },
					{ k: "9" },
					{ k: "cancel" },
					{ k: "0" },
					{ k: "del" },
				].map(function ({ k }, i) {
					let key = "key_" + i;

					return (
						<Key
							className="key"
							type={k === "cancel" ? "cancel" : ""}
							variant="numpad"
							k={k === "del" ? <Delete /> : k === "cancel" ? <Cancel /> : k}
							key={k}
							onClick={() => {
								if (k === "cancel") {
									setPasscode(passcode.slice(0, -5));
								} else if (k === "del") {
									setPasscode(passcode.slice(0, -1));
								} else if (passcode.length < 5) {
									setPasscode(`${passcode}${k}`);
								}
							}}
						/>
					);
				})}
			</div>
		</StyledPage>
	);
}
