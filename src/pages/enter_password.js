import styled from "styled-components";
import Button from "../components/button";
import React, { useState } from "react";

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
    height: 100px;
    width: 200px;
    margin-bottom: 25px;
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
    font-size: 3em;
    border-style: none;
    width: 45%;
    height: auto;
    border: 1px solid black;
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
    padding: 25px;
    text-align: center;

    &:hover {
      background: #ddd;
      cursor: pointer;
      border: 1px solid black;
    }
  }
`;

export default function EnterPassword({ roomName, resetClick, joinRoom }) {
  let [input, setInput] = useState("");
  return (
    <StyledPage>
      <div className="room">
        <h3>{roomName}</h3>
      </div>
      <h3>Enter password</h3>
      <div className="password">
        <input
          className="passInput"
          type="password"
          pattern="[0-9]*"
          inputmode="numeric"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
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
                  setInput(input.slice(0, -1));
                } else if (k === "enter") {
                  console.log(input);
                  joinRoom();
                } else {
                  setInput(`${input}${k}`);
                }
              }}
            >
              {k}
            </div>
          );
        })}
      </div>

      <div className="buttonBox">
        <Button onClick={joinRoom}>Go</Button>
        <Button onClick={resetClick}>Back</Button>
      </div>
    </StyledPage>
  );
}
