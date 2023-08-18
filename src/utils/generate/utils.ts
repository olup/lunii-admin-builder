import { OptionType } from "../../store/store";

export const getBackMenu = (
  oIndex: Record<string, OptionType>,
  optionUuid: string
) => {
  const option = oIndex[optionUuid];
  if (!option) throw new Error("Option not found");

  if (!option.parentOptionUuid) return null;
  const parent = oIndex[option.parentOptionUuid];
  if (!parent) throw new Error("Parent not found");
  if (!parent.parentOptionUuid) return null;
  const grandparent = oIndex[parent.parentOptionUuid];
  if (!grandparent) throw new Error("Grandparent not found");
  const uuid = grandparent.menuDetails!.uuid;
  const index = grandparent.menuDetails!.options.findIndex(
    (uuid) => uuid === parent.uuid
  );
  return { uuid, index };
};

export const getNextStory = (
  oIndex: Record<string, OptionType>,
  optionUuid: string
) => {
  const parentMenu = getBackMenu(oIndex, optionUuid);
  if (!parentMenu) return null;
  const parent = oIndex[parentMenu.uuid];
  if (!parent) throw new Error("Parent not found");
  if (parent.menuDetails!.options.length <= parentMenu.index + 1) return null;
  const nextOptionUuid = parent.menuDetails!.options[parentMenu.index + 1];
  const nextOption = oIndex[nextOptionUuid];
  if (!nextOption) throw new Error("Next story parent not found");
  if (nextOption.menuDetails!.to !== "story") return null;
  return nextOption.menuDetails!.uuid;
};
