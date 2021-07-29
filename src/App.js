import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import AppFrame from "./components/app-frame";
import StatusBar from "./components/status-bar";
import VideoFrame from "./components/video-frame";
import TabBar from "./components/tab-bar";
import PeerList from "./components/peers";
import { People } from "react-ikonate";
import styled from "styled-components";
import RoomStart from "./pages/room_start";
import Error from "./pages/error";
import SelectRooms from "./pages/select_room";
import EnterPassword from "./pages/enter_password";
import StreamRoom from "./pages/stream_room";

import _ from "lodash";

import { useMachine } from "@xstate/react";
import argosChildMachine from "./argos-child-machine.js";
import { inspect } from "@xstate/inspect";
import Button from "./components/button";

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

// const Button = styled.div`

// background: red;

// :hover{
//   cursor: pointer;
// }

// `

function App() {
  let peer;

  let [state, send] = useMachine(argosChildMachine, {
    devTools:
      process.env.NODE_ENV === "development" && typeof window !== "undefined",
  });

  let [pw, setPw] = useState("");
  let [number, setNumber] = useState();
  console.log(number);
  return (
    <div className="App">
      <AppFrame>
        <StatusBar room={_.get(state, "context.room.name")} />
        <Screen state={state.value} context={state.context} />
        {state.value === "start" ? (
          <RoomStart
            joinRoomInput={() => {
              send("JOIN_ROOM");
            }}
          />
        ) : (
          <></>
        )}

        {state.value === "error" ? (
          <>
            <Error
              resetClick={() => {
                send("RESET");
              }}
              error={_.get(state, "context.error.message")}
            />
          </>
        ) : (
          <></>
        )}

        {state.value === "select_room" ? (
          <SelectRooms
            roomName={_.get(state, "context.room.name")}
            resetClick={() => {
              send("RESET");
            }}
            gotoEnterPassword={() => {
              send("ROOM_SELECTED");
            }}
          />
        ) : (
          <></>
        )}

        {state.value === "enter_password" ? (
          <EnterPassword
            roomName={_.get(state, "context.room.name")}
            resetClick={() => {
              send("RESET");
            }}
            joinRoom={() => {
              send("JOIN_ROOM");
            }}
          />
        ) : (
          <></>
        )}

        {state.value === "stream_room" ? (
          <StreamRoom
            roomName={_.get(state, "context.room.name")}
            resetClick={() => {
              send("RESET");
            }}
          />
        ) : (
          <></>
        )}

        {state.value === "error" ? (
          <>
            <Error
              resetClick={() => {
                send("RESET");
              }}
              error={_.get(state, "context.error.message")}
            />
          </>
        ) : (
          <></>
        )}
        {/* {state.value === "assigned_room_name" ? (
          <>
            <input
              type="text"
              onChange={(e) => setPw(e.target.value)}
              value={pw}
              room={pw}
            />
            <button
              onClick={() => {
                send("SET_PASSWORD", { password: pw });
              }}
            >
              Create Room
            </button>
          </>
        ) : (
          <></>
        )}*/}
      </AppFrame>
    </div>
  );
}

function IncomingVideo({ stream }) {
  let ref = useRef();
  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
      ref.current.play();
    }
  }, [ref, stream]);
  return (
    <div>
      <video ref={ref} autoPlay={true} width="400" />
    </div>
  );
}

export default App;

function Screen({ context, state }) {
  console.log(state);
  switch (state) {
    case "start":
      return <CreateRoomScreen />;
  }
  return <div></div>;
}

function CreateRoomScreen() {
  return <div></div>;
}
