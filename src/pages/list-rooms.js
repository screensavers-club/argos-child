import styled from "styled-components";
import Button from "../components/button";
import React, { useEffect, useRef, useState } from "react";

import { Refresh } from "react-ikonate";
import axios from "axios";

const StyledPage = styled.div`
  display: block;
  margin: auto;
  padding: auto;
  text-align: center;

  div.availableRooms {
    display: block;
    margin: auto;
    margin-top: 7%;
    padding: auto;

    > button {
      margin: 0.5em 0;
    }
  }
`;

export default function ListRooms({ context, send, state }) {
  let [roomList, setRoomList] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_PEER_SERVER}/rooms`).then((result) => {
      setRoomList(result.data);
    });
  }, []);
  return (
    <StyledPage>
      <div className="availableRooms">
        <h3>Available Rooms</h3>
        {roomList.map((room) => (
          <Button
            key={room.name}
            variant="full-width"
            onClick={() => {
              send("REQUEST_JOIN_ROOM", room);
            }}
          >
            {room.name}
          </Button>
        ))}
      </div>
      <div className="buttonBox">
        <Button
          icon={<Refresh />}
          onClick={() => {
            axios
              .get(`${process.env.REACT_APP_PEER_SERVER}/rooms`)
              .then((result) => {
                setRoomList(result.data);
                console.log(result);
              });
          }}
        >
          Refresh rooms
        </Button>
      </div>
      <MicTest />
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
    console.log(activeNodes);

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
      <MicTestButton
        onClick={() => {
          setShowModal(!showModal);
        }}
      >
        mic
      </MicTestButton>
      {showModal && (
        <MicTestModal>
          <div style={{ border: "1px solid #ccc", width: "200px" }}>
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
  button {
    margin: 3px 0;
  }
`;
const MicTestButton = styled.div`
  position: absolute;
  right: 20px;
`;
