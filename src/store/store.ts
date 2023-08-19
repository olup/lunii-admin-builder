import { event, observable } from "@legendapp/state";
import { cleanAllUnusedAssets } from "../utils/fs";
import { deepCopy } from "../utils/misc";
import { persistObservable } from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { cleanAllUnusedNode } from "./utils";

// define the state
export type NodeType = {
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
  version: 4;
  metadata: { title: string; author: string; description: string };
  initialNodeUuid: string;
  nodeIndex: Record<string, NodeType>;
};

const initalUUid = crypto.randomUUID();

export const defaultState: State = {
  version: 4,
  metadata: {
    title: "",
    author: "",
    description: "",
  },
  nodeIndex: {
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
  initialNodeUuid: initalUUid,
};
export const state$ = observable<{
  ui: {
    scale: number;
    defaultEndAction: "stop" | "back" | "next";
  };
  state: State;
}>({
  ui: {
    scale: 1,
    defaultEndAction: "stop",
  },
  state: deepCopy(defaultState),
});

export const redrawArrow = event();

state$.state.nodeIndex.onChange((index) => {
  console.log("index updated", index.value);
  redrawArrow.fire();

  cleanAllUnusedNode([state$.state.initialNodeUuid.peek()]);
  cleanAllUnusedAssets(state$.state.nodeIndex.peek());
});

export const resetState = () => state$.state.set(deepCopy(defaultState));

if (!localStorage.getItem("stateV4")) {
  localStorage.setItem("stateV4", JSON.stringify(defaultState));
}

persistObservable(state$.state, {
  persistLocal: ObservablePersistLocalStorage,
  local: {
    name: "stateV4",
  },
});

if (!localStorage.getItem("stateV4")) {
  resetState();
}

export type Store = typeof state$;
