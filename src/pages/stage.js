import styled from "styled-components";
import { useRoom, useParticipant, VideoRenderer } from "livekit-react";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  RoomEvent,
  DataPacket_Kind,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { Microphone, Exit, Film } from "react-ikonate";
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from "react-dom";

const StageDiv = styled.div`
  position: fixed;
  display: block;
  width: 100%;
  height: 100%;

  div.streamTabs {
    display: flex;
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
`;

const VideoGrid = styled.div`
  display: flex;
  height: 70%;

  label.participantNumber {
    position: absolute;
    font-size: 5em;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  > div {
    position: relative;
    display: block;
    justify-self: stretch;
    align-self: stretch;

    span {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #000;
      font-size: 0.5em;
      color: white;
    }
  }

  > div.remote-participant {
    position: relative;
    display: flex;
    width: ${(p) => {
      let COL_COUNT = [
        1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 6, 6, 6, 6, 6,
      ];
      let numP = p.participants.filter((p) => !p.isLocal).length;
      return 100 / COL_COUNT[numP - 1];
    }}%;
    order: 2;

    video {
      position: absolute;
      object-fit: contain;
      width: 100%;
      height: 100%;
    }
  }

  div.participants {
    border: 1px solid black;
  }

  > div.local-participant {
    position: fixed;
    width: 50%;
    top: 50%;
    left: 0;
    transform: translate(0, -50%);

    video {
      object-fit: contain;
      width: 100%;
      height: 100%;
      border: 1px solid black;
    }
  }
`;

export default function Stage({ send, context, state, tabs }) {
  const { connect, room, participants, audioTracks } = useRoom();

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const [active, setActive] = useState([false, false]);

  const [renderState, setRenderState] = useState(0);

  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);

  function sendCurrentLayout(recipient) {
    if (room) {
      const strData = JSON.stringify({
        current_layout: context.current_layout,
      });
      const data = encoder.encode(strData);
      console.log({
        current_layout: context.current_layout,
      });
      room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE, [
        recipient,
      ]);
    }
  }

  useEffect(() => {
    console.log("room changed");
    if (room) {
      room.removeAllListeners(RoomEvent.DataReceived);
      room.on(RoomEvent.DataReceived, (payload, participant) => {
        const payloadStr = decoder.decode(payload);
        const payloadObj = JSON.parse(payloadStr);

        const requesterSid = participant.sid;

        if (payloadObj.action === "REQUEST_CURRENT_LAYOUT") {
          sendCurrentLayout(requesterSid);
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
    <StageDiv selected={localVideoTrackRef.current}>
      <VideoGrid participants={participants}>
        {participants
          .reduce((p, c) => {
            if (!p.find((_p) => _p.identity === c.identity)) {
              p.push(c);
            }
            return p;
          }, [])
          .map((participant, i, arr) => {
            return (
              <Participant
                participant={participant}
                participantNumber={i}
                totalParticipants={arr.length}
              />
            );
          })}
      </VideoGrid>
      <br />

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
                      console.log(track.trackSid);
                      send("INIT_LAYOUT_WITH_SELF", { sid: track.trackSid });
                    });
                }
              }
              setRenderState(renderState + 1);
            },
          },
          {
            tab: "end",
            icon: <Exit />,
            onClick: () => {
              room?.disconnect();
              send("DISCONNECT");
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
    </StageDiv>
  );
}

function Participant({ participant, participantNumber, totalParticipants }) {
  const { subscribedTracks, isLocal } = useParticipant(participant);

  const [videoPub, setVideoPub] = useState();

  // const currentGridLayout = videoGridLayout[totalParticipants];
  // console.log(currentGridLayout);

  useEffect(() => {
    let _pub;
    subscribedTracks.forEach((pub) => {
      if (pub.kind === "video") {
        _pub = pub;
      }
      setVideoPub(_pub);
    });
  }, [subscribedTracks]);

  useEffect(() => {
    if (videoPub?.setEnabled) {
      videoPub?.setEnabled(true);
    }
  }, [videoPub]);

  return videoPub?.track ? (
    <div
      className={`participants ${
        isLocal ? "local-participant" : "remote-participant"
      }`}
    >
      <VideoRenderer track={videoPub.track} />
      <br />
      <span>{participant.identity}</span>
    </div>
  ) : (
    <div
      className={`participants ${
        isLocal ? "local-participant" : "remote-participant"
      }`}
    >
      <br />

      <label className="participantNumber">{participantNumber}</label>
      <span>{participant.identity}</span>
    </div>
  );
}
