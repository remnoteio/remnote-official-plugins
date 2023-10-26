import {
  QueueEvent,
  WidgetLocation,
  renderWidget,
  useAPIEventListener,
  useSyncedStorageState,
  useTracker,
  usePlugin,
  useRunAsync,
  Rem,
  CardType,
  RichTextInterface,
} from "@remnote/plugin-sdk";
import { useRef, useState } from "react";

function TextToSpeechWidget() {
  const plugin = usePlugin();
  const currentlySpeaking = useRef(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [autoPlayEnabled] = useSyncedStorageState<boolean>(
    "autoPlayTextToSpeech",
    false
  );

  const cardType = useRunAsync(async () => {
    const widgetContext =
      await plugin.widget.getWidgetContext<WidgetLocation.FlashcardUnder>();
    const card = await plugin.card.findOne(widgetContext?.cardId);
    return await card?.getType();
  }, []);

  const contextRem = useRunAsync(async () => {
    const widgetContext =
      await plugin.widget.getWidgetContext<WidgetLocation.FlashcardUnder>();
    return await plugin.rem.findOne(widgetContext.remId);
  }, []);

  const voice: string | undefined = useTracker(
    async (reactivePlugin) =>
      await reactivePlugin.settings.getSetting("text-to-speech-voice"),
    []
  );

  const hasTextToSpeechPowerup = useTracker(
    async (reactivePlugin) => {
      const widgetContext =
        await reactivePlugin.widget.getWidgetContext<WidgetLocation.FlashcardExtraDetail>();
      const contextRem = await reactivePlugin.rem.findOne(widgetContext.remId);
      const hasTextToSpeechPowerup = await contextRem?.hasPowerup(
        "textToSpeechPlugin"
      );

      const cardType = await (
        await reactivePlugin.card.findOne(widgetContext?.cardId)
      )?.getType();
      const frontText = await getFrontText(contextRem, cardType);
      const backText = await getBackText(contextRem, cardType);
      const isCloze = typeof cardType === "object" && "clozeId" in cardType;

      if (hasTextToSpeechPowerup && autoPlayEnabled) {
        if (showAnswer) {
          speak(cardType === "forward" || isCloze ? backText : frontText);
        } else {
          speak(cardType === "forward" || isCloze ? frontText : backText);
        }
      }

      return hasTextToSpeechPowerup;
    },
    [autoPlayEnabled, showAnswer]
  );

  useAPIEventListener(QueueEvent.RevealAnswer, undefined, () => {
    currentlySpeaking.current = false;
    setShowAnswer(true);
  });

  const getFrontText = async (contextRem?: Rem, cardType?: CardType) => {
    const isCloze = typeof cardType === "object" && "clozeId" in cardType;
    return parseRichText(
      isCloze
        ? (contextRem?.text || [])
            ?.concat([" "])
            .concat(contextRem?.backText || [])
        : contextRem?.text,
      isCloze ? cardType.clozeId : undefined
    );
  };

  const getBackText = async (contextRem?: Rem, cardType?: CardType) => {
    const childrenRem = await contextRem?.getChildrenRem();
    const isMultiline =
      ((
        await Promise.all(childrenRem?.map((q) => q.isCardItem()) || [])
      ).filter(Boolean)?.length || 0) > 0;
    const isCloze = typeof cardType === "object" && "clozeId" in cardType;

    return isCloze
      ? parseRichText(
          (contextRem?.text || [])
            ?.concat([" "])
            .concat(contextRem?.backText || [])
        )
      : isMultiline
      ? parseMultilineText(childrenRem)
      : parseRichText(contextRem?.backText);
  };

  const parseMultilineText = async (childrenRem?: Rem[]) => {
    // Go through each child rem and parse the text for any cloze elements,
    // then join with a comma to have pauses between each line
    return (
      await Promise.all(childrenRem?.map((q) => parseRichText(q.text)) || [])
    ).join(", ");
  };

  const parseRichText = async (
    richText?: RichTextInterface,
    clozeId?: string
  ) => {
    return plugin.richText.toString(
      richText?.map((n) => {
        // Replace the cloze rich text element with "blank"
        // if the current card is a cloze and it has the same cloze id
        if (typeof n === "object" && "cId" in n) {
          if (clozeId && n?.cId === clozeId) {
            return "blank";
          }
        }
        return n;
      }) || []
    );
  };

  const speak = (text?: string) => {
    if (!text || currentlySpeaking.current) return;

    const utterance = new SpeechSynthesisUtterance(text);

    const utteranceVoice = voice
      ? speechSynthesis.getVoices().find((v) => v.name === voice) ?? null
      : null;

    utterance.voice = utteranceVoice;

    // "Debounce" the speaking
    utterance.onstart = () => {
      currentlySpeaking.current = true;
    };
    utterance.onend = () => {
      currentlySpeaking.current = false;
    };

    speechSynthesis.speak(utterance);
  };

  return hasTextToSpeechPowerup ? (
    <div className="flex items-center gap-2">
      {(showAnswer ||
        cardType === "forward" ||
        (typeof cardType === "object" && "clozeId" in cardType)) && (
        <div
          className="gap-2 py-3.5 px-4 whitespace-nowrap cursor-pointer select-none rounded-md rn-clr-background-accent text-white dark:rn-clr-content-primary flex items-center justify-between"
          onClick={async () => {
            speak(await getFrontText(contextRem, cardType));
          }}
        >
          <PlayIcon />
          Front
        </div>
      )}
      {(showAnswer || cardType === "backward") && (
        <div
          className="gap-2 py-3.5 px-4 whitespace-nowrap cursor-pointer select-none rounded-md rn-clr-background-accent text-white dark:rn-clr-content-primary flex items-center justify-between"
          onClick={async () => {
            speak(await getBackText(contextRem, cardType));
          }}
        >
          <PlayIcon />
          Back
        </div>
      )}
    </div>
  ) : (
    <></>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "12px",
        height: "12px",
      }}
    >
      <path
        d="M1.28418 15.6865C0.94401 15.6865 0.671875 15.5659 0.467773 15.3247C0.269857 15.0835 0.170898 14.7619 0.170898 14.3599L0.161621 2.26221C0.161621 1.86019 0.260579 1.53857 0.458496 1.29736C0.662598 1.05615 0.934733 0.935547 1.2749 0.935547C1.46045 0.935547 1.63363 0.972656 1.79443 1.04688C1.96143 1.11491 2.14388 1.19531 2.3418 1.28809L14.2632 7.07715C14.659 7.26888 14.9312 7.46061 15.0796 7.65234C15.228 7.84408 15.3022 8.06364 15.3022 8.31104C15.3022 8.55843 15.228 8.77799 15.0796 8.96973C14.9312 9.16146 14.659 9.35628 14.2632 9.5542L2.3418 15.334C2.15007 15.4329 1.9707 15.5164 1.80371 15.5845C1.6429 15.6525 1.46973 15.6865 1.28418 15.6865ZM1.74805 13.9238C1.7666 13.9238 1.78516 13.9207 1.80371 13.9146C1.82227 13.9022 1.84082 13.8929 1.85938 13.8867L13.2241 8.41309C13.2489 8.4069 13.2674 8.39453 13.2798 8.37598C13.2983 8.35742 13.3076 8.33577 13.3076 8.31104C13.3076 8.2863 13.2983 8.26774 13.2798 8.25537C13.2674 8.23682 13.2489 8.22135 13.2241 8.20898L1.85938 2.74463C1.84082 2.73226 1.82227 2.72298 1.80371 2.7168C1.78516 2.70443 1.7666 2.69824 1.74805 2.69824C1.6862 2.69824 1.65527 2.73535 1.65527 2.80957V13.8125C1.65527 13.8867 1.6862 13.9238 1.74805 13.9238Z"
        fill="currentColor"
      />
    </svg>
  );
}

renderWidget(TextToSpeechWidget);
