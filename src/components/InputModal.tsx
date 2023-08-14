import { Box, Space, Text, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";

export const showInputModal = (
  title: string,
  message: string,
  confirmLabel: string,
  callback: (value: string) => void
) => {
  let text = "";
  modals.openConfirmModal({
    title,
    children: (
      <Box>
        <Text>{message}</Text>
        <Space h={10} />
        <TextInput w="100%" onChange={(e) => (text = e.target.value)} />
      </Box>
    ),
    labels: { confirm: confirmLabel, cancel: "Annuler" },
    onCancel: () => console.log("Cancel"),
    onConfirm: () => callback(text),
  });
};
