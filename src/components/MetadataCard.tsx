import { Paper, TextInput, Textarea } from "@mantine/core";
import { FC } from "react";
import { state$ } from "../store/store";

export const MetadataCard: FC = () => {
  const md = state$.state.metadata;
  const title = md.title.use();
  const description = md.description.use();
  const author = md.author.use();

  return (
    <Paper shadow="sm" withBorder w={300} p={15}>
      <TextInput
        value={title}
        onChange={(e) => md.title.set(e.target.value)}
        label="Titre du pack"
      />
      <TextInput
        value={author}
        onChange={(e) => md.author.set(e.target.value)}
        label="Auteur"
      />
      <Textarea
        value={description}
        onChange={(e) => md.description.set(e.target.value)}
        label="Description"
        autosize
        minRows={3}
      />
    </Paper>
  );
};
