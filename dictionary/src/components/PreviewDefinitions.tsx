import * as R from "react";
import { WordData, GroupedDefinition } from "../lib/models";
import { usePlugin } from "@remnote/plugin-sdk";
import { groupBy, capitalize } from "../lib/utils";
import ReactTooltip from "react-tooltip";

interface WordPreviewProps {
  wordData: WordData;
  onSelectDefinition: (d: GroupedDefinition) => void;
}

export const PreviewDefinitions: R.FC<WordPreviewProps> = (props) => {
  const plugin = usePlugin();
  const { word, phonetics, meanings } = props.wordData;
  const phonetic = phonetics[0];
  const audio = phonetic?.audio;
  const groupedMeanings = groupBy(meanings, (x) => x.partOfSpeech);
  return (
    <div>
      <ReactTooltip place={"right"} />
      <div className="flex flex-row items-center mb-4 rn-clr-background-primary">
        <div className="rn-clr-content-primary mr-3 text-lg font-semibold">{capitalize(word)}</div>
        {audio && (
          <img
            className="w-4 h-4 cursor-pointer rn-clr-content-tertiary"
            src={`${plugin.rootURL}audio.svg`}
            onClick={() => new Audio(audio).play()}
          />
        )}
      </div>
      {Object.entries(groupedMeanings)
        .map(([partOfSpeech, meanings]) => (
          <div className="mb-4">
            <div className="flex flex-row items-center mb-3">
              <div className="rn-clr-content-primary text-base font-medium mr-3">{partOfSpeech}</div>
              <img
                data-tip="Save to words list"
                className="w-4 h-4 cursor-pointer"
                src={`${plugin.rootURL}save.svg`}
                onClick={() =>
                  props.onSelectDefinition({
                    word,
                    phonetic,
                    meanings,
                    partOfSpeech,
                  })
                }
              />
            </div>
            {meanings.map((meaning) =>
              meaning.definitions.map((def, idx) => (
                <div className="mb-2">
                  <span className="rn-clr-content-secondary ml-3">{idx + 1}</span>{" "}
                  <span className="font-medium rn-clr-content-primary">
                    {def.definition.replace(/\.$/, "")}
                  </span>
                  {def.example ? (
                    <span className="italic rn-clr-content-primary">: {def.example}</span>
                  ) : (
                    ""
                  )}
                </div>
              ))
            )}
          </div>
        ))
        .flat()}
    </div>
  );
};
