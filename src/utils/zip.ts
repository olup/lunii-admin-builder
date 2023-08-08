import JSZip from "jszip";
import { getAssetDirectory } from "./fs";

// todo : type packObject
// eslint-disable-next-line
export const zipAssets = async (packObject: any) => {
  const zip = new JSZip();

  const assets = await getAssetDirectory();
  // get all files in assets
  const fileHandles = await assets.values();
  for await (const handle of fileHandles) {
    const fileHandle = await (handle as FileSystemFileHandle).getFile();
    zip.file("assets/" + handle.name, fileHandle);
  }
  return zip.generateAsync({ type: "blob" });
};
