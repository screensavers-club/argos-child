import styled from "styled-components";
import Button from "../components/button";
import Card from "../components/cards";

import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";

import {
	Rotate,
	Camera,
	Microphone,
	Maximise,
	Close,
	User,
} from "react-ikonate";
import axios from "axios";
import "../animate.min.css";

const StyledPage = styled.div`
	display: flex;
	text-align: center;
	height: calc(100% - 35px);
	background: #252529;

	div.availableRooms {
		position: relative;
		left: 0;
		display: block;
		padding: 40px 50px;
		width: 100%;
		box-sizing: border-box;

		> div.rooms {
			display: flex;
			overflow-y: scroll;
			overflow-x: hidden;
			width: 100%;

			flex-wrap: wrap;
			align-items: flex-start;

			> button {
				margin: 10px;
			}
		}

		> div.header {
			display: flex;
			align-content: center;
			margin-bottom: 25px;

			svg.refreshButton {
				margin: auto 0;
				stroke-width: 1.5px;
				stroke: white;
				font-size: 36px;

				:hover {
					cursor: pointer;
				}
			}

			.animate_rotate {
				-webkit-animation: rotate 0.5s linear infinite;
				-moz-animation: rotate 0.5s linear infinite;
				animation: rotate 0.5s linear infinite;

				@-moz-keyframes rotate {
					100% {
						-moz-transform: rotate(360deg);
					}
				}
				@-webkit-keyframes rotate {
					100% {
						-webkit-transform: rotate(360deg);
					}
				}
				@keyframes rotate {
					100% {
						-webkit-transform: rotate(360deg);
						transform: rotate(360deg);
					}
				}
			}

			h3 {
				margin: 0;
				font-family: Rubik;
				font-style: normal;
				font-weight: normal;
				font-size: 36px;
				line-height: 49px;
				color: #ffffff;
				text-align: left;
				margin-right: 25px;
			}
		}
	}

	div.webcamDiv {
		> button {
			position: fixed;
			z-index: "5";
			bottom: 5%;
			left: 50%;
			transform: translate(-50%, 0);
		}

		> video {
			position: fixed;
			left: 50%;
			top: 20%;
			transform: translate(-50%, 0);
			width: 25em;
			height: calc((9 / 16) * 25em);
			object-fit: cover;
		}
	}

	div.functionPanel {
		margin: 25px;
		padding: 25px;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		width: ${(1 / 3) * 100}%;
		height: calc(100%-35px);
		box-sizing: border-box;

		> button {
			margin: 6px;
		}
	}
`;

export default function ListRooms({ send }) {
	let [roomList, setRoomList] = useState([]);
	let [webcam, setWebcam] = useState(false);

	const animateRef = useRef();

	function rotateIcon() {
		animateRef.current.classList.add("animate_rotate");
		window.setTimeout(() => {
			animateRef.current?.classList?.remove("animate_rotate");
		}, 500);
	}

	useEffect(() => {
		axios.get(`${process.env.REACT_APP_PEER_SERVER}/rooms`).then((result) => {
			setRoomList(result.data);
		});
	}, []);
	return (
		<StyledPage>
			<div className="availableRooms">
				<div className="header">
					<h3>Available Rooms</h3>
					<Rotate
						className="refreshButton"
						ref={animateRef}
						onClick={() => {
							rotateIcon();
							axios
								.get(`${process.env.REACT_APP_PEER_SERVER}/rooms`)
								.then((result) => {
									setRoomList(result.data);
								});
						}}
					/>
				</div>
				<Rooms roomList={roomList} send={send} />
			</div>

			<div className="functionPanel">
				<Button
					icon={<Maximise />}
					onClick={function toggleFullscreen() {
						let elem = document.getElementById("App");

						if (!document.fullscreenElement) {
							elem.requestFullscreen().catch((err) => {
								alert(
									`Error attempting to enable full-screen mode: ${err.message} (${err.name})`
								);
							});
						} else {
							document.exitFullscreen();
						}
					}}
				>
					Fullscreen
				</Button>

				<Button
					icon={<Camera />}
					onClick={() => {
						if (webcam === false) {
							setWebcam(true);
						} else if (webcam === true) {
							setWebcam(false);
						}
					}}
				>
					Test Cam
				</Button>
				<MicTest />

				{webcam === true ? (
					<div className="webcamDiv">
						<div
							className="emptyBG"
							style={{
								background: "#000",
								opacity: "0.5",
								position: "fixed",
								top: "0",
								left: "0",
								width: "100%",
								height: "100%",
								zIndex: "0",
							}}
						></div>
						<Webcam />

						<Button
							onClick={() => {
								setWebcam(false);
							}}
							icon={<Close />}
						>
							Close
						</Button>
					</div>
				) : (
					<div style={{ background: "#fff", opacity: "1", zIndex: "0" }}></div>
				)}
			</div>
		</StyledPage>
	);
}

function MicTest() {
	let [showModal, setShowModal] = useState(false);
	let audioCtx = useRef();
	let analyzer = useRef();
	let volBarRef = useRef();
	let analyzerDataArray = useRef();
	let raf = useRef();
	let audioSourceNode = useRef();

	// High pass filter
	let hpf = useRef();
	let lpf = useRef();
	let lsf = useRef();
	let hsf = useRef();
	let band1 = useRef();
	let band2 = useRef();
	let band3 = useRef();

	const chain = [hpf, lsf, band1, band2, band3, hsf, lpf];
	const [showFilters, setShowFilters] = useState(chain.map((x) => false));

	let [audioStream, setAudioStream] = useState(null);

	useEffect(() => {
		if (!audioCtx.current) {
			audioCtx.current = new AudioContext();
		}
		if (audioStream) {
			audioSourceNode.current =
				audioCtx.current.createMediaStreamSource(audioStream);
			audioSourceNode.current.connect(audioCtx.current.destination);
			// analyzer.current = new AnalyserNode(audioCtx.current, {
			//   fftSize: 32,
			//   maxDecibels: 0,
			//   minDecibels: -60,
			//   smoothingTimeConstant: 0.6,
			// });

			// audioSourceNode.current.connect(analyzer.current);
			// var bufferLength = analyzer.current.frequencyBinCount;
			// analyzerDataArray.current = new Uint8Array(bufferLength);

			// function step() {
			//   analyzer.current.getByteFrequencyData(analyzerDataArray.current);
			//   let sum = analyzerDataArray.current.reduce((p, c) => {
			//     return p + c;
			//   }, 0);
			//   let l = Math.max(0, Math.min(1, sum / 256));
			//   if (volBarRef.current) {
			//     volBarRef.current.style.width = l * 200 + "px";
			//   }

			//   requestAnimationFrame(step);
			// }
			// step();
		}
	}, [audioStream]);

	function updateNodeConnections() {
		chain.forEach((node) => {
			if (typeof node.disconnect === "function") {
				node.disconnect();
			}
		});
		let activeNodes = chain.filter((c) => !!c.current);
		if (activeNodes.length > 0) {
			activeNodes.forEach((_, i) => {
				if (i == 0) {
					audioSourceNode.current.connect(activeNodes[i].current);
				} else {
					activeNodes[i - 0].current.connect(activeNodes[i].current);
				}
			});
			activeNodes[activeNodes.length - 1].current.connect(
				audioCtx.current.destination
			);
		} else {
			audioSourceNode.current.connect(audioCtx.current.destination);
		}

		setShowFilters(chain.map((c) => !!c.current));
	}

	async function getMic() {
		try {
			let stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1,
					sampleRate: 16000,
					sampleSize: 16,
					echoCancellation: false,
				},
				video: false,
			});
			setAudioStream(stream);
		} catch (err) {
			console.log(err);
		}
	}

	function toggleHPF() {
		if (!audioCtx.current || !audioStream) {
			return;
		}
		if (!hpf.current) {
			hpf.current = new BiquadFilterNode(audioCtx.current, {
				frequency: 2000,
				type: "highpass",
			});
		} else {
			// set reference to null so the BiquadFilterNode will be destroyed by JavaScript
			hpf.current.disconnect();
			hpf.current = null;
		}
		updateNodeConnections();
	}

	function toggleHSF() {
		if (!audioCtx.current || !audioStream) {
			return;
		}
		if (!hsf.current) {
			hsf.current = new BiquadFilterNode(audioCtx.current, {
				frequency: 8000,
				type: "highshelf",
				gain: 3,
			});
		} else {
			// set reference to null so the BiquadFilterNode will be destroyed by JavaScript
			hsf.current.disconnect();
			hsf.current = null;
		}
		updateNodeConnections();
	}
	function toggleBand1() {
		if (!audioCtx.current || !audioStream) {
			return;
		}
		if (!band1.current) {
			band1.current = new BiquadFilterNode(audioCtx.current, {
				frequency: 200,
				type: "peaking",
				gain: 3,
				q: 1,
			});
		} else {
			// set reference to null so the BiquadFilterNode will be destroyed by JavaScript
			band1.current.disconnect();
			band1.current = null;
		}
		updateNodeConnections();
	}
	function toggleBand2() {
		if (!audioCtx.current || !audioStream) {
			return;
		}
		if (!band2.current) {
			band2.current = new BiquadFilterNode(audioCtx.current, {
				frequency: 500,
				type: "peaking",
				gain: 3,
				q: 1,
			});
		} else {
			// set reference to null so the BiquadFilterNode will be destroyed by JavaScript
			band2.current.disconnect();
			band2.current = null;
		}
		updateNodeConnections();
	}
	function toggleBand3() {
		if (!audioCtx.current || !audioStream) {
			return;
		}
		if (!band3.current) {
			band3.current = new BiquadFilterNode(audioCtx.current, {
				frequency: 1000,
				type: "peaking",
				gain: 3,
				q: 1,
			});
		} else {
			// set reference to null so the BiquadFilterNode will be destroyed by JavaScript
			band3.current.disconnect();
			band3.current = null;
		}
		updateNodeConnections();
	}
	function toggleLPF() {
		if (!audioCtx.current || !audioStream) {
			return;
		}
		if (!lpf.current) {
			lpf.current = new BiquadFilterNode(audioCtx.current, {
				frequency: 300,
				type: "lowpass",
			});
		} else {
			// set reference to null so the BiquadFilterNode will be destroyed by JavaScript
			lpf.current.disconnect();
			lpf.current = null;
		}
		updateNodeConnections();
	}
	function toggleLSF() {
		if (!audioCtx.current || !audioStream) {
			return;
		}
		if (!lsf.current) {
			lsf.current = new BiquadFilterNode(audioCtx.current, {
				frequency: 100,
				type: "lowshelf",
				gain: 3,
			});
		} else {
			// set reference to null so the BiquadFilterNode will be destroyed by JavaScript
			lsf.current.disconnect();
			lsf.current = null;
		}
		updateNodeConnections();
	}

	return (
		<>
			<Button
				icon={<Microphone />}
				onClick={() => {
					setShowModal(!showModal);
				}}
			>
				Test Mic
			</Button>
			{showModal && (
				<MicTestModal>
					<div
						style={{
							border: "1px solid #ccc",
							width: "200px",
						}}
					>
						<div
							ref={volBarRef}
							style={{ height: "20px", background: "green", width: "0" }}
						></div>
					</div>
					<button onClick={getMic}>Get Mic</button>
					<button onClick={toggleHPF}>
						Toggle HPF ({showFilters[0] ? "on" : "off"})
					</button>
					<button onClick={toggleLSF}>
						Toggle LSF ({showFilters[1] ? "on" : "off"})
					</button>
					<button onClick={toggleBand1}>
						Toggle BAND 1 ({showFilters[2] ? "on" : "off"})
					</button>
					<button onClick={toggleBand2}>
						Toggle BAND 2 ({showFilters[3] ? "on" : "off"})
					</button>
					<button onClick={toggleBand3}>
						Toggle BAND 3 ({showFilters[4] ? "on" : "off"})
					</button>
					<button onClick={toggleHSF}>
						Toggle HSF ({showFilters[5] ? "on" : "off"})
					</button>
					<button onClick={toggleLPF}>
						Toggle LPF ({showFilters[6] ? "on" : "off"})
					</button>
					<button
						onClick={() => {
							setShowModal(!showModal);
						}}
					>
						Close
					</button>
				</MicTestModal>
			)}
		</>
	);
}

const MicTestModal = styled.div`
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30px;
	border: 2px solid #000;
	position: fixed;
	width: 400px;
	top: 50%;
	left: 50%;
	transform: translate3d(-50%, -50%, 0);
	background: white;
	button {
		margin: 3px 0;
	}
`;
const MicTestButton = styled.div`
	position: absolute;
	right: 20px;
`;

function Rooms({ roomList, send }) {
	let colors = {
		"#FD3832": [
			"apple",
			"plum",
			"date",
			"berry",
			"wolfberry",
			"peach",
			"tomato",
		],
		"#C5F321": [
			"lime",
			"pear",
			"watermelon",
			"kiwi",
			"melon",
			"honeydew",
			"olive",
		],
		"#F9EEA0": ["lychee", "guava", "melon", "banana", "quince"],
		"#FCAB1D": [
			"orange",
			"mango",
			"apricot",
			"persimmon",
			"kumquat",
			"papaya",
			"loquat",
			"pineapple",
			"longan",
			"jackfruit",
		],
		"#5D0AEA": ["grape", "fig", "prune"],
	};

	return (
		<div className="rooms">
			{roomList.map((room) => {
				const fruits = room.room.split("-");
				const colorPair = fruits.map((fruit) => {
					return Object.keys(colors).find((hex) => {
						return colors[hex].indexOf(fruit) > -1;
					});
				});
				return (
					<Card
						icon={<User />}
						participants={room.children.length}
						gradient={`linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})`}
						key={room.room}
						onClick={() => {
							send("REQUEST_JOIN_ROOM", {
								room: { name: room.room },
								colorPair,
							});
						}}
					>
						{room.room}
					</Card>
				);
			})}
		</div>
	);
}
