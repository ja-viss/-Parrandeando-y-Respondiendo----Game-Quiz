'use server';
/**
 * @fileOverview AI actions for the quiz application.
 * This file contains functions that interact with the Genkit AI model.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { QuizQuestion, Difficulty, GameCategory } from "@/lib/types";


// Schema for the polishing prompt input
const PolishPromptInputSchema = z.object({
  question: z.string().describe('The original question text.'),
});

// Schema for the polishing prompt output
const PolishPromptOutputSchema = z.object({
    pregunta_final: z.string().optional(),
    status: z.string().optional()
});


const QuestionGenerationInputSchema = z.object({
    difficulty: z.nativeEnum(Difficulty).describe("The difficulty of the question to generate."),
    category: z.nativeEnum(GameCategory).describe("The category for the question."),
    existingQuestions: z.array(z.string()).describe("A list of existing question titles to avoid repetition."),
});

const QuestionGenerationOutputSchema = z.object({
  id: z.string().describe("A unique ID for the question (e.g., 'ai-gen-123')."),
  dificultad: z.nativeEnum(Difficulty).describe("The difficulty level."),
  nivel: z.enum(['Fácil', 'Medio', 'Experto']).describe("The difficulty label."),
  categoria: z.nativeEnum(GameCategory).describe("The category of the question."),
  pregunta: z.string().describe("The question text, written in authentic Venezuelan colloquial Spanish."),
  opciones: z.array(z.string()).length(4).describe("An array of 4 possible answers."),
  respuestaCorrecta: z.string().describe("The correct answer, which must be one of the options."),
}).describe('A single Venezuelan Christmas quiz question object.');


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
    4.  Formato Estricto de Salida: DEBES responder únicamente con un objeto JSON simple que contenga la "pregunta_final".
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

const generateQuestionPrompt = ai.definePrompt({
    name: 'generateQuestionPrompt',
    input: { schema: QuestionGenerationInputSchema },
    output: { schema: QuestionGenerationOutputSchema },
    prompt: `
      Tu Rol: Eres un Creador de Contenido Experto en la Cultura Navideña Venezolana y un Maestro de la Jerga Criolla. Tu misión es generar una pregunta de trivia que sea desafiante, divertida y 100% auténtica.

      Instrucciones Clave:
      1.  **Coherencia de Categoría (Regla de Oro)**: La pregunta, las opciones y la respuesta DEBEN pertenecer ESTRICTAMENTE a la categoría solicitada ({{category}}). Si la categoría es 'Gastronomía', habla de comida. Si es 'Música y Parrandas', habla de música. NO mezcles temas. Una pregunta de comida no puede tener opciones sobre fuegos artificiales.
      2.  **Originalidad Absoluta**: Crea una pregunta COMPLETAMENTE NUEVA que no esté en la lista de preguntas existentes. La creatividad es clave.
      3.  **Temática Navideña Venezolana**: La pregunta DEBE ser sobre música (gaitas, aguinaldos), gastronomía (hallacas, pan de jamón), tradiciones (cañonazo, patinatas) o folclore regional (San Benito, locainas) de la Navidad en Venezuela.
      4.  **Nivel de Dificultad**: Ajusta la complejidad de la pregunta según la dificultad solicitada ({{difficulty}}).
          -   **Juguete de Niño (Fácil)**: Conocimiento general que casi cualquier venezolano debería saber.
          -   **Palo 'e Ron (Medio)**: Requiere un poco más de detalle o conocimiento específico.
          -   **¡El Cañonazo! (Experto)**: Preguntas para los "eruditos" de la cultura venezolana, con detalles históricos, técnicos o regionales muy específicos.
      5.  **Estilo y Tono**:
          -   **Lenguaje Coloquial**: Usa jerga venezolana de forma natural y fluida. ¡Que suene como un pana echando un cuento! (ej. "chamo", "vaina", "chévere", "arrecho", "pelúa").
          -   **Evita Extranjerismos**: No uses jerga de otros países hispanohablantes.
      6.  **Estructura de la Salida (JSON Obligatorio)**:
          -   **id**: Un ID único, como 'ai-gen-' seguido de números aleatorios.
          -   **dificultad**: El nivel de dificultad solicitado ({{difficulty}}).
          -   **nivel**: La etiqueta correspondiente ('Fácil', 'Medio', o 'Experto').
          -   **categoria**: La categoría solicitada ({{category}}).
          -   **pregunta**: El texto de la pregunta.
          -   **opciones**: Un arreglo con CUATRO opciones. Tres deben ser incorrectas pero plausibles (¡para confundir al enemigo!).
          -   **respuestaCorrecta**: El texto exacto de la respuesta correcta.

      Preguntas Existentes a Evitar:
      {{#each existingQuestions}}
      - {{{this}}}
      {{/each}}

      Ahora, ¡inspírate y crea una pregunta mundial!
    `,
    config: {
        temperature: 0.8,
    },
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


export async function createVenezuelanQuizQuestion(
  difficulty: Difficulty,
  category: GameCategory,
  existingQuestions: string[]
): Promise<QuizQuestion> {
  try {
    const { output } = await generateQuestionPrompt({
        difficulty,
        category,
        existingQuestions,
    });

    if (!output || !output.pregunta || !output.opciones || !output.respuestaCorrecta) {
        throw new Error("AI generated an invalid question structure.");
    }
    
    // Final validation to ensure the response matches the category, as requested
    if (output.categoria !== category) {
        console.warn(`AI generated a question for category '${output.categoria}' but '${category}' was requested. Retrying...`);
        // We could retry, but for now we'll throw to trigger the fallback, which is more robust.
        throw new Error(`AI category mismatch: requested ${category}, got ${output.categoria}`);
    }

    return output;

  } catch(error) {
    console.error("Error generating new quiz question:", error);
    // This throw will be caught by getQuizQuestions and will trigger the fallback.
    throw error;
  }
}
