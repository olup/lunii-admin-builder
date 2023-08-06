import { ActionIcon } from "@mantine/core";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

export const Player: FC<{ url: string }> = ({ url }) => {
  const [audio] = useState(new Audio());
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    audio.src = url;
    audio.load();
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("ended", () => setPlaying(false));

    return () => {
      audio.pause();
      audio.removeEventListener("play", () => setPlaying(true));
      audio.removeEventListener("pause", () => setPlaying(false));
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  }, [url]);

  return (
    <ActionIcon
      variant="outline"
      color="gray"
      size="xl"
      onClick={() => {
        playing ? audio.pause() : audio.play();
      }}
    >
      {playing ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
    </ActionIcon>
  );
};
