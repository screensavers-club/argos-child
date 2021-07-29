import styled from "styled-components";

import { Box } from "react-ikonate";
import ArgosSymbol from "../argos-symbol.svg";
import { useEffect, useState } from "react";
import moment from "moment";

export default function StatusBar({ room }) {
  let [time, setTime] = useState(moment());

  function renderTime() {
    return time.format("ddd hh:mm:ssA");
  }

  useEffect(() => {
    setTimeout(() => {
      setTime(moment());
    }, 1000);
  }, [time]);
  return (
    <Bar>
      <div className="left">
        <img src={ArgosSymbol} style={{ width: "18px", margin: "5px" }} />
        {room ? room : "not connected"}
        {/* <Box scale={0.8} /> */}
      </div>
      <div className="right">{renderTime()}</div>
    </Bar>
  );
}

const Bar = styled.div`
  pointer-events: none;
  user-select: none;
  display: flex;
  background: #000;
  color: white;
  align-items: center;
  padding: 4px 8px;
  box-sizing: border-box;

  div.left {
    width: 50%;
    display: flex;
    align-items: center;
  }

  div.right {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
`;
