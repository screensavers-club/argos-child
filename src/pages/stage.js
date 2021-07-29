import styled from "styled-components";
import { useRoom, useParticipant, VideoRenderer } from "livekit-react";
import { createLocalVideoTrack, RoomEvent } from "livekit-client";
import { useEffect, useRef, useState } from "react";

const StageDiv = styled.div`
  width: 100%;
  height: 100%;
`;

export default function Stage({ send, context, state }) {
  const { connect, isConnecting, room, error, participants, audioTracks } =
    useRoom();

  const [localVideoTrack, setLocalVideoTrack] = useState();

  useEffect(async () => {
    connect(process.env.REACT_APP_LIVEKIT_SERVER, context.token);
    // _room.on(RoomEvent.TrackPublished, handleNewTrack);
  }, []);

  return (
    <StageDiv>
      stage
      {isConnecting ? "connecting" : "-"}
      <button
        onClick={async () => {
          const videoTrack = await createLocalVideoTrack();
          room.localParticipant.publishTrack(videoTrack);
          setLocalVideoTrack(videoTrack);
        }}
      >
        Test
      </button>
      <div>
        {localVideoTrack?.track && (
          <VideoRenderer track={localVideoTrack.track} />
        )}
      </div>
      <div style={{ display: "flex" }}>
        {participants.map((participant) => {
          return <Participant participant={participant} />;
        })}
      </div>
      <br />
    </StageDiv>
  );
}

function Participant({ participant }) {
  const { subscribedTracks } = useParticipant(participant);

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

  return (
    <div style={{ width: "50%" }}>
      {videoPub?.track && <VideoRenderer track={videoPub.track} />}
    </div>
  );
}
