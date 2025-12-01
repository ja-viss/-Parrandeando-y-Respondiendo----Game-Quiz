import type { GenerateChristmasQuizQuestionsOutput } from "@/ai/flows/generate-christmas-quiz-questions";

export type QuizQuestion = GenerateChristmasQuizQuestionsOutput["questions"][0];

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type GameCategory = 'gastronomy' | 'music' | 'customs';

export type GameSettings = {
  mode: 'solo' | 'group' | 'survival';
  category: GameCategory;
  numQuestions: number;
  players?: Player[];
  timeLimit?: number; // in seconds for solo mode
  lives?: number; // for survival mode
};

export type GameResults = {
  scores: Player[];
  category: GameCategory;
  mode: 'solo' | 'group' | 'survival';
  survivalStreak?: number;
};
