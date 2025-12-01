'use server';
/**
 * @fileOverview AI actions for the quiz application.
 * This file contains functions that interact with the Genkit AI model.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Schema for the polishing prompt
const PolishPromptInputSchema = z.object({
  question: z.string().describe('The original question text.'),
});

/**
 * Defines a Genkit prompt to refine a given text into authentic Venezuelan dialect.
 */
const polishDialectPrompt = ai.definePrompt({
  name: 'polishDialectPrompt',
  input: {schema: PolishPromptInputSchema},
  prompt: `
    Your Role: You are an expert editor specializing in Venezuelan culture and dialect.
    Your Task: Take the following trivia question and rewrite it to sound completely natural and authentic to how a Venezuelan would speak. Inject colloquialisms, slang ("vaina", "chamo", "pana"), and the typical friendly, informal tone. Do NOT change the factual core of the question, the options, or the answer. Only enhance the style.

    Original Question:
    "{{{question}}}"

    Return ONLY the rewritten question text, without any additional explanations.
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
  return output!;
}
