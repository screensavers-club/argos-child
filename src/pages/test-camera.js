import styled from "styled-components";
import { useRoom, useParticipant } from "livekit-react";

import React, { useEffect, useRef, useState } from "react";
import { Microphone } from "react-ikonate";
import { Exit } from "react-ikonate";
import { Film } from "react-ikonate";
import { Phone } from "react-ikonate";
import { VolumeOff } from "react-ikonate";
import { Controls } from "react-ikonate";
import axios from "axios";

import Button from "../components/button";
import { ArrowRightCircle } from "react-ikonate";
import { ArrowLeftCircle } from "react-ikonate";
import { Delete } from "react-ikonate";
import { Cancel } from "react-ikonate";

import Webcam from "react-webcam";

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
`;

const VideoGrid = styled.div`
  display: grid;
  height: 70%;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;

  grid-gap: 0.3em;

  > div {
    position: relative;
    display: block;
    justify-self: stretch;
    align-self: stretch;

    span {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #000;
      font-size: 7px;
      color: white;
    }
  }

  > div.remote-participant {
    video {
      position: absolute;
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }

  > div.local-participant {
    width: 100%;
    grid-column: 1 / span 2;
    grid-row: 1 / span 3;
    video {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
`;

const Main = styled.div`
  width: 100%;
  height: 100%;
  padding: 0.3em;

  > button {
    display: block;
    margin: auto;
    padding: auto;
    margin-bottom: 0.3em;
  }

  div.streamTabs {
    display: flex;
    justify-content: space-around;
    width: 80%;
    height: 3em;
    position: absolute;
    bottom: 1em;
    left: 50%;
    transform: translate(-50%, 0);
    border: 1px solid black;
    border-radius: 0.5em;

    > button {
      width: 100%;
      height: 100%;
      padding: 0.5em 0;
      appearance: none;
      border: none;
      border-right: 1px solid black;
      font-size: 1.5em;

      &:hover {
        background: #ddd;

        &.active {
          background: #888;
        }
      }

      &.active {
        background: #aaa;
      }

      svg {
        stroke-linecap: round;
        stroke-width: 1.5;
      }

      &:first-child {
        border-top-left-radius: 0.3em;
        border-bottom-left-radius: 0.3em;
      }

      &:last-child {
        border: none;
        border-top-right-radius: 0.3em;
        border-bottom-right-radius: 0.3em;
      }
    }
  }
`;

export default function TestCamera({ send, context, state, tabs }) {
  const { connect, isConnecting, room, error, participants, audioTracks } =
    useRoom();

  // const [passcode, setPasscode] = useState("");

  const [localVideoTrack, setLocalVideoTrack] = useState();
  const [cam, setCam] = useState(false);
  useEffect(async () => {
    connect(process.env.REACT_APP_LIVEKIT_SERVER, context.token);
    // _room.on(RoomEvent.TrackPublished, handleNewTrack);
    return () => {
      console.log("disconnecting");
      room.disconnect();
    };
  }, []);

  return (
    <Main>
      <button
        onClick={() => {
          send("TEST_COMPLETE", room);
        }}
      >
        GG Go Next
      </button>

      <button
        onClick={() => {
          return setCam(true);
        }}
      >
        Test Cam
      </button>

      {cam === true ? <Webcam /> : <></>}
    </Main>
  );
}
