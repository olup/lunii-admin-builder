import { ActionIcon, AspectRatio, Box, Center, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlphabetLatin,
  IconClipboard,
  IconDots,
  IconLink,
  IconMessage,
  IconMicrophone,
  IconMusic,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { getAssetDirectory, loadFile } from "../utils/fs";
import { getImageFromClipboard } from "../utils/misc";
import { FileInput } from "./FileInput";
import { Player } from "./Player";

const getFileUrlValue = async (fileName: string) => {
  const assets = await getAssetDirectory();
  const localFile = await assets.getFileHandle(`${fileName}`);
  const file = await localFile.getFile();
  return URL.createObjectURL(file);
};

export const ImageSelector: FC<{
  value?: string;
  onChange: (value: string | null) => void;
}> = ({ value, onChange }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;
    getFileUrlValue(value).then((v) => setUrl(v));
  }, [value]);

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
      await onChange(await loadFile(new File([imageBlob], "x.jpeg")));
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
        <AspectRatio ratio={360 / 240}>
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
        onChange={async (file) => await onChange(await loadFile(file))}
        accept="image/jpeg,image/jpg,image/png,image/bmp"
      >
        <AspectRatio ratio={360 / 240}>
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
            <Menu.Item disabled icon={<IconLink size={14} />}>
              Depuis une URL
            </Menu.Item>
            <Menu.Item
              icon={<IconClipboard size={14} />}
              onClick={loadFromClipboard}
            >
              Depuis le clipboard
            </Menu.Item>
            <Menu.Item disabled icon={<IconAlphabetLatin size={14} />}>
              Depuis du texte
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
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!value) return;
    getFileUrlValue(value).then((v) => setUrl(v));
  }, [value]);

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
            <Menu.Item disabled icon={<IconLink size={14} />}>
              Depuis une URL
            </Menu.Item>
            <Menu.Item disabled icon={<IconMicrophone size={14} />}>
              Depuis le micro
            </Menu.Item>
            <Menu.Item disabled icon={<IconMessage size={14} />}>
              Depuis du texte (synthèse)
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  );
};
