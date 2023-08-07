import {
  Box,
  Button,
  Center,
  Flex,
  Paper,
  SegmentedControl,
} from "@mantine/core";
import { FC } from "react";
import { OptionType } from "../store";
import { AudioSelector, ImageSelector } from "./FileSelector";
import { IconPlus } from "@tabler/icons-react";
import { Arrow } from "./Arrow";
import { deepCopy } from "../utils";

export const Option: FC<{
  option: OptionType;
  onUpdate: (option: OptionType) => void;
  onRemove?: () => void;
  id: string;
  parentId?: string;
}> = ({ option, onUpdate, onRemove, id, parentId }) => {
  const handleAddOption = (type: "story" | "menu") => {
    const newOption: OptionType = {
      uuid: crypto.randomUUID(),

      optionsType: type,
      titleImageRef: "",
      titleAudioRef: "",
      storyAudioRef: "",
      options: [],

      actionUuid: crypto.randomUUID(),
      storyUuid: crypto.randomUUID(),
    };

    const thisOption = deepCopy(option);

    if (!thisOption.options) thisOption.options = [];
    thisOption.options.push(newOption);
    onUpdate(thisOption);
  };

  const handleUpdateSubOption = (subOption: OptionType, i: number) => {
    const thisOption = deepCopy(option);
    thisOption.options![i] = subOption;
    onUpdate(thisOption);
  };

  const handleRemoveSubOption = (i: number) => {
    const thisOption = deepCopy(option);
    thisOption.options!.splice(i, 1);
    onUpdate(thisOption);
  };

  return (
    <>
      <Box>
        {onRemove && (
          <Button
            mb={5}
            size="xs"
            color="red"
            variant="light"
            onClick={onRemove}
          >
            Supprimer
          </Button>
        )}
        <Paper shadow="sm" withBorder w={300} id={id} mr={20}>
          <ImageSelector
            value={option.titleImageRef}
            onChange={async (file) => {
              onUpdate({ ...option, titleImageRef: file || undefined });
            }}
          />
          <AudioSelector
            value={option.titleAudioRef}
            onChange={async (file) => {
              onUpdate({ ...option, titleAudioRef: file || undefined });
            }}
          />

          <Center m={10}>
            <SegmentedControl
              fullWidth
              value={option.optionsType}
              data={[
                { value: "story", label: "Lire une histoire" },
                { value: "menu", label: "Afficher un menu" },
              ]}
              onChange={(value) =>
                onUpdate({ ...option, optionsType: value as "story" | "menu" })
              }
            />
          </Center>
        </Paper>
        {option.optionsType === "menu" && (
          <Center w={300} mt={10}>
            <Button
              variant="filled"
              sx={{ zIndex: 10 }}
              size="xs"
              onClick={() => handleAddOption("menu")}
              rightIcon={<IconPlus size={15} />}
              color="gray"
            >
              Ajouter un choix
            </Button>
          </Center>
        )}

        {option.optionsType === "menu" && (
          <Box>
            <Flex mt={100}>
              {option.options?.map((option, i) => {
                return (
                  <Box key={option.uuid}>
                    <Option
                      option={option}
                      onUpdate={(option) => handleUpdateSubOption(option, i)}
                      onRemove={() => handleRemoveSubOption(i)}
                      id={`${id}-option-${option.uuid}`}
                      parentId={id}
                    />
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}

        {option.optionsType === "story" && (
          <>
            <Paper shadow="sm" withBorder w={300} mt={100} id={`${id}-story`}>
              <AudioSelector
                value={option.storyAudioRef}
                onChange={async (file) => {
                  onUpdate({ ...option, storyAudioRef: file || undefined });
                }}
              />
            </Paper>
            <Arrow to={`${id}-story`} from={`${id}`} />
          </>
        )}
      </Box>

      {parentId && <Arrow from={parentId} to={id} />}
    </>
  );
};
