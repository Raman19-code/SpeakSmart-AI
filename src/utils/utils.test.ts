import { describe, expect, it } from "vitest";
import { analyseTranscript } from "./localAnalysis";
import { applyTranscript, emptyTranscript, isTranscriptMessage, type VapiTranscriptMessage } from "./transcript";
import { formatClock, formatMinutes } from "./format";
import { pickFromBank, TOPIC_BANK } from "../data/topics";
import { CATEGORIES } from "../data/topics";

const msg = (role: "assistant" | "user", transcriptType: "partial" | "final", transcript: string): VapiTranscriptMessage => ({
  type: "transcript",
  role,
  transcriptType,
  transcript,
});

describe("applyTranscript", () => {
  it("keeps partials out of committed entries", () => {
    const s = applyTranscript(emptyTranscript(), msg("user", "partial", "hello th"));
    expect(s.entries).toHaveLength(0);
    expect(s.partial).toEqual({ role: "learner", text: "hello th" });
  });

  it("commits finals and merges consecutive turns from the same speaker", () => {
    let s = emptyTranscript();
    s = applyTranscript(s, msg("assistant", "final", "How are you?"));
    s = applyTranscript(s, msg("user", "final", "I am fine."));
    s = applyTranscript(s, msg("user", "final", "Thank you."));
    expect(s.entries.map((e) => [e.role, e.text])).toEqual([
      ["coach", "How are you?"],
      ["learner", "I am fine. Thank you."],
    ]);
    expect(s.partial).toBeNull();
  });

  it("ignores empty finals", () => {
    const s = applyTranscript(emptyTranscript(), msg("user", "final", "   "));
    expect(s.entries).toHaveLength(0);
  });

  it("recognises only well-formed transcript messages", () => {
    expect(isTranscriptMessage(msg("user", "final", "x"))).toBe(true);
    expect(isTranscriptMessage({ type: "speech-update" })).toBe(false);
    expect(isTranscriptMessage(null)).toBe(false);
  });
});

describe("analyseTranscript", () => {
  it("counts words, turns and fillers from learner lines only", () => {
    const stats = analyseTranscript([
      { id: "1", role: "coach", text: "Tell me about your day, please." },
      { id: "2", role: "learner", text: "Um I went to college and um you know it was fine." },
      { id: "3", role: "learner", text: "Um then I came home." },
    ]);
    expect(stats.turns).toBe(2);
    expect(stats.wordCount).toBe(17);
    expect(stats.fillers.find((f) => f.phrase === "um")?.count).toBe(3);
    expect(stats.fillers.find((f) => f.phrase === "you know")?.count).toBe(1);
  });

  it("does not count coach speech and handles empty sessions honestly", () => {
    const stats = analyseTranscript([{ id: "1", role: "coach", text: "Hello there" }]);
    expect(stats.wordCount).toBe(0);
    expect(stats.tips[0]).toMatch(/nothing to analyse/i);
  });

  it("flags repeated content words", () => {
    const text = "Technology technology technology technology is important.";
    const stats = analyseTranscript([{ id: "1", role: "learner", text }]);
    expect(stats.repeated[0]).toEqual({ word: "technology", count: 4 });
  });
});

describe("formatting and topics", () => {
  it("formats clocks and minutes", () => {
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(-3)).toBe("0:00");
    expect(formatMinutes(20)).toBe("<1 min");
    expect(formatMinutes(600)).toBe("10 min");
  });

  it("offers topics for every category and difficulty", () => {
    for (const c of CATEGORIES) {
      expect(TOPIC_BANK.some((t) => t.category === c.id)).toBe(true);
      const picked = pickFromBank(c.id, "easy", 3);
      expect(picked.length).toBeGreaterThan(0);
      expect(picked.every((t) => t.category === c.id)).toBe(true);
    }
  });

  it("prefers the requested difficulty first", () => {
    const picked = pickFromBank("technology", "hard", 2, () => 0.5);
    expect(picked[0].difficulty).toBe("hard");
  });
});
