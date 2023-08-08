import { ActionIcon, AspectRatio, Box, Center } from "@mantine/core";
import { IconMusic, IconPhoto, IconX } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { getAssetDirectory } from "../utils/fs";
import { FileInput } from "./FileInput";
import { Player } from "./Player";

const loadFile = async (
  file: File | null,
  onChange: (fileName: string) => void
) => {
  if (!file) return;

  const assets = await getAssetDirectory();

  const localFile = await assets.getFileHandle(`${file.name}`, {
    create: true,
  });
  const writer = await localFile.createWritable();
  await writer.write(await file.arrayBuffer());
  await writer.close();

  onChange(file.name);
};

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
    <FileInput
      onChange={(file) => loadFile(file, onChange)}
      accept="image/jpeg,image/jpg,image/png,image/bmp"
    >
      <AspectRatio ratio={360 / 240}>
        <Center h="100%">
          <IconPhoto size={40} />
        </Center>
      </AspectRatio>
    </FileInput>
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
    <FileInput
      onChange={(file) => loadFile(file, onChange)}
      accept="audio/mp3,audio/ogg,audio/wav"
    >
      <Center h={100}>
        <IconMusic size={40} />
      </Center>
    </FileInput>
  );
};
