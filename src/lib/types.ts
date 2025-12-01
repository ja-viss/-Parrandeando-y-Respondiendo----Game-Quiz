

export enum Difficulty {
    NINO = "Juguete de Niño",
    RON = "Palo 'e Ron",
    CANONAZO = "¡El Cañonazo!",
}

export enum GameCategory {
    GASTRONOMIA = 'Gastronomía',
    MUSICA = 'Música y Parrandas',
    TRADICIONES = 'Tradiciones y Costumbres',
    FOLCLORE = 'Folclore Regional',
}

export type QuizQuestion = {
  id: string;
  dificultad: Difficulty;
  nivel: 'Fácil' | 'Medio' | 'Experto';
  categoria: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
};

export type GroupPowerUp = 'hallaca-de-oro' | 'palo-de-ciego' | 'la-ladilla' | 'el-estruendo';
export type SurvivalPowerUp = 'chiguire-lento' | 'soplon' | 'media-hallaca' | 'milagro-santo';

export type PowerUp = GroupPowerUp | SurvivalPowerUp;


export type Player = {
  id: string;
  name: string;
  score: number;
  powerUps: GroupPowerUp[];
  survivalPowerUps?: Partial<Record<SurvivalPowerUp, number>>;
};

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
