'use server';
/**
 * @fileOverview AI actions for the quiz application.
 * This file contains functions that interact with the Genkit AI model.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Schema for the polishing prompt input
const PolishPromptInputSchema = z.object({
  question: z.string().describe('The original question text.'),
});

// Schema for the polishing prompt output
const PolishPromptOutputSchema = z.object({
    pregunta_final: z.string().optional(),
    status: z.string().optional()
});


/**
 * Defines a Genkit prompt to refine a given text into authentic Venezuelan dialect.
 */
const polishDialectPrompt = ai.definePrompt({
  name: 'polishDialectPrompt',
  input: {schema: PolishPromptInputSchema},
  output: {schema: PolishPromptOutputSchema},
  prompt: `
    Tu Rol: Eres un Lingüista Experto en el Dialecto Coloquial Venezolano. Tu misión es tomar una pregunta de trivia (que ya es correcta y temática) y reescribirla para que el lenguaje sea más natural, más divertido y use la jerga criolla con fluidez y naturalidad.

    Reglas de Refinamiento (Mandatorio):
    1. Intensidad de Jerga: Incrementa la intensidad de la jerga. Usa términos como: "vaina," "molleja," "pana," "chamo/a," "coroto," "sifrinos," "burda," "pepiado," "chévere," y exclamaciones como "¡Na' guará!" o "¡Qué molleja!".
    2. Fluidez: Asegura que la pregunta fluya como una conversación real, a menudo terminando con "¿pues?" o "¿sabes?".
    3. Toque de Humor: Añade un toque de humor o exageración típica venezolana (ej. exagerar la dificultad o la emoción).
    4. Formato Estricto: DEBES responder con un objeto JSON simple. Si la pregunta no es sobre Navidad/Tradiciones venezolanas, recházala.

    Analiza y procesa la siguiente pregunta. Si aplica, reescríbela en dialecto venezolano. Devuelve solo el objeto JSON solicitado.

    Pregunta Original:
    "{{{question}}}"
  `,
  config: {
    temperature: 0.7, // Be creative but not wildly so.
  }
});


/**
 * Takes a string and uses an AI to "polish" its dialect to sound more like authentic Venezuelan Spanish.
 * @param questionText The original question text.
 * @returns The polished question text.
 */
export async function polishQuestionDialect(questionText: string): Promise<string> {
  try {
    const {output} = await polishDialectPrompt({ question: questionText });
    if (output?.pregunta_final) {
      return output.pregunta_final;
    }
    // If rejected or failed, return original text
    return questionText;
  } catch (error) {
    console.error("Error polishing question dialect:", error);
    // If AI fails, return the original question
    return questionText;
  }
}
