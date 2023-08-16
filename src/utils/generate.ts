import { OptionType, State } from "../store";
import { StudioActionNode, StudioPack, StudioStageNode } from "../types";

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

export const genrate = (state: State) => {
  if (
    !state.metadata.title ||
    !state.metadata.author ||
    !state.metadata.description
  ) {
    throw new Error("A pack must have a title, an author and a description");
  }

  // eslint-disable-next-line
  const stageNodes: any[] = [];
  // eslint-disable-next-line
  const actionNodes: any[] = [];

  function findParentActionNode(
    stageNodeUuid: string
  ): [string, number] | null {
    const node = actionNodes.find((actionNode) =>
      actionNode.options.includes(stageNodeUuid)
    );
    if (!node) return null;

    const nodeIndex = node.options.findIndex(
      (n: string) => n === stageNodeUuid
    );
    return [node.id, nodeIndex];
  }

  function findParentStageNode(actionNodeUuid: string): string | null {
    const node = stageNodes.find(
      (stageNode) => stageNode.okTransition?.actionNode === actionNodeUuid
    );
    return node ? node.uuid : null;
  }

  function findBackMenuUuid(stageNodeUuid: string): [string, number] | null {
    // is there a parent node ?
    const parentAction = findParentActionNode(stageNodeUuid);
    const parentStageUuid = parentAction
      ? findParentStageNode(parentAction[0])
      : null;
    // is there a parent menu to this node ?
    const topActionUuid = parentStageUuid
      ? findParentActionNode(parentStageUuid)
      : null;

    return topActionUuid;
  }

  const treatOption = (option: OptionType) => {
    const backMenu = findBackMenuUuid(option.uuid);

    const stageNode = {
      uuid: option.uuid,
      image: option.imageRef,
      audio: option.audioRef,
      type: "stage",
      name: option.uuid,
      okTransition: {
        actionNode:
          option.optionsType === "menu"
            ? option.menuDetails.uuid
            : option.storyDetails.menuUuid,
        optionIndex: 0,
      },
      homeTransition: backMenu
        ? {
            actionNode: backMenu[0],
            optionIndex: backMenu[1],
          }
        : null,
      controlSettings: menuControlSettings,
    };

    stageNodes.push(stageNode);

    // if the node leads to a menu we register the coming menu
    if (option.optionsType === "menu") {
      // control that it has an action uuid
      if (!option.menuDetails.uuid)
        throw new Error("A menu must have an action uuid");

      // control that it has sub nodes
      if (option.menuDetails.options.length === 0) {
        throw new Error("A menu must have at least one sub node");
      }

      const actionNode: StudioActionNode = {
        id: option.menuDetails.uuid,
        uuid: option.menuDetails.uuid,
        name: option.menuDetails.uuid,
        options: option.menuDetails.options.map((option) => option.uuid),
      };
      actionNodes.push(actionNode);

      // treat sub nodes
      option.menuDetails.options.forEach((subOption) => {
        treatOption(subOption);
      });
    }

    // if the node leads to a story we register the coming story with its
    // single item  menu
    if (option.optionsType === "story") {
      if (!option.storyDetails.audioRef || !option.storyDetails.uuid) {
        console.log(option);
        throw new Error("A story must have an audio");
      }

      // register single item menu
      const menuNode = {
        id: option.storyDetails.menuUuid,
        uuid: option.storyDetails.menuUuid,
        name: option.storyDetails.menuUuid,
        options: [option.storyDetails.uuid],
      };
      actionNodes.push(menuNode);

      const backMenu = findBackMenuUuid(option.storyDetails.uuid);

      // register story node
      const storyNode: StudioStageNode = {
        uuid: option.storyDetails.uuid,
        type: "story",
        image: undefined,
        audio: option.storyDetails.audioRef,
        okTransition: null,
        name: option.storyDetails.uuid,
        homeTransition: backMenu
          ? {
              actionNode: backMenu[0],
              optionIndex: backMenu[1],
            }
          : null,
        controlSettings: storyControlSettings,
      };
      stageNodes.push(storyNode);
    }
  };

  treatOption(state.initialOption);

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
