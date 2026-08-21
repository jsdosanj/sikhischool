import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { quizzes } from "../../drizzle/schema";

// Sanitized for client use — strips the answer key. Grading happens
// server-side only (POST /api/quizzes/[id]/submit); the correct answer
// index is never sent to the browser.
export async function getQuizQuestionsForClient(quizId: string) {
  const db = await getDb();
  const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).get();
  if (!quiz) return null;
  const questions = quiz.questions as { q: string; options: string[] }[];
  return {
    id: quiz.id,
    questions: questions.map((q) => ({ q: q.q, options: q.options })),
  };
}
