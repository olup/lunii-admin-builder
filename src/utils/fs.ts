import { OptionType, State } from "../store";
import { genrate } from "./generate";
import { getRandomFileName } from "./misc";
import { zipAssets } from "./zip";
import { saveAs } from "file-saver";

export const getAssetDirectory = async () => {
  const root = await navigator.storage.getDirectory();
  const assets = await root.getDirectoryHandle("assets", {
    create: true,
  });
  return assets;
};
export const cleanAllUnusedAssets = async (initialOption: OptionType) => {
  const assets = await getAssetDirectory();

  const stateFiles: string[] = [];

  // recursively get all file from the state
  const getFiles = (option: OptionType) => {
    if (option.storyAudioRef) stateFiles.push(option.storyAudioRef);
    if (option.titleImageRef) stateFiles.push(option.titleImageRef);
    if (option.titleAudioRef) stateFiles.push(option.titleAudioRef);
    if (option.options) {
      option.options.forEach((option) => getFiles(option));
    }
  };

  getFiles(initialOption);

  const files = await assets.values();

  for await (const file of files) {
    if (!stateFiles.includes(file.name)) {
      await assets.removeEntry(file.name);
    }
  }
};

export const exportPack = async (state: State) => {
  const packObject = genrate(state);
  const blob = await zipAssets(packObject);
  const filename = state.metadata.title
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  saveAs(blob, filename + ".zip");
};

export const loadFile = async (file: File | null): Promise<string> => {
  if (!file) throw new Error("No file provided");

  const assets = await getAssetDirectory();
  const fileName = getRandomFileName();
  const fileExt = file.name.split(".").pop();
  const filePath = `${fileName}.${fileExt}`;

  const localFile = await assets.getFileHandle(filePath, {
    create: true,
  });
  const writer = await localFile.createWritable();
  await writer.write(await file.arrayBuffer());
  await writer.close();

  return filePath;
};
