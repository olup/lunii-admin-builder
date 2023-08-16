import { OptionType, State } from "../../store/store";
import { StudioPack, StudioStageNode } from "../../types";

const treatStageNode = (
  pack: StudioPack,
  stageNode: StudioStageNode,
  parentActionNodes: string[] = [],
  depth: number = 0
): OptionType | undefined => {
  const okActionNode = stageNode.okTransition?.actionNode;
  if (!okActionNode) return;

  const actionNode = pack.actionNodes.find(
    (actionNode) => actionNode.id === okActionNode
  );

  if (!actionNode) throw new Error("Wrong reference in okTransition");

  if (actionNode.options.length === 1) {
    // potential story node candidate
    const childNode = pack.stageNodes.find(
      (stageNode) => stageNode.uuid === actionNode.options[0]
    );
    if (!childNode) throw new Error("Wrong reference in options");

    // first pattern is an end-of-the-line node
    const pattern1 = !childNode.okTransition;
    // second pattern is a node that goes back
    const pattern2 =
      childNode.okTransition &&
      childNode.controlSettings.autoplay &&
      parentActionNodes.includes(childNode.okTransition.actionNode);

    if (pattern1 || pattern2) {
      // it's a story node
      return {
        optionsType: "story",
        uuid: stageNode.uuid,
        audioRef: stageNode.audio,
        imageRef: stageNode.image,

        storyDetails: {
          menuUuid: actionNode.uuid || actionNode.id,
          uuid: childNode.uuid,
          audioRef: childNode.audio,
        },
      };
    }
  }

  // it's a menu node
  return {
    optionsType: "menu",
    uuid: stageNode.uuid,
    audioRef: stageNode.audio,
    imageRef: stageNode.image,

    menuDetails: {
      uuid: actionNode.uuid || actionNode.id,
      options:
        // we limit the depth to 10 to avoid infinite loops
        depth < 10
          ? actionNode.options.map((optionUuid) => {
              const childNode = pack.stageNodes.find(
                (stageNode) => stageNode.uuid === optionUuid
              );
              if (!childNode) throw new Error("Wrong reference in options");

              const createdOption = treatStageNode(
                pack,
                childNode,
                [...parentActionNodes, actionNode.id],
                depth + 1
              );
              if (!createdOption) throw new Error("Wrong reference in options");
              return createdOption;
            })
          : [],
    },
  };
};

export const generateState = (pack: StudioPack): State => {
  const stageNode = pack.stageNodes[0];

  const createdOption = treatStageNode(pack, stageNode);
  if (!createdOption) throw new Error("Something is wrong with the pack");
  console.log(createdOption);
  return {
    version: 2,
    initialOption: createdOption,
    metadata: {
      author: pack.author || "",
      title: pack.title,
      description: pack.description,
    },
  };
};
