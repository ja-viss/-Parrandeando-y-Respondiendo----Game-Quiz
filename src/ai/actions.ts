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
    Tu Rol: Eres un Filtrador Coloquial Venezolano. Tu trabajo es extremadamente eficiente: analizar una frase o pregunta de trivia, verificar si pertenece a la temática central Navidad/Tradiciones Venezolanas (hallaca, gaita, pernil, aguinaldos, costumbres decembrinas), y reescribirla con jerga venezolana, o rechazarla.

    Reglas de Token y Salida (Mandatorio):
    1.  Filtro Temático: Si la pregunta no es 100% sobre la Navidad venezolana, la rechazas.
    2.  Jerga: Si la apruebas, reescribe la pregunta de la forma más natural posible con jerga ("chamo", "pana", "vaina", "coroto", "pues", etc.).
    3.  Formato Estricto: DEBES responder con un objeto JSON simple.

    Analiza y procesa la siguiente pregunta. Si aplica, reescríbela en dialecto venezolano. Devuelve solo el objeto JSON solicitado.

    Pregunta Original:
    "{{{question}}}"
  `,
  config: {
    temperature: 0.5, // Be creative but not wildly so.
  }
});


/**
 * Takes a string and uses an AI to "polish" its dialect to sound more like authentic Venezuelan Spanish.
 * @param questionText The original question text.
 * @returns The polished question text.
 */
export async function polishQuestionDialect(questionText: string): Promise<string> {
  const {output} = await polishDialectPrompt({ question: questionText });
  if (output?.pregunta_final) {
    return output.pregunta_final;
  }
  // If rejected or failed, return original text
  return questionText;
}
