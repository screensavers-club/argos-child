import styled from "styled-components";

const PeersWrapper = styled.div`
  width: 100px;
  height: 100%;
  border: 1px solid;
`;

const ParentWrapper = styled.div``;

const ChildWrapper = styled.div``;

function Parent({ peer }, i) {
  return (
    <ParentWrapper>
      {peer.id}
      {new Array(peer.connection_quality).fill("⭐").join("")}
    </ParentWrapper>
  );
}

function Child({ peer }) {
  return (
    <ChildWrapper>
      {peer.id} <ConnIndicator quality={peer.connection_quality} />
    </ChildWrapper>
  );
}

function ConnIndicator({ quality = 0 }) {
  return (
    <div
      style={{
        width: "50px",
        height: "10px",
        background: "#fff",
        border: "1px solid #000",
        borderRadius: "5px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: quality * 10 + "px",
          height: "10px",
          background: "green",
        }}
      ></div>
    </div>
  );
}

export default function PeerList({ peers }) {
  return (
    <PeersWrapper>
      <div className="peers">
        <label>Peers</label>
      </div>
      {peers.map((peer, i) => {
        if (peer.role === "parent") {
          return <Parent peer={peer} />;
        } else {
          return <Child peer={peer} />;
        }
      })}
    </PeersWrapper>
  );
}
