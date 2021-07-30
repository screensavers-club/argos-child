import styled from "styled-components";
import Button from "../components/button";
import React, { useEffect, useState } from "react";

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
    </StyledPage>
  );
}
