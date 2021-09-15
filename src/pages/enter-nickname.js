import styled from "styled-components";
import { useRef, useState } from "react";
import Button from "../components/button";
import {
  ArrowLeftCircle,
  Delete,
  Cancel,
  ArrowRightCircle,
} from "react-ikonate";

const Page = styled.div`
  margin-top: 1.7em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  div.nick_input {
    display: flex;
    flex-direction: column;
    text-align: center;
    margin-bottom: 1em;

    label {
      margin-bottom: 1em;
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

    input {
      font-size: 2em;
      border-style: none;
      width: 100%;
      height: auto;
      border: 1px solid black;
      &::placeholder {
        color: grey;
      }
    }
  }
`;

const Keyboard = styled.div`
  display: flex;
  width: 740px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1em;

  div.keys {
    display: flex;
    font-size: 1.5em;
    border: 1px solid black;
    width: 2em;
    height: 1em;
    padding: 0.3em;
    margin: 0.1em;
    justify-content: center;
    align-items: center;
    text-align: center;

    ~ .clr,
    ~ .ent {
      width: 3.45em;
    }

    ~ .ent {
      background: black;
    }
  }
`;

export default function EnterNickname({ send, context }) {
  let keys_string =
    "1 2 3 4 5 6 7 8 9 0 q w e r t y u i o p a s d f g h j k l bsp z x c v b n m clr ent";

  const keys = keys_string.split(" ");

  let [nickname, setNickname] = useState("");

  return (
    <Page>
      <div className={`nick_input`}>
        <label for="nickname_box">Enter Your Initials</label>
        <input
          id="nickname_box"
          type="text"
          value={nickname}
          onChange={(e) => {
            console.log(e.target.value);
            setNickname(e.target.value.slice(0, 5));
          }}
        />
      </div>

      <Keyboard>
        {keys.map((key, i) => {
          return (
            <div
              className={`keys ${
                key === "clr" ? "clr" : key === "ent" ? "ent" : ""
              } `}
              onClick={() => {
                console.log(key);
                if (key === "bsp") {
                  setNickname(nickname.slice(0, -1));
                } else if (key === "clr") {
                  setNickname(nickname.slice(0, -5));
                } else if (key === "ent") {
                  send("ENTER_STAGE");
                } else {
                  setNickname((nickname + key).slice(0, 5));
                }
              }}
            >
              {key === "bsp" ? (
                <Delete />
              ) : key === "clr" ? (
                <Cancel style={{ stroke: "red" }} />
              ) : key === "ent" ? (
                <ArrowRightCircle style={{ stroke: "white" }} />
              ) : (
                key
              )}
            </div>
          );
        })}
      </Keyboard>

      <Button
        icon={<ArrowLeftCircle />}
        onClick={() => {
          send("BACK");
        }}
      >
        Back To Rooms
      </Button>
    </Page>
  );
}
