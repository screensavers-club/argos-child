import styled from "styled-components";
import Button from "../components/button";
import React, { useRef, useState } from "react";
import axios from "axios";
import "../animate.min.css";

const StyledPage = styled.div`
  display: block;
  margin: auto;
  padding: auto;
  text-align: center;

  div.roomName {
    display: block;
    margin-top: 7%;
  }

  div.nameBox {
    position: relative;
    text-align: center;
    border: 1px solid black;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 45%;
    padding: 25px;
    margin: auto;
    font-size: 1.5rem;

    > Button {
      position: absolute;
      right: 0;
      height: 100%;
      box-shadow: none;
      border: none;
      border-radius: 0;
      width: 50px;
      margin-bottom: 0;
    }
  }

  Button {
    display: block;
    margin: auto;
    padding: auto;
    height: 50px;
    width: 200px;
    margin: 25px auto;
  }

  div.roomName ~ h3 {
    margin-top: 50px;
  }

  div.password {
    display: flex;
    margin: 25px;
    align-items: center;
    justify-content: center;
  }

  div.passwordBox {
    border: 1px solid black;
    padding: 25px;
    margin: 12.5px;
    width: 45%;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    width: 10px;
    position: absolute;
    text-align: center;
    font-size: 1em;
  }

  input,
  select {
    font-size: 2em;
    border-style: none;
    width: 45%;
    height: auto;
    border: 1px solid black;
    &::placeholder {
      color: grey;
    }
  }

  div.buttonBox {
    display: block;
    margin: auto;
    padding: auto;
  }

  div.keyboard {
    margin: auto;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    width: 50%;
    border: 1px solid black;
  }

  div.key {
    width: auto;
    border: 1px solid black;
    padding: 20px;
    text-align: center;

    &:hover {
      background: #ddd;
      cursor: pointer;
      border: 1px solid black;
    }
  }

  p {
    padding: 0;
    margin: 0;
  }

  h3 {
    padding: 0;
    margin: 0;
  }
`;

export default function EnterPassword({ send, context, state }) {
  const [passcode, setPasscode] = useState("");
  const inputRef = useRef();

  function shakePasswordScreen() {
    inputRef.current.classList.add("animate__animated", "animate__shakeX");
    window.setTimeout(() => {
      inputRef.current.classList.remove("animate__animated", "animate__shakeX");
    }, 2000);
  }

  function tryJoinRoom() {
    return axios
      .post(`${process.env.REACT_APP_PEER_SERVER}/parent/room/join`, {
        room: context.joining_room,
        identity: context.identity,
        passcode: passcode,
      })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err.response.data);
        if (
          err.response.data.err ==
          "Wrong passcode provided for room banana-citrus"
        ) {
          shakePasswordScreen();
        }
      });
  }

  return (
    <StyledPage>
      <div className="password">
        <input
          type="password"
          pattern="[0-9]*"
          inputMode="numeric"
          ref={inputRef}
          value={passcode}
          placeholder="enter password"
          onChange={(e) => {
            setPasscode(e.target.value.slice(0, 5));
          }}
        />
      </div>

      <div className="keyboard">
        {[
          { k: "1" },
          { k: "2" },
          { k: "3" },
          { k: "4" },
          { k: "5" },
          { k: "6" },
          { k: "7" },
          { k: "8" },
          { k: "9" },
          { k: "del" },
          { k: "0" },
          { k: "enter" },
        ].map(function ({ k }, i) {
          let key = "key_" + i;

          return (
            <div
              className="key"
              key={key}
              onClick={() => {
                if (k === "del") {
                  setPasscode(passcode.slice(0, -1));
                } else if (k === "enter") {
                  tryJoinRoom();
                } else {
                  if (passcode.length < 5) {
                    setPasscode(`${passcode}${k}`);
                  }
                }
              }}
            >
              {k}
            </div>
          );
        })}
      </div>

      <div className="buttonBox">
        <Button
          onClick={() => {
            send("RESET");
          }}
        >
          Back
        </Button>
      </div>
    </StyledPage>
  );
}
