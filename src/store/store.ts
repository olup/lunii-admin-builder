import { event, observable } from "@legendapp/state";
import { cleanAllUnusedAssets } from "../utils/fs";
import { deepCopy } from "../utils/misc";

// define the state
export type OptionType = {
  uuid: string;
  type: "menu" | "story"; // is this node a menu or a story
  imageRef?: string;
  audioRef?: string;

  parentOptionUuid?: string;

  menuDetails?: {
    uuid: string;
    options: string[];
    to: "menu" | "story"; // where does this menu lead to
  };

  onEnd?: "stop" | "back" | "next";
};

export type State = {
  version: number;
  metadata: { title: string; author: string; description: string };
  initialOptionUuid: string;
  optionIndex: Record<string, OptionType>;
};

const initalUUid = crypto.randomUUID();

export const defaultState: State = {
  version: 4,
  metadata: {
    title: "",
    author: "",
    description: "",
  },
  optionIndex: {
    [initalUUid]: {
      uuid: initalUUid,
      type: "menu",
      menuDetails: {
        to: "menu",
        uuid: crypto.randomUUID(),
        options: [],
      },
    },
  },
  initialOptionUuid: initalUUid,
};
export const state$ = observable<{
  ui: {
    scale: number;
  };
  state: State;
}>({
  ui: {
    scale: 1,
  },
  state: deepCopy(defaultState),
});

export const redrawArrow = event();

state$.state.optionIndex.onChange((index) => {
  console.log("index updated", index.value);
  redrawArrow.fire();
  cleanAllUnusedAssets(index.value);
  //todo clean unsused options
});

export const resetState = () => state$.state.set(deepCopy(defaultState));

// persistObservable(state$.state, {
//   persistLocal: ObservablePersistLocalStorage,
//   local: {
//     name: "stateV3",
//   },
// });

export type Store = typeof state$;
