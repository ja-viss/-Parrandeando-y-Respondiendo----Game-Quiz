
"use server";

import fs from "fs/promises";
import path from "path";
import { GameResults } from "@/lib/types";

export interface ScoreEntry extends GameResults {
    date: string;
}

// Determine the correct path based on the environment
// In production (like on Render), use a persistent storage path.
// In development, use the local data directory.
const isProduction = process.env.NODE_ENV === 'production';
const scoresDir = isProduction ? '/var/data/scores' : path.join(process.cwd(), 'data');
const scoresFilePath = path.join(scoresDir, 'scores.json');


// In-memory cache for scores to avoid repeated file reads
let scoresCache: ScoreEntry[] | null = null;

async function ensureDirExists() {
    try {
        await fs.access(scoresDir);
    } catch (error) {
        // If the directory doesn't exist, create it.
        // This is crucial for the first run in a persistent environment.
        await fs.mkdir(scoresDir, { recursive: true });
    }
}


async function getScores(): Promise<ScoreEntry[]> {
    if (scoresCache !== null) {
        return scoresCache;
    }
    try {
        await ensureDirExists();
        const data = await fs.readFile(scoresFilePath, 'utf8');
        scoresCache = JSON.parse(data) as ScoreEntry[];
        return scoresCache;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return empty array and create an empty file
            await fs.writeFile(scoresFilePath, JSON.stringify([], null, 2), 'utf8');
            scoresCache = [];
            return scoresCache;
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
        
        // Add new score to the beginning of the array
        const newScores = [newScore, ...scores];

        // Keep only the latest 1000 scores
        const trimmedScores = newScores.slice(0, 1000);

        await fs.writeFile(scoresFilePath, JSON.stringify(trimmedScores, null, 2), 'utf8');
        
        // Update cache
        scoresCache = trimmedScores;

    } catch (error) {
        console.error("Error saving score:", error);
        // We throw here so the calling function knows something went wrong, but we can choose to handle it silently there.
        throw new Error("Could not save score.");
    }
}

export async function getLeaderboards() {
    const scores = await getScores();

    // Helper to get unique top players for a given list
    const getUniqueTopPlayers = (playersList: (GameResults["scores"][0] & { date: string, mode: string})[], limit: number) => {
        const uniquePlayers = new Map<string, typeof playersList[0]>();
        for (const player of playersList) {
            if (!player.name) continue; // Skip players with no name
            // Normalize nickname to be case-insensitive for uniqueness check
            const normalizedName = player.name.toLowerCase();
            const existingPlayer = uniquePlayers.get(normalizedName);
            if (!existingPlayer || player.score > existingPlayer.score) {
                // Store with original casing
                uniquePlayers.set(normalizedName, player);
            }
        }
        return Array.from(uniquePlayers.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    };

    const allPlayers = scores.flatMap(game => game.scores.map(player => ({ ...player, date: game.date, mode: game.mode })));
    const allTimeTopPlayers = getUniqueTopPlayers(allPlayers, 10);

    const getTopForMode = (mode: 'solo' | 'group' | 'survival') => {
        const modePlayers = allPlayers.filter(p => p.mode === mode);
        return getUniqueTopPlayers(modePlayers, 5);
    };

    const getTopStreaks = () => {
        const streakPlayers = scores
            .filter(game => game.mode === 'survival' && game.survivalStreak && game.survivalStreak > 0)
            .map(game => ({
                name: game.scores[0]?.name || 'Anónimo',
                streak: game.survivalStreak || 0,
                date: game.date,
            }));

        const uniqueStreaks = new Map<string, typeof streakPlayers[0]>();
        for (const player of streakPlayers) {
            if (!player.name) continue;
            const normalizedName = player.name.toLowerCase();
            const existingPlayer = uniqueStreaks.get(normalizedName);
            if (!existingPlayer || player.streak > existingPlayer.streak) {
                uniqueStreaks.set(normalizedName, player);
            }
        }

        return Array.from(uniqueStreaks.values())
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 5);
    };

    return {
        allTime: allTimeTopPlayers,
        solo: getTopForMode('solo'),
        group: getTopForMode('group'),
        survival: getTopForMode('survival'),
        survivalStreaks: getTopStreaks(),
    };
}
