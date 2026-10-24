import type { Mode } from "../types";

export interface ModeInfo {
  mode: Mode;
  path: string;
  title: string;
  blurb: string;
}

export const MODES: ModeInfo[] = [
  {
    mode: "fluency",
    path: "/practice/fluency",
    title: "Fluency coach",
    blurb: "Relaxed conversation with gentle corrections and more natural phrasing, one question at a time.",
  },
  {
    mode: "impromptu",
    path: "/practice/impromptu",
    title: "Impromptu speech",
    blurb: "Pick a topic, take optional prep time, then speak. Get feedback on clarity, grammar, organization and vocabulary.",
  },
  {
    mode: "group",
    path: "/practice/group",
    title: "Group discussion",
    blurb: "Practise opening statements, counterarguments and turn-taking with an AI moderator and simulated AI participants.",
  },
  {
    mode: "interview",
    path: "/practice/interview",
    title: "Interview prep",
    blurb: "HR, behavioural or technical questions for your target role, with feedback after each answer.",
  },
];

export const modeInfo = (mode: Mode) => MODES.find((m) => m.mode === mode)!;
