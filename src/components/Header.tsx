import { Box, Button, Space, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconDownload,
  IconExternalLink,
  IconPlus,
  IconUpload,
} from "@tabler/icons-react";
import { FC } from "react";
import { useMutation } from "react-query";
import { resetState, state$ } from "../store/store";
import { exportPack, showFilePicker } from "../utils/fs";
import { importPack } from "../utils/import/importPack";
import { LanguageSelector } from "./LanguageSelector.tsx";
import { Trans, useTranslation } from "react-i18next";

export const Header: FC = () => {
  const {t} = useTranslation();

  const openResetModal = () =>
    modals.openConfirmModal({
      title: <Text translate={"yes"}>{t('newPack.modal.title')}</Text>,
      centered: true,
      children: (
        <Text size="sm" translate={"yes"}>
          {t("newPack.modal.children.text")}
        </Text>
      ),
      labels: {confirm: t("newPack.modal.labels.confirm"), cancel: t("newPack.modal.labels.cancel")},
      confirmProps: {color: "teal"},
      onCancel: () => {
      },
      onConfirm: () => resetState(),
    });

  const {mutate: doImportPack, isLoading} = useMutation(
    async () => {
      const file = await showFilePicker([
        {accept: {"application/zip": [".zip"]}},
      ]);
      if (!file) return;
      const state = await importPack(file);
      state$.state.assign(state);
    },
    {
      onError: (e) => {
        notifications.show({
          color: "red",
          title: t("common.error.unknown"),
          message: (e as Error).message,
        });
      },
    }
  );

  const openImportModal = () =>
    modals.openConfirmModal({
      title: <Text translate={"yes"}><Trans key={"components.Header.import.modal.title"}></Trans></Text>,
      centered: true,
      children: (
        <>
          <Text size="sm" translate={"yes"}>
            {t("components.Header.import.modal.children.0")}
          </Text>
          <Space h={10}/>
          <Text size="sm" translate={"yes"}>
            {t("components.Header.import.modal.children.1")}
          </Text>
          <Text size="sm" translate={"yes"}>
            {t("components.Header.import.modal.children.2")}
          </Text>
        </>
      ),
      labels: {
        confirm: t("components.Header.import.labels.confirm"),
        cancel: t("components.Header.import.labels.cancel")
      },
      confirmProps: {color: "teal"},
      onCancel: () => {
      },
      onConfirm: () => doImportPack(),
    });

  return (
    <Box p={5} display="inline-flex" bg="white">
      <Button
        mr={5}
        variant="outline"
        color="gray"
        rightIcon={<IconPlus size={18}/>}
        onClick={() => {
          openResetModal();
        }}
        translate={"yes"}
      >
        {t('newPack.button.text')}
      </Button>
      <Button
        mr={5}
        variant="outline"
        color="gray"
        rightIcon={<IconUpload size={18}/>}
        onClick={() => openImportModal()}
        loading={isLoading}
        translate={"yes"}
      >
        {t('components.Header.import.button')}
      </Button>
      <Button
        mr={5}
        variant="outline"
        color="gray"
        rightIcon={<IconDownload size={18}/>}
        onClick={async () => {
          try {
            await exportPack(state$.state.peek());
          } catch (e) {
            console.error(e);
            notifications.show({
              title: t("common.error.unknown"),
              message: (e as Error).message,
              color: "red",
            });
          }
        }}
        translate={"yes"}
      >
        {t('components.Header.build.button')}
      </Button>
      <LanguageSelector/>
      <Button
        variant="white"
        color="gray"
        leftIcon={<IconExternalLink size={18} />}
        component="a"
        href="https://lunii-admin-web.pages.dev"
        target="_blank"
        translate={"yes"}
      >
        {t('components.Header.Install.button')}
      </Button>
    </Box>
  );
};
