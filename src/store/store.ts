import { observable } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { deepCopy } from "../utils/misc";
import { V1toV2 } from "./migrations";

// define the state
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

    // onFinishReading?: "stop" | "back" | "next"; // defaults to stop
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

// operate migrations
V1toV2();

// define persistence
configureObservablePersistence({
  persistLocal: ObservablePersistLocalStorage,
});

persistObservable(state$.state, {
  local: "stateV2",
});

export type Store = typeof state$;
