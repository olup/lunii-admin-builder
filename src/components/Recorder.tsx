import { ActionIcon, Box, Flex, Space } from "@mantine/core";
import {
  IconPlayerPauseFilled,
  IconPlayerRecordFilled,
  IconPlayerStopFilled,
  IconRefresh,
} from "@tabler/icons-react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Player } from "./Player";
import { FC, useEffect } from "react";
import { modals } from "@mantine/modals";

const actionIconProps = {
  variant: "filled",
  color: "blue",
  size: "xl",
};

export const Recorder: FC<{ onRecorded?: (url: string) => void }> = ({
  onRecorded,
}) => {
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearBlobUrl,
    mediaBlobUrl,
    status,
  } = useReactMediaRecorder({
    audio: true,
    video: false,
    blobPropertyBag: {
      type: "audio/wav",
    },
  });

  useEffect(() => {
    if (status === "stopped" && onRecorded && mediaBlobUrl) {
      onRecorded(mediaBlobUrl!);
    }
  }, [status, mediaBlobUrl, onRecorded]);

  return (
    <Box>
      <Flex>
        {status === "idle" && (
          <ActionIcon onClick={startRecording} {...actionIconProps}>
            <IconPlayerRecordFilled />
          </ActionIcon>
        )}
        {status === "recording" && (
          <Flex>
            <ActionIcon onClick={pauseRecording} {...actionIconProps}>
              <IconPlayerPauseFilled />
            </ActionIcon>
            <Space w={10} />
            <ActionIcon onClick={stopRecording} {...actionIconProps}>
              <IconPlayerStopFilled />
            </ActionIcon>
          </Flex>
        )}
        {status === "paused" && (
          <Flex>
            <ActionIcon onClick={resumeRecording} {...actionIconProps}>
              <IconPlayerRecordFilled />
            </ActionIcon>
            <Space w={10} />

            <ActionIcon onClick={stopRecording} {...actionIconProps}>
              <IconPlayerStopFilled />
            </ActionIcon>
          </Flex>
        )}
        {status === "stopped" && (
          <Flex>
            {mediaBlobUrl && <Player url={mediaBlobUrl} />}
            <Space w={10} />
            <ActionIcon onClick={clearBlobUrl} {...actionIconProps}>
              <IconRefresh />
            </ActionIcon>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export const showRecorderModal = (onRecorded: (url: string) => void) => {
  let recording = "";
  modals.openConfirmModal({
    title: "Enregistrement audio",
    children: <Recorder onRecorded={(url) => (recording = url)} />,
    size: "md",
    labels: { confirm: "Utiliser l'enregistrement", cancel: "Annuler" },
    confirmProps: { color: "teal" },
    onCancel: () => {},
    onConfirm: () => onRecorded(recording),
  });
};
