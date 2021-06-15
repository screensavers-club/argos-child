import { useEffect, useRef, useState } from "react";
import "./App.css";
import Peer from "peerjs";

function App() {
  let [peer, setPeer] = useState(false);
  let [conn, setConn] = useState();
  let [mediaStream, setMediaStream] = useState(false);
  let [connectedToPeer, setConnectedToPeer] = useState();
  let [connectedToParent, setConnectedToParent] = useState(false);
  let videoRef = useRef();

  function callParent() {
    if (!peer) {
      return;
    }

    peer.call("parent", mediaStream);
  }

  function connectToParent() {
    let _conn = peer.connect("parent");
    setConn(_conn);

    _conn.on("open", () => {
      console.log("connected");
      setConnectedToParent(true);
    });

    _conn.on("close", () => {
      setConnectedToParent(false);
    });
  }

  function startVideo() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        setMediaStream(stream);
        videoRef.current.srcObject = stream;
        // videoRef.current.play();
      })
      .catch((err) => {
        alert(err);
      });
  }

  useEffect(() => {
    let _peer = new Peer({
      // host: "localhost",
      host: "192.168.86.204",
      port: "9000",
      debug: 2,
      path: "/peerjs/myapp",
    });
    setPeer(_peer);

    _peer.on("open", (id) => {
      // console.log("my id is " + id);
      setConnectedToPeer(true);
    });

    _peer.on("close", () => {
      setConnectedToPeer(false);
    });

    _peer.on("disconnected", () => {
      setConnectedToPeer(false);
    });

    return function cleanup() {
      _peer.disconnect();
    };
  }, []);

  return (
    <div className="App">
      {mediaStream ? (
        <video ref={videoRef} autoPlay={true} muted={true} />
      ) : (
        <>
          <button onClick={startVideo}>Start Video</button>
        </>
      )}
      <br />

      {connectedToPeer ? (
        connectedToParent ? (
          mediaStream && connectedToParent ? (
            <button onClick={callParent}>Start Transmitting</button>
          ) : (
            <></>
          )
        ) : (
          <button onClick={connectToParent}>Connect To Parent Node</button>
        )
      ) : (
        <button
          onClick={() => {
            peer.reconnect();
          }}
        >
          Reconnect
        </button>
      )}
    </div>
  );
}

export default App;
