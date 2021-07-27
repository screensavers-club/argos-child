import styled from "styled-components";
import Button from "../components/button";
import React, { useState } from "react";

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

    > Button {
      box-shadow: none;
      border: 1px solid black;
      border-radius: 0;
      margin-bottom: 25px;
      width: 45%;
    }
  }

  Button {
    display: block;
    margin: auto;
    padding: auto;
    height: 100px;
    width: 200px;
    margin-bottom: 25px;
  }

  div.buttonBox {
    display: block;
    margin: auto;
    padding: auto;
  }
`;

export default function SelectRooms({
  roomName,
  resetClick,
  gotoEnterPassword,
}) {
  return (
    <StyledPage>
      <div className="availableRooms">
        <h3>Available Rooms</h3>
        <Button onClick={gotoEnterPassword}>{roomName}</Button>
      </div>
      <div className="buttonBox">
        <Button onClick={resetClick}>Back</Button>
      </div>
    </StyledPage>
  );
}
