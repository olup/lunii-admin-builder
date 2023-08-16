import { BaseOptionType, OptionType } from "./store";

// initialize migrations
export const V1toV2 = () => {
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

  const stateJson = JSON.stringify({
    metadata: legacyState.metadata,
    version: 2,
    initialOption: treatOption(legacyState.initialOption),
  });

  localStorage.setItem("stateV2", stateJson);
  localStorage.removeItem("state");

  console.log("Migrated state from v1 to v2");
};
