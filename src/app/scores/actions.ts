
"use server";

import fs from "fs/promises";
import path from "path";
import { GameResults, Player } from "@/lib/types";

export interface ScoreEntry extends GameResults {
    date: string;
}

const scoresFilePath = path.join(process.cwd(), 'data', 'scores.json');

// In-memory cache for scores to avoid repeated file reads
let scoresCache: ScoreEntry[] | null = null;

async function getScores(): Promise<ScoreEntry[]> {
    if (scoresCache !== null) {
        return scoresCache;
    }
    try {
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

export async function getScoresAsJsonString(): Promise<string> {
    const scores = await getScores();
    return JSON.stringify(scores, null, 2);
}

async function writeScores(scores: ScoreEntry[]): Promise<void> {
    const sortedScores = scores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const trimmedScores = sortedScores.slice(0, 1000); // Keep max 1000 scores
    await fs.writeFile(scoresFilePath, JSON.stringify(trimmedScores, null, 2), 'utf8');
    scoresCache = trimmedScores; // Update cache
}

export async function saveScore(result: GameResults): Promise<void> {
    try {
        const scores = await getScores();
        const newScore: ScoreEntry = {
            ...result,
            date: new Date().toISOString(),
        };
        
        await writeScores([newScore, ...scores]);

    } catch (error) {
        console.error("Error saving score:", error);
        // We fail silently on the client side, but log it on the server.
        // throw new Error("Could not save score.");
    }
}

export async function addScore(entry: Omit<ScoreEntry, 'category'>): Promise<{success: boolean, message: string}> {
     try {
        const scores = await getScores();
        const newScore: ScoreEntry = {
            ...entry,
            category: 'all', // Or handle this as needed
        };

        await writeScores([newScore, ...scores]);
        return { success: true, message: 'Puntaje añadido exitosamente.' };

    } catch (error: any) {
        console.error("Error adding score:", error);
        return { success: false, message: `Error al añadir el puntaje: ${error.message}` };
    }
}


export async function getLeaderboards() {
    const scores = await getScores();

    // Helper to get unique top players for a given list
    const getUniqueTopPlayers = (playersList: (Player & { date: string, mode: string})[], limit: number) => {
        const uniquePlayers = new Map<string, typeof playersList[0]>();
        for (const player of playersList) {
            if (!player.name) continue; // Skip players with no name
            // Normalize nickname to be case-insensitive for uniqueness check
            const normalizedName = player.name.toLowerCase();
            const existingPlayer = uniquePlayers.get(normalizedName);
            if (!existingPlayer || player.score > existingPlayer.score) {
                // Store with original casing
                uniquePlayers.set(normalizedName, { ...player, name: player.name });
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

export async function overwriteScores(scoresJSON: string): Promise<{success: boolean; message: string}> {
    try {
        let newScores: ScoreEntry[];
        try {
            newScores = JSON.parse(scoresJSON);
            if (!Array.isArray(newScores)) {
                 throw new Error("El JSON no es un array.");
            }
             // Basic validation of the first object
            if (newScores.length > 0 && (!newScores[0].date || !newScores[0].scores)) {
                throw new Error("El formato del JSON parece incorrecto. Faltan propiedades como 'date' o 'scores'.")
            }

        } catch (e: any) {
            return { success: false, message: `Error al procesar el JSON: ${e.message}` };
        }

        await writeScores(newScores);
        
        return { success: true, message: `¡${newScores.length} puntajes cargados exitosamente!` };

    } catch (error: any) {
        console.error("Error overwriting scores:", error);
        return { success: false, message: `Error al escribir el archivo: ${error.message}` };
    }
}
