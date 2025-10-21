import { createCommand, type LexicalCommand } from "lexical";

export const SUPPORT_SPEECH_RECOGNITION: boolean = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

export const SPEECH_TO_TEXT_COMMAND: LexicalCommand<boolean> = createCommand("SPEECH_TO_TEXT_COMMAND");
