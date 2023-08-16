/**
 * Checks if a given StudioPack is valid for mapping to a tree structure.
 * @param pack The StudioPack to check.
 * @throws An error if the pack cannot be mapped to a tree structure.
 */
import { StudioPack } from "../../types";

export const controlTreeStructure = (pack: StudioPack) => {
  // controls that listNode are registered only once
  const okTransitionNodeIds = pack.stageNodes
    .map((node) => node.okTransition?.actionNode)
    .filter((node) => node);
  // fail if there are duplicates
  if (new Set(okTransitionNodeIds).size !== okTransitionNodeIds.length) {
    console.log(okTransitionNodeIds, new Set(okTransitionNodeIds));
    throw new Error(
      "This pack cannot be mapped to a tree - duplicate okTransitions"
    );
  }

  // controls that stageNodes are registered only once
  const listOptionsIds = pack.actionNodes
    .map((node) => node.options)
    .flat()
    .filter((node) => node);
  // fail if there are duplicates
  if (new Set(listOptionsIds).size !== listOptionsIds.length) {
    throw new Error(
      "This pack cannot be mapped to a tree - duplicate listNode options"
    );
  }

  // controls that any home transition goes back to the node's grandparent
  for (const node of pack.stageNodes) {
    if (!node.homeTransition) continue;
    const homeNode = pack.actionNodes.find(
      (n) => n.uuid === node.homeTransition?.actionNode
    );
    if (!homeNode) {
      throw new Error(
        "This pack cannot be mapped to a tree - homeTransition node not found"
      );
    }

    // climbing up the tree, sorry for the variables' names
    const parentListNode = pack.actionNodes.find((n) =>
      n.options.includes(node.uuid)
    );
    if (!parentListNode)
      throw new Error(
        "This pack cannot be mapped to a tree - node has a homeTransition but canot be navigated up the tree"
      );
    const parentStageNode = pack.stageNodes.find(
      (n) => n.okTransition?.actionNode === parentListNode.id
    );
    if (!parentStageNode)
      throw new Error(
        "This pack cannot be mapped to a tree - node has a homeTransition but canot be navigated up the tree"
      );
    const grandparentListNode = pack.actionNodes.find((n) =>
      n.options.includes(parentStageNode.uuid)
    );
    if (!grandparentListNode)
      throw new Error(
        "This pack cannot be mapped to a tree - node has a homeTransition but canot be navigated up the tree"
      );

    if (grandparentListNode.id !== homeNode.id)
      throw new Error(
        "This pack cannot be mapped to a tree - node homeTransition doesn't go back to its direct parent"
      );
  }
};
