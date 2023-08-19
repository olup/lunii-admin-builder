import { Box, Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconDownload,
  IconExternalLink,
  IconPlus,
  IconUpload,
} from "@tabler/icons-react";
import { FC } from "react";
import { resetState, state$ } from "../store/store";
import { exportPack, showFilePicker } from "../utils/fs";
import { importPack } from "../utils/import/importPack";
import { useMutation } from "react-query";
import { UnsuportedPackError } from "../utils/import/utils";

export const Header: FC = () => {
  const openResetModal = () =>
    modals.openConfirmModal({
      title: <Text>Nouveau Pack</Text>,
      centered: true,
      children: (
        <Text size="sm">
          Êtes vous sûr de vouloir créer un nouveau pack ? Toutes les données
          non sauvegardées seront perdues.
        </Text>
      ),
      labels: { confirm: "Créer un nouveau pack", cancel: "Annuler" },
      confirmProps: { color: "teal" },
      onCancel: () => {},
      onConfirm: () => resetState(),
    });

  const { mutate: doImportPack, isLoading } = useMutation(
    async () => {
      const file = await showFilePicker([
        { accept: { "application/zip": [".zip"] } },
      ]);
      if (!file) return;
      const state = await importPack(file);
      state$.state.assign(state);
    },
    {
      onError: (e) => {
        if (e instanceof UnsuportedPackError) {
          return notifications.show({
            color: "orange",
            title: "Pack non supporté",
            message:
              "Pour le moment, seuls les packs créés avec lunii-admin-builder peuvent être ouverts",
          });
        }
        notifications.show({
          color: "red",
          title: "Une erreur est survenue",
          message: (e as Error).message,
        });
      },
    }
  );

  const openImportModal = () =>
    modals.openConfirmModal({
      title: <Text>Importer un Pack</Text>,
      centered: true,
      children: (
        <>
          <Text size="sm">
            En ouvrant un nouveau pack, le travail non sauvegardé sera perdu.
          </Text>
          <Text size="sm">
            Pour le moment Luniii Admin Builder ne peut ouvrir que les packs
            qu'il a permis de créer.
          </Text>
        </>
      ),
      labels: { confirm: "Importer", cancel: "Annuler" },
      confirmProps: { color: "teal" },
      onCancel: () => {},
      onConfirm: () => doImportPack(),
    });

  return (
    <Box p={5} display="inline-flex" bg="white">
      <Button
        mr={5}
        variant="outline"
        color="gray"
        rightIcon={<IconPlus size={18} />}
        onClick={() => {
          openResetModal();
        }}
      >
        Nouveau
      </Button>
      <Button
        mr={5}
        variant="outline"
        color="gray"
        rightIcon={<IconUpload size={18} />}
        onClick={() => openImportModal()}
        loading={isLoading}
      >
        Ouvrir
      </Button>
      <Button
        variant="outline"
        color="gray"
        rightIcon={<IconDownload size={18} />}
        onClick={async () => {
          try {
            await exportPack(state$.state.peek());
          } catch (e) {
            console.error(e);
            notifications.show({
              title: "Une erreur est survenue",
              message: (e as Error).message,
              color: "red",
            });
          }
        }}
      >
        Générer & télécharger
      </Button>
      <Button
        variant="white"
        color="gray"
        leftIcon={<IconExternalLink size={18} />}
        component="a"
        href="https://lunii-admin-web.pages.dev"
        target="_blank"
      >
        Installer sur ma Lunii
      </Button>
    </Box>
  );
};
