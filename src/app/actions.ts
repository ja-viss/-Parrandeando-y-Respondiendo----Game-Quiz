"use server";

import type { GameCategory, QuizQuestion, Difficulty } from "@/lib/types";
import allQuestions from '@/lib/banco_preguntas_venezuela.json';

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function getQuizQuestions(difficulty: Difficulty, numQuestions: number): Promise<QuizQuestion[]> {
  try {
    // Filter questions by the requested difficulty
    const filteredQuestions = (allQuestions as QuizQuestion[]).filter(q => q.dificultad === difficulty);
    
    // Shuffle the filtered questions to get random ones
    const shuffledQuestions = shuffleArray(filteredQuestions);

    // Return the requested number of questions
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
        dificultad: "Juguete de Niño",
        nivel: "Fácil",
        categoria: "Error"
      },
    ];
  }
}
