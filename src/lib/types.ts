
export type QuizQuestion = {
  id: string;
  dificultad: Difficulty;
  nivel: 'Fácil' | 'Medio' | 'Experto';
  categoria: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
};


export type Player = {
  id: string;
  name: string;
  score: number;
};

export type GameCategory = 'gastronomy' | 'music' | 'customs';
export type Difficulty = "Juguete de Niño" | "Palo 'e Ron" | "¡El Cañonazo!";


export type GameSettings = {
  mode: 'solo' | 'group' | 'survival';
  category: GameCategory;
  numQuestions: number;
  players?: Player[];
  timeLimit?: number; // in seconds for solo mode
  lives?: number; // for survival mode
  difficulty?: Difficulty;
};

export type GameResults = {
  scores: Player[];
  category: GameCategory;
  mode: 'solo' | 'group' | 'survival';
  survivalStreak?: number;
};
