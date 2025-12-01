

export type QuizQuestion = {
  id: string;
  dificultad: Difficulty;
  nivel: 'Fácil' | 'Medio' | 'Experto';
  categoria: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
};

export type PowerUp = 'hallaca-de-oro' | 'palo-de-ciego' | 'la-ladilla' | 'el-estruendo';

export type Player = {
  id: string;
  name: string;
  score: number;
  powerUps: PowerUp[];
};

export type GameCategory = 'Gastronomía' | 'Música y Parrandas' | 'Tradiciones y Costumbres' | 'Folclore Regional';
export type Difficulty = "Juguete de Niño" | "Palo 'e Ron" | "¡El Cañonazo!";


export type GameSettings = {
  mode: 'solo' | 'group' | 'survival';
  category: GameCategory | 'all';
  numQuestions: number;
  players?: Player[];
  timeLimit?: number; // in seconds for solo mode
  lives?: number; // for survival mode
  difficulty?: Difficulty;
};

export type GameResults = {
  scores: Player[];
  category: GameCategory | 'all';
  mode: 'solo' | 'group' | 'survival';
  survivalStreak?: number;
};

