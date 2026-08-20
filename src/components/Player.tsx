import { ActionIcon } from "@mantine/core";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { FC, useEffect, useRef, useState } from "react";

export const Player: FC<{ url: string }> = ({ url }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleEnded = () => setPlaying(false);

    audio.load();
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audioRef.current = null;
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [url]);

  return (
    <ActionIcon
      variant="filled"
      color="gray"
      size="xl"
      onClick={() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) audio.pause();
        else void audio.play();
      }}
    >
      {playing ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
    </ActionIcon>
  );
};
