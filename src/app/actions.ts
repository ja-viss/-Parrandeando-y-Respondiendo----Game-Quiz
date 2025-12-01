"use server";

import { generateChristmasQuizQuestions } from "@/ai/flows/generate-christmas-quiz-questions";
import type { GameCategory } from "@/lib/types";

export async function getQuizQuestions(category: GameCategory, numQuestions: number) {
  try {
    const result = await generateChristmasQuizQuestions({ category, numQuestions });
    return result.questions;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    // Return a fallback question in case of an error
    return [
      {
        question: "Failed to load question. Please try again.",
        answer: "Error",
        options: ["Error", "Try Again", "Go Back", "Help"],
      },
    ];
  }
}
