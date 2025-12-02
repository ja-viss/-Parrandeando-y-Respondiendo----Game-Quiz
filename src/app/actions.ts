
"use server";

import type { QuizQuestion, Difficulty, GameCategory } from "@/lib/types";
import allQuestions from '@/lib/banco_preguntas_venezuela.json';
import { polishQuestionDialect as polishQuestionWithAI, createVenezuelanQuizQuestion } from "@/ai/actions";

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function getFallbackQuestion(difficulty: Difficulty, category: GameCategory | 'all', existingQuestionIds: string[]): Promise<QuizQuestion[]> {
    console.warn(`AI generation failed. Falling back to local question bank.`);
    let questionsPool = (allQuestions as QuizQuestion[]).filter(q => !existingQuestionIds.includes(q.id));
    
    if (category !== 'all') {
      questionsPool = questionsPool.filter(q => q.categoria === category);
    }
    
    let filteredQuestions = questionsPool.filter(q => q.dificultad === difficulty);
    
    if (filteredQuestions.length < 1) {
        const fallbackPool = (allQuestions as QuizQuestion[]).filter(q => q.dificultad === difficulty && !existingQuestionIds.includes(q.id));
        const shuffledFallback = shuffleArray(fallbackPool);
        return shuffledFallback.slice(0, 1);
    }

    const shuffledQuestions = shuffleArray(filteredQuestions);
    return shuffledQuestions.slice(0, 1);
}

export async function getQuizQuestions(
    difficulty: Difficulty, 
    numQuestions: number, 
    category: GameCategory | 'all',
    useAI: boolean = false,
    existingQuestionIds: string[] = []
): Promise<QuizQuestion[]> {
  try {
    if (useAI) {
      try {
        const allCategories: GameCategory[] = ['Gastronomía', 'Música y Parrandas', 'Tradiciones y Costumbres', 'Folclore Regional'];
        const targetCategory = category === 'all' ? allCategories[Math.floor(Math.random() * allCategories.length)] : category;
        
        const existingQuestionsText = (allQuestions as QuizQuestion[])
              .filter(q => existingQuestionIds.includes(q.id))
              .map(q => q.pregunta);

        const aiQuestion = await createVenezuelanQuizQuestion(difficulty, targetCategory, existingQuestionsText);

        // Check if the AI returned the error-fallback question
        if (aiQuestion.id.startsWith('error-ai')) {
          throw new Error("AI returned fallback error question.");
        }
        
        return [aiQuestion];
      } catch (aiError) {
        console.error("AI question generation failed, getting fallback.", aiError);
        return await getFallbackQuestion(difficulty, category, existingQuestionIds);
      }
    }

    let questionsPool = allQuestions as QuizQuestion[];

    // 0. Filter out existing questions
    if(existingQuestionIds.length > 0) {
        questionsPool = questionsPool.filter(q => !existingQuestionIds.includes(q.id));
    }


    // 1. Filter by category if not 'all'
    if (category !== 'all') {
      questionsPool = questionsPool.filter(q => q.categoria === category);
    }
    
    // 2. Filter by the requested difficulty
    let filteredQuestions = questionsPool.filter(q => q.dificultad === difficulty);
    
    // If there aren't enough questions in the selected category/difficulty, use all questions of that difficulty
    if (filteredQuestions.length < numQuestions) {
        console.warn(`Not enough questions for category '${category}' and difficulty '${difficulty}'. Falling back to all questions of difficulty '${difficulty}'.`);
        const fallbackPool = (allQuestions as QuizQuestion[]).filter(q => q.dificultad === difficulty && !existingQuestionIds.includes(q.id));
        const shuffledFallback = shuffleArray(fallbackPool);
        return shuffledFallback.slice(0, numQuestions);
    }

    // 3. Shuffle the filtered questions to get random ones
    const shuffledQuestions = shuffleArray(filteredQuestions);

    // 4. Return the requested number of questions
    return shuffledQuestions.slice(0, numQuestions);

  } catch (error) {
    console.error("Error reading quiz questions from local file:", error);
    // Return a fallback question in case of an error
    return [
      {
        id: "error-1",
        pregunta: "No se pudo cargar la pregunta desde el archivo local. Por favor, intenta de nuevo.",
        respuestaCorrecta: "Error",
        opciones: ["Error", "Intentar de nuevo", "Volver", "Ayuda"],
        dificultad: "Juguete de Niño" as Difficulty,
        nivel: "Fácil",
        categoria: "Error"
      },
    ];
  }
}


/**
 * Takes a question object and uses an AI to "polish" its dialect to sound more like authentic Venezuelan Spanish.
 * This is a low-cost operation as it only refines existing text.
 * @param question The question object to polish.
 * @returns A new question object with the polished dialect.
 */
export async function polishQuestionDialect(question: QuizQuestion): Promise<QuizQuestion> {
    // We don't polish AI generated questions as they should come polished
    if(question.id.startsWith('ai-gen-')) {
        return question;
    }
    try {
        const polishedText = await polishQuestionWithAI(question.pregunta);
        return {
            ...question,
            pregunta: polishedText,
        };
    } catch(error) {
        console.error("Error polishing question dialect:", error);
        // If AI fails, return the original question
        return question;
    }
}
