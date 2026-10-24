import type { Category, Difficulty, Topic } from "../types";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "technology", label: "Technology" },
  { id: "education", label: "Education" },
  { id: "current-affairs", label: "Current affairs" },
  { id: "social-issues", label: "Social issues" },
  { id: "business", label: "Business" },
  { id: "everyday-life", label: "Everyday life" },
];

export const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: "easy", label: "Easy", hint: "Personal and concrete" },
  { id: "medium", label: "Medium", hint: "Opinion with reasons" },
  { id: "hard", label: "Hard", hint: "Abstract or debatable" },
];

type Row = [Category, Difficulty, string, string];

const rows: Row[] = [
  ["technology", "easy", "Your favourite app", "Describe an app you use every day and explain why it is useful to you."],
  ["technology", "medium", "Smartphones in the classroom", "Should students be allowed to use smartphones during lessons? Give reasons for your view."],
  ["technology", "medium", "Learning with AI tools", "How can AI tools help people learn a new skill, and what are the risks of relying on them?"],
  ["technology", "hard", "Privacy versus convenience", "Do people give up too much personal data in exchange for free digital services?"],

  ["education", "easy", "A teacher who inspired you", "Talk about a teacher or mentor who influenced you and what you learned from them."],
  ["education", "medium", "Online versus classroom learning", "Which is more effective for most students, online or in-person learning? Support your answer."],
  ["education", "medium", "Should exams be replaced by projects?", "Explain whether project-based assessment is a fairer way to measure learning."],
  ["education", "hard", "What is the purpose of education?", "Is education mainly about getting a job, or about something broader? Argue your position."],

  ["current-affairs", "easy", "A news topic you follow", "Describe a topic in the news that interests you and why you follow it."],
  ["current-affairs", "medium", "Social media as a news source", "Is social media a reliable way to get news? Discuss the benefits and dangers."],
  ["current-affairs", "medium", "Remote work and cities", "How might more remote work change cities and the way people live?"],
  ["current-affairs", "hard", "Climate responsibility", "Who should carry most responsibility for tackling climate change: individuals, companies or governments?"],

  ["social-issues", "easy", "A kind act you remember", "Describe a time someone was kind to you, or you were kind to someone else."],
  ["social-issues", "medium", "Volunteering", "Should community service be a required part of a student's education?"],
  ["social-issues", "medium", "Youth and mental health", "Why is it important to talk openly about stress and mental health among young people?"],
  ["social-issues", "hard", "Equal opportunity", "What does equal opportunity really mean, and how can a society move closer to it?"],

  ["business", "easy", "A shop or brand you like", "Talk about a business you enjoy using and what it does well."],
  ["business", "medium", "Startups versus big companies", "Would you rather start your career at a startup or a large company? Explain why."],
  ["business", "medium", "Customer service", "What makes a customer service experience excellent, and what makes it frustrating?"],
  ["business", "hard", "Profit and responsibility", "Should companies be judged only on profit, or also on their impact on society?"],

  ["everyday-life", "easy", "Your perfect weekend", "Describe how you would spend an ideal weekend and why."],
  ["everyday-life", "easy", "A skill you want to learn", "Talk about one skill you would like to learn this year and how you would start."],
  ["everyday-life", "medium", "City life or village life", "Which is a better place to live, a big city or a small town? Give reasons."],
  ["everyday-life", "hard", "Is being busy a good thing?", "Do we value being busy too much? Discuss how people should balance work and rest."],
];

export const TOPIC_BANK: Topic[] = rows.map(([category, difficulty, title, prompt], i) => ({
  id: `bank-${i}`,
  category,
  difficulty,
  title,
  prompt,
}));

/** Pick up to `count` topics from the built-in bank, shuffled so repeated clicks give variety. */
export function pickFromBank(
  category: Category,
  difficulty: Difficulty,
  count = 3,
  random: () => number = Math.random,
): Topic[] {
  const exact = TOPIC_BANK.filter((t) => t.category === category && t.difficulty === difficulty);
  const rest = TOPIC_BANK.filter((t) => t.category === category && t.difficulty !== difficulty);
  const shuffle = <T,>(arr: T[]) =>
    arr
      .map((v) => [random(), v] as const)
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v);
  return [...shuffle(exact), ...shuffle(rest)].slice(0, count);
}
