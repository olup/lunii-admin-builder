import { State } from "../../store/store";
import { StudioPack } from "../../types";
import { copyAll } from "../fs";
import { unzip } from "../zip";
import { generateState } from "./generateState";

export const importPack = async (file: File): Promise<State> => {
  // create a temporary directory
  const root = await navigator.storage.getDirectory();
  const tmpDir = await root.getDirectoryHandle("importPackTmp", {
    create: true,
  });

  try {
    // unzip the file in the temporary directory
    await unzip(file, tmpDir);

    // read the story.json file
    const packFileHandle = await tmpDir.getFileHandle("story.json");
    const packFile = await packFileHandle.getFile();
    const packJson = await packFile.text();
    const pack: StudioPack = JSON.parse(packJson);

    // if (pack.source !== "LUNII_ADMIN_BUILDER")
    //   throw new UnsuportedPackError("Invalid pack");

    // copy all assets to the assets directory
    const tmpAssetsDir = await tmpDir.getDirectoryHandle("assets");
    const assetsDir = await root.getDirectoryHandle("assets", {
      create: true,
    });

    await copyAll(tmpAssetsDir, assetsDir);

    return generateState(pack);

    // generate a state from the pack
  } finally {
    // delete the temporary directory
    await root.removeEntry("importPackTmp", { recursive: true });
  }
};
