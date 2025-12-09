"use server";

import fs from "fs/promises";
import path from "path";
import { GameResults } from "@/lib/types";

export interface ScoreEntry extends GameResults {
    date: string;
}

const scoresFilePath = path.join(process.cwd(), 'src', 'data', 'scores.json');

async function getScores(): Promise<ScoreEntry[]> {
    try {
        const data = await fs.readFile(scoresFilePath, 'utf8');
        if (!data) {
            return [];
        }
        return JSON.parse(data) as ScoreEntry[];
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty array
            return [];
        }
        console.error("Error reading scores file:", error);
        throw new Error("Could not retrieve scores.");
    }
}

export async function saveScore(result: GameResults): Promise<void> {
    try {
        const scores = await getScores();
        const newScore: ScoreEntry = {
            ...result,
            date: new Date().toISOString(),
        };
        scores.push(newScore);

        // Keep only the latest 1000 scores to prevent file from getting too large
        const sortedScores = scores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const trimmedScores = sortedScores.slice(0, 1000);

        await fs.writeFile(scoresFilePath, JSON.stringify(trimmedScores, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving score:", error);
        // We throw here so the calling function knows something went wrong, but we can choose to handle it silently there.
        throw new Error("Could not save score.");
    }
}

export async function getLeaderboards() {
    const scores = await getScores();
    
    // Sort all players from all games by score for the all-time leaderboard
    const allTimeTopPlayers = scores
        .flatMap(game => game.scores.map(player => ({ ...player, date: game.date, mode: game.mode })))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
        
    const getTopForMode = (mode: 'solo' | 'group' | 'survival') => {
        return scores
            .filter(game => game.mode === mode)
            .flatMap(game => game.scores.map(player => ({ ...player, date: game.date, mode: game.mode })))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }
    
    const getTopStreaks = () => {
        return scores
            .filter(game => game.mode === 'survival' && game.survivalStreak && game.survivalStreak > 0)
            .sort((a, b) => (b.survivalStreak || 0) - (a.survivalStreak || 0))
            .map(game => ({
                name: game.scores[0]?.name || 'Anónimo',
                streak: game.survivalStreak || 0,
                date: game.date
            }))
            .slice(0, 5);
    }

    return {
        allTime: allTimeTopPlayers,
        solo: getTopForMode('solo'),
        group: getTopForMode('group'),
        survival: getTopForMode('survival'),
        survivalStreaks: getTopStreaks(),
    };
}
