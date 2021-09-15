import styled from "styled-components";
import { useRef, useState } from "react";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Keyboard = styled.div`
  display: flex;
  width: 560px;
  flex-wrap: wrap;
  justify-content: space-around;
  div.keys {
    border: 1px solid black;
    width: 2em;
    height: 1em;
    padding: 0.5em;
    margin: 0.15em;
    text-align: center;

    ~ .long {
      width: 4em;
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
      <div className="nick_input">
        <input
          type="text"
          // ref={inputRef}
          value={nickname}
          placeholder="enter your initials"
          onChange={(e) => {
            setNickname(e.target.value.slice(0, 5));
          }}
        />
      </div>

      <Keyboard>
        {keys.map((key, i) => {
          return (
            <div
              className={`keys ${
                key === "clr" || key === "ent" ? "long" : ""
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
                  setNickname(nickname + key);
                }
              }}
            >
              {key}
            </div>
          );
        })}
      </Keyboard>
    </Page>
  );
}
