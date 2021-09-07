import styled from "styled-components";
import {
  useRoom,
  useParticipant,
  VideoRenderer,
  AudioRenderer,
} from "livekit-react";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  RoomEvent,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import {
  Microphone,
  Mute,
  Exit,
  Film,
  Phone,
  VolumeOff,
  Controls,
} from "react-ikonate";

const StageDiv = styled.div`
  width: 100%;
  height: 100%;
  padding: 0.3em;

  div.streamTabs {
    display: flex;
    justify-content: space-around;
    width: 80%;
    height: 3em;
    position: absolute;
    bottom: 1em;
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

      &:hover {
        background: #ddd;

        &.active {
          background: #888;
        }
      }

      &.active {
        background: #aaa;
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
  }
`;

const VideoGrid = styled.div`
  display: grid;
  height: 70%;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;

  grid-gap: 0.3em;

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
      font-size: 7px;
      color: white;
    }
  }

  > div.remote-participant {
    video {
      position: absolute;
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }

  > div.local-participant {
    width: 100%;
    grid-column: 1 / span 2;
    grid-row: 1 / span 3;
    video {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
`;

export default function Stage({ send, context, state, tabs }) {
  const { connect, isConnecting, room, error, participants, audioTracks } =
    useRoom();

  // console.log(connect);
  console.log(room);

  const [localVideoTrack, setLocalVideoTrack] = useState();

  const [renderState, setRenderState] = useState(0);

  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);

  useEffect(async () => {
    connect(process.env.REACT_APP_LIVEKIT_SERVER, context.token);
    // _room.on(RoomEvent.TrackPublished, handleNewTrack);
    return () => {
      console.log("disconnecting");
      room.disconnect();
    };
  }, []);

  return (
    <StageDiv>
      <VideoGrid>
        {/*  if no local participant, render an empty rect */}
        {participants
          .reduce((p, c) => {
            if (!p.find((_p) => _p.identity === c.identity)) {
              p.push(c);
            }
            return p;
          }, [])
          .map((participant) => {
            return <Participant participant={participant} />;
          })}
      </VideoGrid>
      <br />

      <div className="streamTabs">
        {(tabs = [
          {
            tab: "mic",
            icon: !localAudioTrackRef.current ? <Microphone /> : <Mute />,
            onClick: async () => {
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
            tab: "volume",
            icon: <VolumeOff />,
          },
          {
            tab: "video",
            icon: localVideoTrackRef.current ? <Film /> : <>No video</>,
            onClick: async () => {
              console.log(localVideoTrackRef.current);
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
                  room.localParticipant.publishTrack(
                    localVideoTrackRef.current
                  );
                }
              }
              setLocalVideoTrack(localVideoTrackRef.current);
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
          { tab: "call", icon: <Phone /> },
          { tab: "controls", icon: <Controls /> },
        ]).map(function ({ tab, icon, onClick }, i) {
          let key = `key_${i}`;
          return (
            <button key={key} onClick={onClick}>
              {icon}
            </button>
          );
        })}
      </div>
    </StageDiv>
  );
}

function Participant({ participant }) {
  const { subscribedTracks, isLocal } = useParticipant(participant);

  const [videoPub, setVideoPub] = useState();

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
    <div className={isLocal ? "local-participant" : "remote-participant"}>
      <VideoRenderer track={videoPub.track} />
      <br />

      <span>{participant.identity}</span>
    </div>
  ) : (
    <></>
  );
}
