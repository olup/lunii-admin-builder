import { observable } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { deepCopy } from "./utils";

export type OptionType = {
  uuid: string;
  optionsType: "story" | "menu";
  titleImageRef?: string;
  titleAudioRef?: string;

  storyUuid?: string;
  storyAudioRef?: string;

  actionUuid?: string;
  options?: OptionType[];
};

export type State = {
  metadata: { title: string; author: string; description: string };
  initialOption: OptionType;
};

export const defaultState: State = {
  metadata: {
    title: "",
    author: "",
    description: "",
  },
  initialOption: {
    uuid: crypto.randomUUID(),
    optionsType: "menu",
    titleImageRef: "",
    titleAudioRef: "",
    options: [],
    actionUuid: crypto.randomUUID(),

    // shouldn't be used as first node is always a menu
    storyUuid: crypto.randomUUID(),
    storyAudioRef: "",
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
  local: "state",
});
