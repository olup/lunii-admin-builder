import JSZip from "jszip";
import { getAssetDirectory, writeFile } from "./fs";

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

  zip.file("story.json", JSON.stringify(packObject));
  return zip.generateAsync({ type: "blob" });
};

// Extract zip to opfs
export async function unzip(zipFile: File, outDir: FileSystemDirectoryHandle) {
  try {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zipFile);

    for (const [relativePath, file] of Object.entries(zipData.files)) {
      if (!file.dir) {
        const fileData = await file.async("uint8array");
        // Normalize the path by replacing forward slashes with the appropriate separator
        const normalizedPath = relativePath.replace(/\//g, "/");
        await writeFile(outDir, normalizedPath, fileData, true);
      }
    }

    console.log("All files extracted and written to OPFS successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
