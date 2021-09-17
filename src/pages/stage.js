import styled from "styled-components";
import { useRoom, useParticipant, VideoRenderer } from "livekit-react";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  RoomEvent,
  DataPacket_Kind,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { Microphone, Exit, Film, ArrowUp, ArrowDown } from "react-ikonate";
import Button from "../components/button";

const StageDiv = styled.div`
  position: fixed;
  display: block;
  width: 100%;
  height: 100%;

  div.streamTabs {
    display: ${(p) => (p.drawerActive === true ? "none" : "flex")};
    justify-content: space-around;
    width: 80%;
    height: 3em;
    position: absolute;
    bottom: 5em;
    left: 50%;
    transform: translate(-50%, 0);
    border: 1px solid black;
    border-radius: 0.5em;

    > button {
      width: 100%;
      height: 100%;
      padding: 0.5em 0;
      appearance: none;
      border: none;
      border-right: 1px solid black;
      font-size: 1.5em;
      background: #eee;

      &:hover {
        background: #fafafa;

        &.active {
          background: #ccc;
        }
      }

      &.active {
        background: #ddd;
      }

      svg {
        stroke-linecap: round;
        stroke-width: 1.5;
      }

      &:first-child {
        border-top-left-radius: 0.3em;
        border-bottom-left-radius: 0.3em;
      }

      &:last-child {
        border: none;
        border-top-right-radius: 0.3em;
        border-bottom-right-radius: 0.3em;
      }
    }

    button.end {
      svg {
        stroke: red;
      }
    }

    button.activated {
      display: flex;
      align-items: center;
      justify-content: center;
      > span {
        width: 15px;
        height: 15px;
        background: #3df536;
        border-radius: 50%;
        display: block;
        margin-right: 0.1em;
      }
    }
  }

  > div.exitBG {
    display: none;

    div.exitModal {
      display: none;
    }

    div.active {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 1px solid black;
      background: white;
      position: fixed;
      width: 50%;
      height: 30%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      div {
        width: 100%;
        margin-top: 25px;
        display: inline-flex;
        justify-content: center;

        > button {
          padding: 5px;
          display: flex;
          justify-content: center;
          align-content: center;
          margin: 5px;

          > div {
            display: flex;
            justify-content: center;
            margin: 0;
            text-align: center;
          }
        }
      }
    }
  }

  > div.active {
    position: fixed;
    display: block;
    background: rgba(0, 0, 0, 0.3);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  div.drawer {
    position: fixed;
    display: flex;
    bottom: 0;
    right: 0;
    border: 1px solid black;
    font-size: 1.5em;
    padding: 0.2em 0.4em;
    background: white;

    :hover {
      background: #ddd;
      cursor: pointer;
    }
  }
`;

const VideoGrid = styled.div`
  position: relative;
  height: 0;
  width: 100%;
  padding-top: ${(9 / 16) * 100}%;
  box-sizing: border-box;

  label.participantNumber {
    position: absolute;
    font-size: 5em;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .videoSlot {
    border: 1px solid #aaa;
    position: absolute;

    video {
      background: #fefefe;
      width: 100%;
      height: 100%;
      position: absolute;
      object-fit: cover;
    }
  }
`;

export default function Stage({ send, context, state, tabs }) {
  const { connect, room, participants, audioTracks } = useRoom();
  let [drawerActive, setDrawerActive] = useState(false);

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const [active, setActive] = useState([false, false]);
  const [exit, setExit] = useState(false);
  const [renderState, setRenderState] = useState(0);
  const [availableVideoTracks, setAvailableVideoTracks] = useState([]);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);

  function sendCurrentLayout(recipient) {
    if (room) {
      const strData = JSON.stringify({
        current_layout: context.current_layout,
      });
      const data = encoder.encode(strData);
      room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE, [
        recipient,
      ]);
    }
  }

  useEffect(() => {
    let _tracks = participants.map((p) => {
      let track = null;
      p?.videoTracks.forEach((thisTrack) => {
        if (!track) {
          track = thisTrack;
        }
      });
      return track;
    });
    setAvailableVideoTracks(_tracks);
  }, [participants, room, renderState]);

  useEffect(() => {
    if (room) {
      room.removeAllListeners(RoomEvent.DataReceived);
      room.on(RoomEvent.DataReceived, (payload, participant) => {
        const payloadStr = decoder.decode(payload);
        const payloadObj = JSON.parse(payloadStr);

        const requesterSid = participant.sid;

        if (payloadObj.action === "REQUEST_CURRENT_LAYOUT") {
          sendCurrentLayout(requesterSid);
        }

        if (payloadObj.action === "UPDATE_LAYOUT") {
          send("UPDATE_LAYOUT", { layout: payloadObj.layout });
        }
      });
    }
  }, [room, context]);

  useEffect(() => {
    connect(process.env.REACT_APP_LIVEKIT_SERVER, context.token);
    return () => {
      room?.disconnect();
    };
  }, []);

  return (
    <StageDiv drawerActive={drawerActive}>
      <VideoGrid>
        {context.current_layout.slots.map((slot, i) => {
          return (
            <VideoSlot
              key={`slot_${i}_${slot?.track}`}
              slot={slot}
              availableVideoTracks={availableVideoTracks}
            />
          );
        })}
      </VideoGrid>

      <div className="streamTabs">
        {(tabs = [
          {
            tab: "mic",
            tabActive: active[0],
            icon: !localAudioTrackRef.current ? (
              <Microphone />
            ) : (
              <>
                <span></span>
                <Microphone />
              </>
            ),
            onClick: async () => {
              let _active = [...active];
              _active[0] = !active[0];
              setActive(_active);

              if (localAudioTrackRef.current) {
                room.localParticipant.unpublishTrack(
                  localAudioTrackRef.current
                );
                localAudioTrackRef.current = null;
              } else {
                localAudioTrackRef.current =
                  await createLocalAudioTrack().catch((err) => {
                    alert(err);
                  });
                if (localAudioTrackRef.current) {
                  room.localParticipant.publishTrack(
                    localAudioTrackRef.current
                  );
                }
              }
              setRenderState(renderState + 1);
            },
          },
          {
            tab: "video",
            tabActive: active[1],
            icon: !localVideoTrackRef.current ? (
              <Film />
            ) : (
              <>
                <span></span>
                <Film />
              </>
            ),
            onClick: async () => {
              let _active = [...active];
              _active[1] = !active[1];
              setActive(_active);

              if (localVideoTrackRef.current) {
                room.localParticipant.unpublishTrack(
                  localVideoTrackRef.current
                );
                localVideoTrackRef.current = null;
              } else {
                localVideoTrackRef.current =
                  await createLocalVideoTrack().catch((err) => {
                    alert(err);
                  });
                if (localVideoTrackRef.current) {
                  room.localParticipant
                    .publishTrack(localVideoTrackRef.current)
                    .then((track) => {
                      if (
                        !context.current_layout.slots.reduce((p, c) => {
                          return p || c.track;
                        }, null)
                      ) {
                        send("INIT_LAYOUT_WITH_SELF", { sid: track.trackSid });
                      }
                      setRenderState(renderState + 1);
                    });
                }
              }
            },
          },
          {
            tab: "end",
            icon: <Exit />,
            onClick: () => {
              setExit(true);
            },
          },
        ]).map(function ({ tab, icon, onClick, tabActive }, i) {
          let key = `key_${i}`;
          return (
            <button
              key={key}
              onClick={() => {
                onClick();
              }}
              className={`${tab} ${tabActive === true ? "activated" : ""}`}
            >
              {icon}
            </button>
          );
        })}
      </div>

      <div
        className={`exitBG ${exit === true ? "active" : ""}`}
        onClick={() => {
          setExit(false);
        }}
      >
        <div
          className={`exitModal ${exit === true ? "active" : ""}`}
          // onEsc={() => setExit(false)}
          // onClickOutside={() => setExit(false)}
        >
          Are you sure you want to exit?
          <div>
            <Button
              onClick={() => {
                room?.disconnect();
                send("DISCONNECT");
                setExit(false);
              }}
            >
              yes
            </Button>
            <Button
              onClick={() => {
                setExit(false);
              }}
            >
              no
            </Button>
          </div>
        </div>
      </div>
      <div
        className="drawer"
        onClick={() => {
          drawerActive === false
            ? setDrawerActive(true)
            : setDrawerActive(false);
        }}
      >
        {drawerActive === false ? <ArrowDown /> : <ArrowUp />}
      </div>
    </StageDiv>
  );
}

function VideoSlot({ slot, availableVideoTracks }) {
  const videoRef = useRef(null);

  const trackSid = slot?.track;

  useEffect(() => {
    let track = availableVideoTracks.find((t) => {
      return t?.track?.sid === trackSid;
    });
    if (videoRef.current && track?.track) {
      let el = videoRef.current;
      if (typeof track.track.attach === "function") {
        track.track.attach(el);
        console.log("x");
      }
      el.muted = true;
      el.play();
    }
  }, [trackSid, availableVideoTracks]);
  return (
    <div
      className="videoSlot"
      style={{
        width: `${slot.size[0]}%`,
        height: `${slot.size[1]}%`,
        top: `${slot.position[1]}%`,
        left: `${slot.position[0]}%`,
      }}
    >
      <video ref={videoRef} muted autoPlay key={trackSid} />
    </div>
  );
}
