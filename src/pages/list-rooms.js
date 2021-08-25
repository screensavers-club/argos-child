import styled from "styled-components";
import Button from "../components/button";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";

import { Refresh, Camera } from "react-ikonate";
import axios from "axios";

const WebcamComponent = () => <Webcam />;

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

  > button {
    display: block;
    padding: auto;
    margin: 0.5em auto;
    width: 40%;
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
`;

export default function ListRooms({ context, send, state }) {
  let [roomList, setRoomList] = useState([]);
  let [webcam, setWebcam] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_PEER_SERVER}/rooms`).then((result) => {
      setRoomList(result.data);
    });
  }, []);

  console.log(webcam);
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

      <Button
        icon={<Refresh />}
        onClick={() => {
          axios
            .get(`${process.env.REACT_APP_PEER_SERVER}/rooms`)
            .then((result) => {
              setRoomList(result.data);
            });
        }}
      >
        Refresh rooms
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
        Test Webcam
      </Button>

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
          >
            Close
          </Button>
        </div>
      ) : (
        <div style={{ background: "#fff", opacity: "1", zIndex: "0" }}></div>
      )}
    </StyledPage>
  );
}
