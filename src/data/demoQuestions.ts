import type { InterviewType, Level, SessionConfig } from "../types";

/**
 * Scripted prompts for the typed DEMO session. These are fixed questions, not AI output.
 * They exist so the app is usable without any API credentials.
 */
const fluency: Record<Level, string[]> = {
  beginner: [
    "Hello! Tell me about your day. What did you do today?",
    "What is your favourite food, and why do you like it?",
    "Who is a person you spend a lot of time with? Describe them.",
    "What do you like to do on weekends?",
  ],
  intermediate: [
    "How is your day going so far? Tell me about something interesting that happened.",
    "Describe a place you would like to visit, and explain why.",
    "What is one thing you have learned recently that you enjoyed?",
    "Tell me about a challenge you faced and how you handled it.",
  ],
  advanced: [
    "What is something you changed your mind about in the last few years, and what led to that?",
    "How do you think technology is changing the way people communicate?",
    "Describe a decision that was difficult to make. What trade-offs did you weigh?",
    "What makes a conversation memorable for you?",
  ],
};

const interview: Record<InterviewType, string[]> = {
  hr: [
    "Could you briefly introduce yourself?",
    "Why are you interested in this role?",
    "What would you say is your greatest strength?",
    "Where do you see yourself in three years?",
  ],
  behavioural: [
    "Tell me about a time you worked in a team to finish something difficult.",
    "Describe a situation where you disagreed with someone. What did you do?",
    "Tell me about a time you made a mistake. What did you learn?",
    "Describe a goal you set for yourself and how you achieved it.",
  ],
  technical: [
    "Describe a technical project you are proud of and your part in it.",
    "How would you explain the difference between a process and a thread to a beginner?",
    "Walk me through how you would debug a program that works on your machine but fails elsewhere.",
    "What is one technology you would like to learn next, and why?",
  ],
};

const group = [
  "Moderator (scripted): Welcome. Please share your opening statement on the topic.",
  "Moderator (scripted): Thank you. Can you give one reason or example that supports your view?",
  "Moderator (scripted): Imagine someone disagrees with you. How would you respond respectfully?",
  "Moderator (scripted): Please finish with a short concluding statement.",
];

const impromptu = [
  "When you are ready, type your speech on the topic above. Try for an opening, two main points and a closing line.",
  "Add one specific example to support your main point.",
  "Finish with a one-sentence conclusion.",
];

export function demoQuestionsFor(config: SessionConfig): string[] {
  switch (config.mode) {
    case "fluency":
      return fluency[config.level];
    case "interview":
      return interview[config.interviewType ?? "hr"];
    case "group":
      return group;
    case "impromptu":
      return impromptu;
  }
}
