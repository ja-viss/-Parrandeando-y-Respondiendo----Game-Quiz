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
    Tu Rol: Eres la Máxima Autoridad en el Dialecto Coloquial Venezolano. Tu trabajo es asegurar que el lenguaje sea auténtico, natural y libre de términos usados principalmente en otros países hispanohablantes (ej. México, Colombia, Chile, Perú, etc.).

    Reglas de Estilo Criollo (Mandato de Exclusión y Énfasis):
    1. Exclusión Estricta: DEBES evitar términos que son muy comunes en otros países y que los venezolanos no usan cotidianamente (ej. güey, chido, bacán, parce, bacano, chamba en el contexto de la jerga).
    2. Énfasis Criollo: Prioriza el uso fluido y natural de jerga genuinamente venezolana y regional:
        - Exclamaciones: ¡Na' Guará!, ¡Qué Molleja!, ¡Fino!
        - Sustantivos/Verbos: Vaina, Coroto, Pana, Chamo/a, Curda, Ladilla, Mamarracho, Pavita, Pelar bola, Estar pelando, Pepiao, Sifrino.
        - Frases: Usar el sufijo "pues" al final de las preguntas de forma fluida.
    3. Tono Festivo: Mantener el tono de conversación de "parranda," de alguien que está echando un cuento o vacilando con un pana en la calle.
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
