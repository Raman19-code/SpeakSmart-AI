import type { LocalFeedback, TranscriptEntry } from "../types";

const FILLER_PHRASES = ["um", "uh", "erm", "er", "you know", "i mean", "basically", "actually", "kind of", "sort of"];

const STOPWORDS = new Set(
  "a an and are as at be but by for from had has have he her his i if in into is it its me my of on or our she so that the their them then there they this to was we were what when which who will with you your not do did does just very really can could would should about also than too".split(
    " ",
  ),
);

const words = (text: string) => text.toLowerCase().match(/[a-z']+/g) ?? [];

function countPhrase(text: string, phrase: string): number {
  const re = new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`, "g");
  return (text.match(re) ?? []).length;
}

/**
 * Measurable, non-AI statistics about what the learner said.
 * This says nothing about grammar or vocabulary quality; it only counts things.
 */
export function analyseTranscript(transcript: TranscriptEntry[]): LocalFeedback {
  const learner = transcript.filter((t) => t.role === "learner");
  const perTurn = learner.map((t) => words(t.text).length);
  const wordCount = perTurn.reduce((a, b) => a + b, 0);
  const turns = learner.length;
  const avgWordsPerTurn = turns ? Math.round((wordCount / turns) * 10) / 10 : 0;
  const longestTurnWords = perTurn.length ? Math.max(...perTurn) : 0;

  const joined = learner.map((t) => t.text.toLowerCase()).join(" \n ");
  const fillers = FILLER_PHRASES.map((phrase) => ({ phrase, count: countPhrase(joined, phrase) }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);

  const freq = new Map<string, number>();
  for (const w of learner.flatMap((t) => words(t.text))) {
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const repeated = [...freq.entries()]
    .filter(([, c]) => c >= 4)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const tips: string[] = [];
  if (wordCount === 0) {
    tips.push("No spoken answers were captured in this session, so there is nothing to analyse yet.");
  } else {
    if (wordCount < 40) {
      tips.push(`You said about ${wordCount} words in total. Try longer answers: give a reason and an example for each point.`);
    }
    if (turns > 1 && avgWordsPerTurn < 8) {
      tips.push(`Your answers averaged about ${avgWordsPerTurn} words. Aim for two or three connected sentences.`);
    }
    const fillerTotal = fillers.reduce((a, f) => a + f.count, 0);
    if (fillerTotal >= 3) {
      tips.push(
        `Filler phrases appeared ${fillerTotal} times (${fillers.map((f) => `"${f.phrase}"`).join(", ")}). A short silent pause is usually better.`,
      );
    }
    if (repeated.length) {
      tips.push(
        `You repeated ${repeated.map((r) => `"${r.word}" (${r.count}x)`).join(", ")}. Try varying your wording where the meaning allows.`,
      );
    }
    if (tips.length === 0) {
      tips.push("Nothing stood out in these simple counts. For a review of grammar and vocabulary, AI feedback is needed.");
    }
  }

  return { wordCount, turns, avgWordsPerTurn, longestTurnWords, fillers, repeated, tips };
}
