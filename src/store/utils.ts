import { state$ } from "./store";

export const cleanAllUnusedNode = (ignoredUuids?: string[]) => {
  const index$ = state$.state.nodeIndex;
  const index = index$.peek();

  const linkedOption = Object.values(index)
    .flatMap((o) => {
      if (o.type === "menu") return o.menuDetails!.options;
      return [];
    });

  linkedOption.push(...(ignoredUuids ?? []));

  const unusedOption = Object.keys(index).filter(
    (uuid) => !linkedOption.includes(uuid)
  );

  unusedOption.forEach((uuid) => {
    index$[uuid].delete();
  });

  if (unusedOption.length > 0) cleanAllUnusedNode(ignoredUuids);
};
