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

  let [audioStream, setAudioStream] = useState(null);

  useEffect(() => {
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
    }
    if (audioStream) {
      audioSourceNode.current =
        audioCtx.current.createMediaStreamSource(audioStream);
      audioSourceNode.current.connect(audioCtx.current.destination);
      analyzer.current = new AnalyserNode(audioCtx.current, {
        fftSize: 32,
        maxDecibels: 0,
        minDecibels: -60,
        smoothingTimeConstant: 0.6,
      });

      audioSourceNode.current.connect(analyzer.current);
      var bufferLength = analyzer.current.frequencyBinCount;
      analyzerDataArray.current = new Uint8Array(bufferLength);

      function step() {
        analyzer.current.getByteFrequencyData(analyzerDataArray.current);
        let sum = analyzerDataArray.current.reduce((p, c) => {
          return p + c;
        }, 0);
        let l = Math.max(0, Math.min(1, sum / 256));
        if (volBarRef.current) {
          volBarRef.current.style.width = l * 200 + "px";
        }

        requestAnimationFrame(step);
      }
      step();
    }
  }, [audioStream]);

  async function getMic() {
    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setAudioStream(stream);
    } catch (err) {
      console.log(err);
    }
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
          <button>Toggle HPF</button>
          <button>Toggle LPF</button>
          <button>Toggle BAND 1</button>
          <button>Toggle HPF</button>
          <button>Toggle HPF</button>
          <button>Toggle HPF</button>
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
