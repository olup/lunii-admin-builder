export type PackMetadata = {
  description: string;
  packType: string;
  ref: string;
  title: string;
  uuid: string;
  installSource?: string;
};

export type StudioStageNode = {
  type: "stage" | "cover" | "story"; // is that used by studio ?
  uuid: string;
  audio?: string;
  image?: string;
  name: string;
  okTransition: {
    actionNode: string;
    optionIndex: number;
  } | null;
  homeTransition: {
    actionNode: string;
    optionIndex: number;
  } | null;
  controlSettings: {
    wheel: boolean;
    ok: boolean;
    home: boolean;
    pause: boolean;
    autoplay: boolean;
  };
};

export type StudioActionNode = {
  id: string;
  uuid?: string;
  options: string[];
  name?: string;
};

export type StudioPack = {
  description: string;
  title: string;
  uuid: string;
  version: number;
  format: string;

  author?: string;
  source?: string;

  stageNodes: StudioStageNode[];
  actionNodes: StudioActionNode[];
};
