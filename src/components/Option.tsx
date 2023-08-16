import {
  Box,
  Button,
  Center,
  Flex,
  Paper,
  SegmentedControl,
} from "@mantine/core";
import { FC } from "react";
import { OptionType } from "../store/store";
import { AudioSelector, ImageSelector } from "./FileSelector";
import { IconPlus } from "@tabler/icons-react";
import { Arrow } from "./Arrow";
import { deepCopy } from "../utils/misc";

export const Option: FC<{
  option: OptionType;
  onUpdate: (option: OptionType) => void;
  onRemove?: () => void;
  id: string;
  parentId?: string;
}> = ({ option, onUpdate, onRemove, id, parentId }) => {
  const handleAddOption = (type: "story" | "menu") => {
    if (option.optionsType !== "menu") return;
    const newOption: OptionType = {
      uuid: crypto.randomUUID(),
      ...(type === "story"
        ? {
            optionsType: "story",
            storyDetails: {
              menuUuid: crypto.randomUUID(),
              uuid: crypto.randomUUID(),
            },
          }
        : {
            optionsType: "menu",
            menuDetails: {
              uuid: crypto.randomUUID(),
              options: [],
            },
          }),
    };

    const thisOption = deepCopy(option);

    if (!thisOption.menuDetails.options) thisOption.menuDetails.options = [];
    thisOption.menuDetails.options.push(newOption);
    onUpdate(thisOption);
  };

  const handleUpdateSubOption = (subOption: OptionType, i: number) => {
    if (option.optionsType !== "menu") return;
    const thisOption = deepCopy(option);
    thisOption.menuDetails.options![i] = subOption;
    onUpdate(thisOption);
  };

  const handleRemoveSubOption = (i: number) => {
    if (option.optionsType !== "menu") return;
    const thisOption = deepCopy(option);
    thisOption.menuDetails.options.splice(i, 1);
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
            value={option.imageRef}
            onChange={async (file) => {
              onUpdate({ ...option, imageRef: file || undefined });
            }}
          />
          <AudioSelector
            value={option.audioRef}
            onChange={async (file) => {
              onUpdate({ ...option, audioRef: file || undefined });
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
              onChange={(value) => {
                if (value === "story") {
                  onUpdate({
                    ...option,
                    optionsType: "story",
                    storyDetails: {
                      menuUuid: crypto.randomUUID(),
                      uuid: crypto.randomUUID(),
                    },
                  });
                } else {
                  onUpdate({
                    ...option,
                    optionsType: "menu",
                    menuDetails: {
                      uuid: crypto.randomUUID(),
                      options: [],
                    },
                  });
                }
              }}
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
              {option.menuDetails.options.map((option, i) => {
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
                value={option.storyDetails.audioRef}
                onChange={async (file) => {
                  onUpdate({
                    ...option,
                    storyDetails: {
                      ...option.storyDetails,
                      audioRef: file || undefined,
                    },
                  });
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
