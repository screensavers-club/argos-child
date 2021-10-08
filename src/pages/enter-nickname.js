import axios from "axios";
import styled from "styled-components";
import { useRef, useState } from "react";
import Button from "../components/button";
import "../animate.min.css";
import Key from "../components/keys";
import { ArrowLeft, Delete, Cancel, ArrowRight, User } from "react-ikonate";

const Page = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background: #252529;
	height: calc(100% - 35px);

	div.buttonBox {
		display: flex;
		width: calc(100% - 120px);
		top: 110px;
		position: fixed;
		justify-content: space-between;
	}

	div.nick_input {
		display: flex;
		flex-direction: column;
		text-align: center;
		margin-bottom: 30px;

		label {
			font-size: 18px;
			font-weight: 600;
			color: white;
		}

		span {
			font-size: 13px;
			font-weight: normal;
			color: white;
		}

		div.header {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
		}

		div.nicknameSection {
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
				font-family: "Noto Sans", sans-serif;
				font-style: normal;
				font-weight: normal;
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
	}
`;

const Keyboard = styled.div`
	display: grid;
	grid-template-columns: repeat(10, 1fr);
	grid-column-gap: 20px;
	grid-row-gap: 10px;
	width: 500px;
	flex-wrap: wrap;
	justify-content: center;
	margin-bottom: 1em;

	div.bsp {
		grid-column: 9 / span 2;
	}
`;

export default function EnterNickname({ send, context }) {
	let keys_string =
		"1 2 3 4 5 6 7 8 9 0 Q W E R T Y U I O P A S D F G H J K L clr Z X C V B N M bsp";

	const keys = keys_string.split(" ");

	let [nickname, setNickname] = useState("");
	const inputRef = useRef();

	function shakeNicknameScreen() {
		inputRef.current.classList.add("animate__animated", "animate__shakeX");
		window.setTimeout(() => {
			inputRef.current?.classList?.remove(
				"animate__animated",
				"animate__shakeX"
			);
		}, 2000);
	}

	return (
		<Page>
			<div className={`nick_input`}>
				<label>Enter nickname</label>
				<span>up to 5 letters</span>
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

					<div className="nicknameSection" ref={inputRef}>
						<User />
						<input
							id="nickname_box"
							ref={inputRef}
							type="text"
							value={nickname.toUpperCase()}
							onChange={(e) => {
								setNickname(e.target.value.slice(0, 5));
							}}
							// style={{
							// 	borderLeft: `${
							// 		nickname.length < 1 ? "1px solid red" : "1px solid black"
							// 	}`,
							// }}
						/>
					</div>
					<Button
						variant="navigation"
						type="primary"
						icon={<ArrowRight />}
						onClick={() => {
							if (nickname.length < 1) {
								shakeNicknameScreen();
							} else {
								send("ENTER_STAGE", {
									nickname: nickname,
								});
							}
						}}
					>
						Enter
					</Button>
				</div>
			</div>

			<Keyboard>
				{keys.map((key, i) => {
					let _key = `key_+${i}`;
					return (
						<Key
							k={key === "bsp" ? <Delete /> : key === "clr" ? <Cancel /> : key}
							variant="keyboard"
							key={_key}
							type={
								key === "clr" ? "cancel" : key === "bsp" ? "long" : "default"
							}
							className={`keys ${
								key === "clr" ? "clr" : key === "bsp" ? "bsp" : ""
							} `}
							onClick={() => {
								if (key === "bsp") {
									setNickname(nickname.slice(0, -1));
								} else if (key === "clr") {
									setNickname(nickname.slice(0, -5));
								} else {
									setNickname((nickname + key).slice(0, 5));
								}
							}}
						/>
					);
				})}
			</Keyboard>
		</Page>
	);
}
