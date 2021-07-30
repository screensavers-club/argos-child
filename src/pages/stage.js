import styled from "styled-components";
import { useRoom, useParticipant, VideoRenderer } from "livekit-react";
import { createLocalVideoTrack, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { Microphone } from "react-ikonate";
import { Exit } from "react-ikonate";
import { Film } from "react-ikonate";
import { Phone } from "react-ikonate";
import { VolumeOff } from "react-ikonate";
import { Controls } from "react-ikonate";

const StageDiv = styled.div`
  width: 100%;
  height: 100%;
  padding: 0.3em;

  > button {
    display: block;
    margin: auto;
    padding: auto;
    margin-bottom: 0.3em;
  }

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

  const [localVideoTrack, setLocalVideoTrack] = useState();
  console.log(localVideoTrack);
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
        {/* <div className="localVideo">
          {localVideoTrack?.track && (
            <VideoRenderer track={localVideoTrack.track} />
          )}
        </div> */}
        {participants
          .reduce((p, c) => {
            if (!p.find((_p) => _p.identity === c.identity)) {
              p.push(c);
            }
            return p;
          }, [])
          .map((participant) => {
            console.log(typeof participant);
            return <Participant participant={participant} />;
          })}
      </VideoGrid>
      <br />

      <div className="streamTabs">
        {(tabs = [
          { tab: "mic", icon: <Microphone /> },
          { tab: "volume", icon: <VolumeOff /> },
          {
            tab: "video",
            icon: (
              <Film
                onClick={async () => {
                  const videoTrack = await createLocalVideoTrack();
                  room.localParticipant.publishTrack(videoTrack);
                  setLocalVideoTrack(videoTrack);
                }}
              />
            ),
            classes: {
              className: `${localVideoTrack ? "active" : "normal"}`,
            },
          },
          { tab: "end", icon: <Exit /> },
          { tab: "call", icon: <Phone /> },
          { tab: "controls", icon: <Controls /> },
        ]).map(function ({ tab, icon, classes }, i) {
          let key = `key_${i}`;
          return (
            <button key={key} {...classes}>
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
