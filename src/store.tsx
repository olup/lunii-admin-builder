import { observable } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { deepCopy } from "./utils/misc";

// initialize migrations
const V1toV2 = () => {
  const legacyJsonState = localStorage.getItem("state");
  if (!legacyJsonState) return;
  const legacyState = JSON.parse(legacyJsonState);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const treatOption = (option: any): OptionType => {
    const base: BaseOptionType = {
      uuid: option.uuid,
      audioRef: option.titleAudioRef,
      imageRef: option.titleImageRef,
    };

    if (option.optionsType === "menu") {
      return {
        ...base,

        optionsType: "menu",
        menuDetails: {
          uuid: option.actionUuid,
          options: option.options.map(treatOption),
        },
      };
    } else {
      return {
        ...base,
        optionsType: "story",
        storyDetails: {
          uuid: option.storyUuid,
          menuUuid: option.actionUuid,
          audioRef: option.storyAudioRef,
        },
      };
    }
  };
  treatOption(legacyState.initialOption);

  state$.state.set({
    metadata: legacyState.metadata,
    version: 2,
    initialOption: treatOption(legacyState.initialOption),
  });

  localStorage.removeItem("state");

  console.log("Migrated state from v1 to v2");
};

export type BaseOptionType = {
  uuid: string;
  imageRef?: string;
  audioRef?: string;
};
export type MenuOptionType = BaseOptionType & {
  optionsType: "menu";
  menuDetails: {
    uuid: string;
    options: OptionType[];
  };
};

export type StoryOptionType = BaseOptionType & {
  optionsType: "story";
  storyDetails: {
    uuid: string;
    menuUuid: string;
    audioRef?: string;
  };
};

export type OptionType = MenuOptionType | StoryOptionType;

export type State = {
  version: number;
  metadata: { title: string; author: string; description: string };
  initialOption: OptionType;
};

export const defaultState: State = {
  version: 2,
  metadata: {
    title: "",
    author: "",
    description: "",
  },
  initialOption: {
    uuid: crypto.randomUUID(),
    optionsType: "menu",
    imageRef: undefined,
    audioRef: undefined,
    menuDetails: {
      uuid: crypto.randomUUID(),
      options: [],
    },
  },
};
export const state$ = observable<{
  ui: {
    scale: number;
    redrawArrow: number;
  };
  state: State;
}>({
  ui: {
    scale: 1,
    redrawArrow: 0,
  },
  state: deepCopy(defaultState),
});
export const resetState = () => state$.state.set(deepCopy(defaultState));

configureObservablePersistence({
  persistLocal: ObservablePersistLocalStorage,
});

persistObservable(state$.state, {
  local: "stateV2",
});

// operate migrations
V1toV2();
