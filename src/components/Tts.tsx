import {Alert, Box, Button, Flex, SegmentedControl, Space, TextInput,} from "@mantine/core";
import {modals} from "@mantine/modals";
import {FC, useEffect, useMemo, useState} from "react";
import {useMutation} from "react-query";
import {Player} from "./Player";
import {IconAlertCircle, IconWand} from "@tabler/icons-react";
import {useTranslation} from "react-i18next";
import {t} from "i18next";

export const Tts: FC<{ onChange?: (audio: Blob | undefined) => void }> = ({
  onChange,
}) => {
  const { i18n, t } = useTranslation();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(`${i18n.language}-Wavenet-B`);

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
      <Alert icon={<IconAlertCircle size="1rem" />} title="Note" color="grey" translate={"yes"}>
          {t('components.Tts.alert.text')}
      </Alert>
      <Space h={10} />
      <SegmentedControl
        value={voice}
        data={[
          { value: `${i18n.language}-Wavenet-A`, label: t('components.Tts.voiceSelector.0') },
          { value: `${i18n.language}-Wavenet-B`, label: t('components.Tts.voiceSelector.1') },
        ]}
        onChange={(voice) => {
          setVoice(voice);
          reset();
        }}
        translate={"yes"}
      />
      <Space h={10} />
      <Flex>
        <TextInput
          wrapperProps={{ style: { flex: 1 } }}
          placeholder={t('components.Tts.input.placeholder')}
          onChange={(e) => setText(e.currentTarget.value)}
          translate={"yes"}
        />
        <Space w={10} />
        <Button
          onClick={() => mutate(text)}
          loading={isLoading}
          leftIcon={<IconWand size="16" />}
          translate={"yes"}
        >
            {t('components.Tts.button.text')}
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
    title: t('components.Tts.modal.title'),
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
