import { downloadZip } from "client-zip";
import { OptionType, State } from "./store";

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

const menuControlSettings = {
  wheel: true,
  ok: true,
  home: true,
  pause: false,
  autoplay: false,
};

const storyControlSettings = {
  wheel: false,
  ok: false,
  home: true,
  pause: true,
  autoplay: true,
};

export const genrate = (state: State) => {
  if (
    !state.metadata.title ||
    !state.metadata.author ||
    !state.metadata.description
  ) {
    throw new Error("A pack must have a title, an author and a description");
  }

  // eslint-disable-next-line
  const stageNodes: any[] = [];
  // eslint-disable-next-line
  const actionNodes: any[] = [];

  const treatOption = (option: OptionType, parentMenuUuid?: string) => {
    // control that the option has a title image and audio
    if (!option.titleImageRef || !option.titleAudioRef) {
      throw new Error("A menu must have a title image and audio");
    }

    // if the node leads to a menu we register the coming menu
    if (option.optionsType === "menu") {
      // control that it has sub nodes
      if (option.options?.length === 0) {
        throw new Error("A menu must have at least one sub node");
      }

      const menuNode = {
        id: option.actionUuid,
        options: option.options?.map((option) => option.uuid),
      };
      actionNodes.push(menuNode);
    }

    // if the node leads to a story we register the coming story with its
    // single item  menu
    if (option.optionsType === "story") {
      if (!option.storyAudioRef) {
        throw new Error("A story must have an audio");
      }

      // register single item menu
      const menuNode = {
        id: option.storyActionUuid,
        options: [option.storyUuid],
      };
      actionNodes.push(menuNode);

      // register story node
      const storyNode = {
        uuid: option.storyUuid,
        image: null,
        audio: option.storyAudioRef,
        okTransition: null,
        homeTransition: {
          actionNode: parentMenuUuid,
          optionIndex: 0,
        },
        controlSettings: storyControlSettings,
      };
      stageNodes.push(storyNode);
    }

    const stageNode = {
      uuid: option.uuid,
      image: option.titleImageRef,
      audio: option.titleAudioRef,
      okTransition: {
        actionNode: option.actionUuid,
        optionIndex: 0,
      },
      homeTransition: parentMenuUuid
        ? {
            actionNode: parentMenuUuid,
            optionIndex: 0,
          }
        : null,
      controlSettings: menuControlSettings,
    };

    stageNodes.push(stageNode);

    // If the option leads to a menu, we treat each of its subNodes
    option.options?.forEach((option) => {
      treatOption(option, option.actionUuid);
    });
  };

  treatOption(state.initialOption);

  const packObject = {
    format: "v1",
    version: 1,

    title: state.metadata.title,
    author: state.metadata.author,
    description: state.metadata.description,

    source: "LUNII_ADMIN_BUILDER",

    stageNodes,
    actionNodes,
  };

  return packObject;
};

// todo : type packObject
// eslint-disable-next-line
export const zipAssets = async (packObject: any) => {
  const assets = await getAssetDirectory();
  // get all files in assets
  const fileHandles = await assets.values();
  const files: File[] = [];
  for await (const handle of fileHandles) {
    const fileHandle = await (handle as FileSystemFileHandle).getFile();
    const file = new File([fileHandle], "assets/" + handle.name);
    files.push(file);
  }

  return downloadZip([
    new File([JSON.stringify(packObject)], "story.json"),
    ...files,
  ]).blob();
};

export const deepCopy = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    // eslint-disable-next-line
    const copyArr: any[] = [];
    for (const item of obj) {
      copyArr.push(deepCopy(item));
    }
    return copyArr as T;
  }

  const copyObj = {};
  for (const key in obj) {
    // eslint-disable-next-line
    if (obj.hasOwnProperty(key)) {
      // eslint-disable-next-line
      // @ts-ignore
      copyObj[key] = deepCopy(obj[key]);
    }
  }
  return copyObj as T;
};

export const exportPack = async (state: State) => {
  const packObject = genrate(state);

  // get the ZIP stream in a Blob
  const blob = await zipAssets(packObject);

  // make and click a temporary link to download the Blob
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const filename = state.metadata.title
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  link.download = filename + ".zip";
  link.click();
  link.remove();
};
