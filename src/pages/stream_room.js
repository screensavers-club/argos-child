import styled from "styled-components";
import Button from "../components/button";
import React, { useState } from "react";
import micSVG from "../svg/mic";
import volumeSVG from "../svg/volume";
import videoSVG from "../svg/video";
import callSVG from "../svg/call";
import optionsSVG from "../svg/options";
import endCall from "../svg/endCall";

const StyledPage = styled.div`
  display: block;
  margin: auto;
  padding: auto;
  text-align: center;

  div.callButtons {
    position: absolute;
    border: 1px solid black;
    border-radius: 10px;
    display: inline-flex;
    padding: auto;
    margin: 25px auto;
    width: auto;
    justify-content: center;
    align-items: center;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 0);

    div.button {
      text-align: center;
      padding: 20px;
      border: none;
      margin: 0;
      width: 50px;
      border: 1px solid black;
      border-left: none;
      border-top: none;
      border-bottom: none;

      &:hover {
        background: grey;
      }
    }

    div:first-child {
      border-radius: 10px 0 0 10px;
    }

    div:last-child {
      border-radius: 0 10px 10px 0;
      border: none;
    }
  }

  div.stream {
    border: 1px solid black;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 2fr;
    margin: 25px;
    margin-bottom: 100px;
    padding: 0;
  }

  div.userVideoWrapper {
    width: 100%;
    height: 0;
    padding-top: ${(100 * 9) / 16}%;
    position: relative;
    box-sizing: border-box;
  }

  div.userVideo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 1px solid blue;
  }

  div.otherUsersVideoWrapper {
    width: 100%;
    height: 0;
    padding-top: ${(100 * 9) / 16}%;
    position: relative;
    box-sizing: border-box;
    margin: auto;
  }

  div.otherUsersVideo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 1px solid red;
  }

  div.connectionStatus {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    padding: 5px;
  }

  .dot {
    height: 10px;
    width: 10px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    background: limegreen;
    margin: 2px;
  }
`;

export default function StreamRoom({ resetClick }) {
  return (
    <StyledPage>
      <div className="stream">
        <div className="otherUsersVideoWrapper">
          <div className="otherUsersVideo"></div>
        </div>
        <div className="userVideoWrapper">
          <div className="userVideo">
            <div className="connectionStatus">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="callButtons">
        {[
          { button: micSVG(), onClick: "" },
          { button: volumeSVG(), onClick: "" },
          { button: videoSVG(), onClick: "" },
          { button: endCall(), onClick: resetClick },
          { button: callSVG(), onClick: "" },
          { button: optionsSVG(), onClick: "" },
        ].map(function ({ button, onClick }, i) {
          let key = `key_${i}`;
          return (
            <div className="button" onClick={onClick}>
              {button}
            </div>
          );
        })}
      </div>
    </StyledPage>
  );
}
