import { OptionType, State } from "../store/store";
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
    if (option.imageRef) stateFiles.push(option.imageRef);
    if (option.audioRef) stateFiles.push(option.audioRef);

    if (option.optionsType === "story") {
      if (option.storyDetails.audioRef)
        stateFiles.push(option.storyDetails.audioRef);
    }
    if (option.optionsType === "menu") {
      option.menuDetails.options.forEach((option) => getFiles(option));
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

export const copyAll = async (
  source: FileSystemDirectoryHandle,
  destination: FileSystemDirectoryHandle
) => {
  for await (const entry of source.values()) {
    if (entry.kind === "file") {
      const file = await entry.getFile();
      const writable = await destination
        .getFileHandle(entry.name, { create: true })
        .then((file) => file.createWritable());
      await writable.write(file);
      await writable.close();
    } else {
      const dir = await destination.getDirectoryHandle(entry.name, {
        create: true,
      });
      await copyAll(entry, dir);
    }
  }
};

export const writeFile = async (
  root: FileSystemDirectoryHandle,
  path: string,
  content: Uint8Array | Blob | string,
  createIfNotExists = false
) => {
  const fileHandle = await getFileHandleFromPath(root, path, createIfNotExists);
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
};

export async function getFileHandleFromPath(
  baseHandle: FileSystemDirectoryHandle,
  filePath: string,
  createIfNotExists = false
) {
  const parts = filePath.split("/").filter((part) => part !== ""); // Split the path into parts
  const fileName = parts.pop();
  if (!fileName) throw new Error(`Invalid file path: ${filePath}`);

  let currentHandle = baseHandle;

  for (const part of parts) {
    try {
      currentHandle = await currentHandle.getDirectoryHandle(part, {
        create: createIfNotExists,
      });
    } catch (error) {
      throw new Error(
        `Error getting or creating directory handle for "${part}": ${
          (error as Error).message
        }`
      );
    }
  }

  try {
    return currentHandle.getFileHandle(fileName, { create: createIfNotExists });
  } catch (error) {
    throw new Error(
      `Error creating or writing to file "${filePath}": ${
        (error as Error).message
      }`
    );
  }
}
