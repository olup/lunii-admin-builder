import { NodeType, State } from "../../store/store";
import { StudioPack } from "../../types";

const getOptionType = (pack: StudioPack, stageNodeUuid: string) => {
  const stageNode = pack.stageNodes.find(
    (stageNode) => stageNode.uuid === stageNodeUuid
  );
  if (!stageNode) throw new Error("Wrong reference in options");

  // use type tags on the node
  if (stageNode.type.includes("menu")) return "menu";
  if (stageNode.type.includes("story")) return "story";

  // crude detection - rarely accurate
  if (stageNode.okTransition) return "menu";
  return "story";
};

const treatStageNode = (
  optionIndex: Record<string, NodeType>,
  pack: StudioPack,
  stageNodeUuid: string,
  parentNodeUuid?: string
): NodeType | undefined => {
  const stageNode = pack.stageNodes.find(
    (stageNode) => stageNode.uuid === stageNodeUuid
  );
  if (!stageNode) throw new Error("Wrong reference in options");

  const type = getOptionType(pack, stageNodeUuid);

  if (type === "story") {
    let onEnd: "stop" | "back" | "next" = "stop";
    if (
      stageNode.okTransition &&
      stageNode.okTransition?.actionNode ===
        stageNode.homeTransition?.actionNode
    )
      onEnd = "back";

    // it's a story node
    const option: NodeType = {
      uuid: stageNode.uuid,
      type,
      audioRef: stageNode.audio || undefined,
      imageRef: stageNode.image || undefined,
      parentOptionUuid: parentNodeUuid,
      onEnd,
    };
    optionIndex[option.uuid] = option;
    return;
  }

  // it's a menu node
  let to: "menu" | "story" = "menu";

  const actionNode = pack.actionNodes.find(
    (actionNode) => actionNode.id === stageNode.okTransition!.actionNode
  );

  if (!actionNode) throw new Error("Wrong reference in okTransition");

  if (actionNode.options.length === 1) {
    // potential story node candidate
    const childNode = pack.stageNodes.find(
      (stageNode) => stageNode.uuid === actionNode.options[0]
    );
    if (!childNode) throw new Error("Wrong reference in options");
    const type = getOptionType(pack, childNode.uuid);

    if (type === "story") to = "story";
  }

  // register the menu node
  const node: NodeType = {
    type: "menu",
    uuid: stageNode.uuid,
    audioRef: stageNode.audio || undefined,
    imageRef: stageNode.image || undefined,
    onEnd: "stop",
    parentOptionUuid: parentNodeUuid,

    menuDetails: {
      uuid: actionNode.uuid || actionNode.id,
      options: actionNode.options,
      to,
    },
  };

  optionIndex[node.uuid] = node;

  // treat sub nodes
  actionNode.options.forEach((optionUuid) => {
    treatStageNode(optionIndex, pack, optionUuid, node.uuid);
  });
  return;
};

export const generateState = (pack: StudioPack): State => {
  const stageNode = pack.stageNodes[0];
  if (!stageNode) throw new Error("No stage node found");

  const nodeIndex: Record<string, NodeType> = {};
  treatStageNode(nodeIndex, pack, stageNode.uuid);

  return {
    version: 4,
    initialNodeUuid: stageNode.uuid,
    nodeIndex,
    metadata: {
      author: pack.author || "",
      title: pack.title,
      description: pack.description,
    },
  };
};
