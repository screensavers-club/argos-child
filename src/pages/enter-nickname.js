import styled from "styled-components";

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

  return (
    <Keyboard>
      {keys.map((key, i) => {
        return (
          <div
            className={`keys ${key === "clr" || key === "ent" ? "long" : ""} `}
            onClick={() => {
              console.log(key);
            }}
          >
            {key}
          </div>
        );
      })}
    </Keyboard>
  );
}
