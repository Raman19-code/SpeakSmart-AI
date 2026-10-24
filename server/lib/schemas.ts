import { z } from "zod";

export const modeSchema = z.enum(["fluency", "impromptu", "group", "interview"]);
export const levelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const interviewTypeSchema = z.enum(["hr", "behavioural", "technical"]);
export const difficultySchema = z.enum(["easy", "medium", "hard"]);
export const categorySchema = z.enum([
  "technology",
  "education",
  "current-affairs",
  "social-issues",
  "business",
  "everyday-life",
]);

export type Mode = z.infer<typeof modeSchema>;
export type Level = z.infer<typeof levelSchema>;
export type InterviewType = z.infer<typeof interviewTypeSchema>;

export const assistantRequestSchema = z.object({
  mode: modeSchema,
  level: levelSchema,
  durationMinutes: z.number().int().min(1).max(30).default(10),
  topic: z.string().trim().min(1).max(300).optional(),
  role: z.string().trim().min(1).max(80).optional(),
  interviewType: interviewTypeSchema.optional(),
});
export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

export const topicsRequestSchema = z.object({
  category: categorySchema,
  difficulty: difficultySchema,
  count: z.number().int().min(1).max(6).default(3),
});

export const transcriptEntrySchema = z.object({
  role: z.enum(["learner", "coach"]),
  text: z.string().trim().min(1).max(2000),
});

export const feedbackRequestSchema = z.object({
  mode: modeSchema,
  level: levelSchema,
  topic: z.string().trim().max(300).optional(),
  role: z.string().trim().max(80).optional(),
  transcript: z.array(transcriptEntrySchema).min(1).max(200),
});
export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

const score = z.number().int().min(1).max(5);

/** Shape the model must return; validated before anything reaches the client. */
export const feedbackModelSchema = z.object({
  summary: z.string().min(1).max(1200),
  scores: z.object({
    clarity: score,
    grammar: score,
    organization: score,
    vocabulary: score,
    relevance: score.nullable().optional(),
  }),
  corrections: z
    .array(z.object({ original: z.string(), improved: z.string(), explanation: z.string() }))
    .max(8),
  vocabulary: z
    .array(
      z.object({
        original: z.string(),
        improved: z.string(),
        explanation: z.string(),
        example: z.string(),
      }),
    )
    .max(8),
  strengths: z.array(z.string()).max(6),
  improvements: z.array(z.string()).max(6),
  nextExercises: z.array(z.string()).max(5),
});
export type FeedbackModelOutput = z.infer<typeof feedbackModelSchema>;

export const topicsModelSchema = z.object({
  topics: z
    .array(
      z.object({
        title: z.string().min(3).max(160),
        prompt: z.string().min(3).max(400),
      }),
    )
    .min(1)
    .max(6),
});
