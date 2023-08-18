import { State } from "../../store/store";
import { StudioActionNode, StudioPack, StudioStageNode } from "../../types";
import { getBackMenu, getNextStory } from "./utils";

const menuControlSettings = {
  wheel: true,
  ok: true,
  home: true,
  pause: false,
  autoplay: false,
};

const storyControlSettings = {
  wheel: false,
  ok: false,
  home: true,
  pause: true,
  autoplay: true,
};

export const generate = (state: State) => {
  if (
    !state.metadata.title ||
    !state.metadata.author ||
    !state.metadata.description
  ) {
    throw new Error("A pack must have a title, an author and a description");
  }

  const stageNodes: StudioStageNode[] = [];
  const actionNodes: StudioActionNode[] = [];

  const treatOption = (optionUuid: string) => {
    const option = state.optionIndex[optionUuid];
    if (!option) throw new Error("Option not found");

    const parentMenu = getBackMenu(state.optionIndex, optionUuid);

    const homeTransition = parentMenu
      ? {
          actionNode: parentMenu.uuid,
          optionIndex: parentMenu.index,
        }
      : null;

    let okTransition =
      option.type === "menu"
        ? {
            actionNode: option.menuDetails!.uuid,
            optionIndex: 0,
          }
        : null;

    const controlSettings =
      option.type === "menu" ? menuControlSettings : storyControlSettings;

    if (option.type === "story" && option.onEnd) {
      if (option.onEnd !== "stop") {
        controlSettings.autoplay = true;
        // back or next - defaults to back
        okTransition = homeTransition;
      }

      if (option.onEnd === "next") {
        const nextStoryMenuUuid = getNextStory(state.optionIndex, optionUuid);
        // then if we have a next story we go to it
        if (nextStoryMenuUuid) {
          okTransition = {
            actionNode: nextStoryMenuUuid,
            optionIndex: 0,
          };
        }
      }
    }

    const stageNode = {
      uuid: option.uuid,
      image: option.imageRef,
      audio: option.audioRef,
      type: "stage" as "stage" | "story" | "cover",
      name: option.uuid,
      okTransition,
      homeTransition,
      controlSettings,
    };

    stageNodes.push(stageNode);

    // if the node is not a story (leaf) node we register the coming menu
    if (option.type === "menu") {
      // control that it has an action uuid
      if (!option.menuDetails!.uuid)
        throw new Error("A menu must have an action uuid");

      // control that it has sub nodes
      if (option.menuDetails!.options.length === 0) {
        throw new Error("A menu must have at least one sub node");
      }

      const actionNode: StudioActionNode = {
        id: option.menuDetails!.uuid,
        uuid: option.menuDetails!.uuid,
        name: option.menuDetails!.uuid,
        options: option.menuDetails!.options,
      };

      actionNodes.push(actionNode);

      // treat sub nodes
      option.menuDetails!.options.forEach((subOption) => {
        treatOption(subOption);
      });
    }
  };

  treatOption(state.initialOptionUuid);

  stageNodes[0].type = "cover";
  const packUuid = stageNodes[0].uuid;

  const packObject: StudioPack = {
    format: "v1",
    version: 2,
    uuid: packUuid,

    title: state.metadata.title,
    author: state.metadata.author,
    description: state.metadata.description,

    source: "LUNII_ADMIN_BUILDER",

    stageNodes,
    actionNodes,
  };

  console.log(packObject);

  return packObject;
};
