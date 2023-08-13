import {
  Alert,
  Box,
  Button,
  Flex,
  SegmentedControl,
  Space,
  TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { FC, useEffect, useMemo, useState } from "react";
import { useMutation } from "react-query";
import { Player } from "./Player";
import { IconAlertCircle, IconWand } from "@tabler/icons-react";

export const Tts: FC<{ onChange?: (audio: Blob | undefined) => void }> = ({
  onChange,
}) => {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("fr-FR-Wavenet-B");

  const { mutate, data, isLoading, reset } = useMutation({
    mutationKey: "tts",
    mutationFn: (text: string) =>
      fetch(
        "https://api.streamelements.com/kappa/v2/speech?" +
          new URLSearchParams({
            voice,
            text,
          })
      ).then((res) => res.blob()),
  });

  useEffect(() => {
    if (onChange) {
      onChange(data);
    }
  }, [data, onChange]);

  const dataUrl = useMemo(() => {
    if (!data) return "";
    return URL.createObjectURL(data);
  }, [data]);

  return (
    <Box>
      <Alert icon={<IconAlertCircle size="1rem" />} title="Note" color="grey">
        Cette fonctionnalité dépends d'un service externe, il est possible que
        le service soit disfonctionel.
      </Alert>
      <Space h={10} />
      <SegmentedControl
        value={voice}
        data={[
          { value: "fr-FR-Wavenet-A", label: "Voix 1" },
          { value: "fr-FR-Wavenet-B", label: "Voix 2" },
        ]}
        onChange={(voice) => {
          setVoice(voice);
          reset();
        }}
      />
      <Space h={10} />
      <Flex>
        <TextInput
          wrapperProps={{ style: { flex: 1 } }}
          placeholder="Texte"
          onChange={(e) => setText(e.currentTarget.value)}
        />
        <Space w={10} />
        <Button
          onClick={() => mutate(text)}
          loading={isLoading}
          leftIcon={<IconWand size="16" />}
        >
          Générer
        </Button>
      </Flex>
      <Space h={10} />
      {data && !isLoading && <Player url={dataUrl} />}
    </Box>
  );
};

const TtsModal: FC<{ onValidate: (Audio: Blob) => void }> = ({
  onValidate,
}) => {
  const [data, setData] = useState<Blob | undefined>(undefined);
  return (
    <Box>
      <Tts onChange={setData} />
      <Space h={10} />
      {onValidate && (
        <Flex justify="right">
          <Button
            color="green"
            onClick={() => {
              data && onValidate?.(data);
            }}
            disabled={!data}
          >
            Valider
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export const showTtsModal = (onValidate: (Audio: Blob) => void) => {
  modals.open({
    title: "Synthese Vocale",
    children: (
      <TtsModal
        onValidate={(blob) => {
          onValidate(blob);
          modals.closeAll();
        }}
      />
    ),
  });
};
