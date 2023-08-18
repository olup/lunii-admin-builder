import { OptionType } from "./store";

export const cleanAllUnusedOption = (index: Record<string, OptionType>) => {
  const linkedOption = Object.values(index)
    .map((o) => {
      if (o.type === "menu") return o.menuDetails!.options;
      return [];
    })
    .flat();

  const unusedOption = Object.keys(index).filter(
    (uuid) => !linkedOption.includes(uuid)
  );
  unusedOption.forEach((uuid) => delete index[uuid]);
  console.log(index);
  return index;
};
