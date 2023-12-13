import {
  Box,
  Button,
  Center,
  Flex,
  Paper,
  SegmentedControl,
  Select,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { NodeType, state$ } from "../store/store";
import { Arrow } from "./Arrow";
import { AudioSelector, ImageSelector } from "./FileSelector";
import { useTranslation } from "react-i18next";

export const Option: FC<{
  id: string;
}> = ({ id }) => {
  const {t} = useTranslation();
  const theme = useMantineTheme();

  const optionIndex$ = state$.state.nodeIndex;
  const optionIndex = optionIndex$.use();
  const option$ = state$.state.nodeIndex[id];
  const option = state$.state.nodeIndex[id].use();

  if (!option) return null;

  const parentId = option.parentOptionUuid;
  const parentOption = parentId ? optionIndex[parentId] : undefined;

  const handleAddOption = () => {
    const newOption: NodeType = {
      uuid: crypto.randomUUID(),
      type: "menu",
      parentOptionUuid: id,
      menuDetails: {
        to: "menu",
        uuid: crypto.randomUUID(),
        options: [],
      },
    };

    option.menuDetails!.options.push(newOption.uuid);
    optionIndex$[newOption.uuid].set(newOption);
  };

  return (
    <>
      <Box>
        {parentId && option.type === "menu" && (
          <Button
            mb={5}
            size="xs"
            color="red"
            variant="light"
            onClick={() => {
              // delete from parent
              const parentOptions = parentOption!.menuDetails!.options;
              const updatedParentOptions = parentOptions.filter(
                (o) => o !== id
              );
              optionIndex$[parentId].menuDetails.options.set(
                updatedParentOptions
              );
            }}
            translate={"yes"}
          >
            {t("components.Option.menu.remove")}
          </Button>
        )}
        <Paper
          shadow="sm"
          withBorder
          w={300}
          id={id}
          mr={20}
          style={
            option.type === "story"
              ? {
                  borderColor: theme.colors.blue[5],
                  borderWidth: 2,
                }
              : {}
          }
        >
          {option.type === "menu" && (
            <ImageSelector
              value={option.imageRef}
              onChange={async (file) => {
                option$.imageRef.set(file || undefined);
              }}
            />
          )}
          <AudioSelector
            value={option.audioRef}
            onChange={async (file) => {
              option$.audioRef.set(file || undefined);
            }}
          />

          {option.type === "menu" && (
            <Center m={10}>
              <SegmentedControl
                fullWidth
                value={option.menuDetails!.to}
                data={[
                  { value: "story", label: t("components.Option.menu.story") },
                  { value: "menu", label: t("components.Option.menu.menu") },
                ]}
                onChange={(value) => {
                  if (option.type !== "menu") return;

                  if (value === "story") {
                    option$.menuDetails.to.set("story");
                    const storyUuid = crypto.randomUUID();
                    optionIndex$[id].menuDetails.options.set([storyUuid]);
                    optionIndex$[storyUuid].set({
                      uuid: storyUuid,
                      type: "story",
                      parentOptionUuid: id,
                      onEnd: state$.ui.defaultEndAction.get(),
                    });
                  } else {
                    option$.menuDetails.to.set("menu");
                    optionIndex$[id].menuDetails.options.set([]);
                  }
                }}
                translate={"yes"}
              />
            </Center>
          )}
          {option.type === "story" && (
            <Box p={10} pt={0}>
              <Select
                label={t("components.Option.story.select.label")}
                value={option.onEnd}
                onChange={(value: "stop" | "back" | "next") => {
                  option$.onEnd.set(value);
                  state$.ui.defaultEndAction.set(value);
                }}
                data={[
                  {
                    value: "stop",
                    label: t("components.Option.story.select.options.stop"),
                  },
                  {
                    value: "back",
                    label: t("components.Option.story.select.options.back"),
                  },
                  // {
                  //   value: "next",
                  //   label: t("components.Option.story.select.options.next"),
                  // },
                ]}
                translate={"yes"}
              />
            </Box>
          )}
        </Paper>

        {option.type === "menu" && option.menuDetails!.to === "menu" && (
          <Center w={300} mt={10}>
            <Button
              variant="filled"
              sx={{ zIndex: 10 }}
              size="xs"
              onClick={() => handleAddOption()}
              rightIcon={<IconPlus size={15} />}
              color="gray"
              translate={"yes"}
            >
              {t("components.Option.menu.add")}
            </Button>
          </Center>
        )}

        {option.type === "menu" && (
          <Box>
            <Flex mt={100}>
              {option.menuDetails!.options.map((option) => {
                return (
                  <Box key={option}>
                    <Option id={option} />
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}
      </Box>

      {parentId && <Arrow from={parentId} to={id} />}
    </>
  );
};
