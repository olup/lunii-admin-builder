import { ActionIcon, AspectRatio, Box, Center, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlphabetLatin,
  IconClipboard,
  IconDots,
  IconExternalLink,
  IconMicrophone,
  IconMusic,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { getAssetDirectory, loadFile } from "../utils/fs";
import { resizeImage } from "../utils/image";
import { getImageFromClipboard } from "../utils/misc";
import { FileInput } from "./FileInput";
import { Player } from "./Player";
import { showRecorderModal } from "./Recorder";
import { showTtsModal } from "./Tts";
import { openTextImageCreator } from "./TextImageCreator";

const getFileUrlValue = async (fileName: string) => {
  const assets = await getAssetDirectory();
  const localFile = await assets.getFileHandle(`${fileName}`);
  const file = await localFile.getFile();
  return URL.createObjectURL(file);
};

const useGetFileUrlValue = (fileName: string | undefined) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!fileName) setUrl(null);
    else getFileUrlValue(fileName).then((v) => setUrl(v));
  }, [fileName]);
  return url;
};

export const ImageSelector: FC<{
  value?: string;
  onChange: (value: string | null) => void;
}> = ({ value, onChange }) => {
  const url = useGetFileUrlValue(value);

  const loadFromImageCreator = async () =>
    openTextImageCreator(async (blob) => {
      if (!blob) return;
      const file = await loadFile(new File([blob], "x.png"));
      onChange(file);
    });

  const loadFromClipboard = async () => {
    try {
      const imageBlob = await getImageFromClipboard();
      if (!imageBlob) {
        notifications.show({
          title: "Le clipboard ne contient pas d'image",
          message: "",
          color: "yellow",
        });
        return;
      }
      const resizedImageBlob = await resizeImage(imageBlob, 320, 240);
      await onChange(await loadFile(new File([resizedImageBlob], "x.png")));
    } catch (e) {
      console.error(e);
      notifications.show({
        title: "Impossible de copier depuis le clipboard",
        message: (e as Error).message,
        color: "red",
      });
    }
  };

  if (value) {
    return (
      <Box pos="relative">
        <AspectRatio ratio={320 / 240}>
          {url && <img src={url} alt={value} />}
        </AspectRatio>
        <ActionIcon
          right={5}
          top={5}
          pos="absolute"
          onClick={async () => {
            onChange(null);
          }}
          radius="xl"
        >
          <IconX size={15} />
        </ActionIcon>
      </Box>
    );
  }

  return (
    <Box pos="relative">
      <FileInput
        onChange={async (file) => {
          const resizedImageBlob = await resizeImage(file, 320, 240);
          const resizedImageFile = new File([resizedImageBlob], "x.png", {
            type: file.type,
            lastModified: Date.now(),
          });
          await onChange(await loadFile(resizedImageFile));
        }}
        accept="image/jpeg,image/jpg,image/png,image/bmp"
      >
        <AspectRatio ratio={320 / 240}>
          <Center h="100%">
            <IconPhoto size={40} />
          </Center>
        </AspectRatio>
      </FileInput>

      <Box pos="absolute" top={5} right={15}>
        <Menu position="bottom-start">
          <Menu.Target>
            <ActionIcon>
              <IconDots />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              icon={<IconClipboard size={14} />}
              onClick={loadFromClipboard}
            >
              Coller epuis le clipboard
            </Menu.Item>
            <Menu.Item
              icon={<IconAlphabetLatin size={14} />}
              onClick={loadFromImageCreator}
            >
              Depuis du texte (créateur d'image)
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  );
};

export const AudioSelector: FC<{
  value?: string;
  onChange: (value: string | null) => void;
}> = ({ value, onChange }) => {
  const url = useGetFileUrlValue(value);

  if (value) {
    return (
      <Box h={100} pos="relative">
        <ActionIcon
          right={5}
          top={5}
          pos="absolute"
          onClick={async () => {
            onChange(null);
          }}
          radius="xl"
        >
          <IconX size={15} />
        </ActionIcon>
        {url && (
          <Center h="100%">
            <Player url={url} />
          </Center>
        )}
      </Box>
    );
  }

  return (
    <Box pos="relative">
      <FileInput
        onChange={async (file) => await onChange(await loadFile(file))}
        accept="audio/mp3,audio/ogg,audio/wav"
      >
        <Center h={100}>
          <IconMusic size={40} />
        </Center>
      </FileInput>
      <Box pos="absolute" top={5} right={15}>
        <Menu position="bottom-start">
          <Menu.Target>
            <ActionIcon>
              <IconDots />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              icon={<IconMicrophone size={14} />}
              onClick={() =>
                showRecorderModal(async (url) => {
                  if (!url) return;
                  const blob = await fetch(url).then((r) => r.blob());
                  const file = await loadFile(new File([blob], "x.wav"));
                  await onChange(file);
                })
              }
            >
              Depuis le micro
            </Menu.Item>
            <Menu.Item
              icon={<IconExternalLink size={14} />}
              onClick={() =>
                showTtsModal(async (blob) => {
                  const file = await loadFile(new File([blob], "x.mp3"));
                  await onChange(file);
                })
              }
            >
              Depuis du texte (synthèse)
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  );
};
