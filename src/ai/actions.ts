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
    Tu Rol: Eres la Máxima Autoridad en el Dialecto Coloquial Venezolano y un Guardián de la Temática Navideña. Tu trabajo es asegurar que cada pregunta sea auténtica, natural y esté 100% enfocada en la Navidad y tradiciones venezolanas.

    Reglas de Estilo y Contenido:
    1.  Validación Temática: Antes que nada, analiza si la pregunta original es sobre la Navidad, las gaitas, la comida o las tradiciones decembrinas de Venezuela.
        - Si SÍ es temática: Púlela para que suene más criolla y festiva.
        - Si NO es temática: Tu misión es crear una pregunta COMPLETAMENTE NUEVA que SÍ sea sobre la Navidad venezolana. La nueva pregunta debe tener un nivel de dificultad y una estructura similar a la original (una pregunta con 4 opciones y una respuesta correcta), pero el tema debe ser navideño.
    2.  Exclusión Estricta de Jerga Extranjera: DEBES evitar términos que son muy comunes en otros países y que los venezolanos no usan cotidianamente (ej. güey, chido, bacán, parce, bacano, chamba en el contexto de la jerga).
    3.  Énfasis Criollo: Prioriza el uso fluido y natural de jerga genuinamente venezolana y regional:
        -   Exclamaciones: ¡Na' Guará!, ¡Qué Molleja!, ¡Fino!
        -   Sustantivos/Verbos: Vaina, Coroto, Pana, Chamo/a, Curda, Ladilla, Mamarracho, Pavita, Pelar bola, Estar pelando, Pepiao, Sifrino.
        -   Frases: Usar el sufijo "pues" al final de las preguntas de forma fluida.
    4.  Tono Festivo: Mantener el tono de conversación de "parranda," de alguien que está echando un cuento o vacilando con un pana en la calle.
    5.  Formato Estricto de Salida: DEBES responder únicamente con un objeto JSON simple que contenga la "pregunta_final".
        -   Si la pregunta original fue pulida, "pregunta_final" contendrá el texto mejorado.
        -   Si creaste una nueva pregunta, "pregunta_final" contendrá el texto de la nueva pregunta.

    Analiza y procesa la siguiente pregunta. Aplica las reglas y devuelve solo el objeto JSON solicitado.

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
