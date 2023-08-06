import { Box, Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconDownload, IconPlus, IconUpload } from "@tabler/icons-react";
import { FC } from "react";
import { resetState, state$ } from "../store";
import { exportPack } from "../utils";

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

  const openInstallHelpModal = () =>
    modals.openConfirmModal({
      title: <Text fw={700}>Aide : installer un pack</Text>,
      centered: true,
      children: (
        <>
          <Text size="sm">
            Une fois généré et téléchargé, vous pouvez installer votre pack
            d'histoire sur votre Lunii à l'aide de l'appliacation Lunii Admin.
          </Text>
        </>
      ),
      labels: { confirm: "Telecharger Lunii Admin", cancel: "Fermer" },
      confirmProps: { color: "teal" },
      onCancel: () => {},
      onConfirm: () => window.open("https://github.com/olup/lunii-admin"),
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
        disabled
      >
        Ouvrir
      </Button>
      <Button
        variant="outline"
        color="gray"
        rightIcon={<IconDownload size={18} />}
        onClick={async () => {
          try {
            exportPack(state$.state.peek());
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
        onClick={() => openInstallHelpModal()}
      >
        Comment installer mon pack sur la lunii ?
      </Button>
    </Box>
  );
};
