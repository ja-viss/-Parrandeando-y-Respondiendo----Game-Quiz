'use server';

/**
 * @fileOverview Generates quiz questions focused on Venezuelan Christmas traditions.
 *
 * - generateChristmasQuizQuestions - A function that generates quiz questions.
 * - GenerateChristmasQuizQuestionsInput - The input type for the generateChristmasQuizQuestions function.
 * - GenerateChristmasQuizQuestionsOutput - The return type for the generateChristmasQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizCategorySchema = z.enum(['gastronomy', 'music', 'customs']);

const GenerateChristmasQuizQuestionsInputSchema = z.object({
  category: QuizCategorySchema.describe('The category of Venezuelan Christmas traditions to focus on: gastronomy, music, or customs.'),
  numQuestions: z.number().int().min(1).max(10).default(5).describe('The number of quiz questions to generate.'),
});
export type GenerateChristmasQuizQuestionsInput = z.infer<typeof GenerateChristmasQuizQuestionsInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  answer: z.string().describe('The correct answer to the quiz question.'),
  options: z.array(z.string()).describe('A list of possible answer options, including the correct answer.'),
});

const GenerateChristmasQuizQuestionsOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('The generated quiz questions.'),
});
export type GenerateChristmasQuizQuestionsOutput = z.infer<typeof GenerateChristmasQuizQuestionsOutputSchema>;

export async function generateChristmasQuizQuestions(input: GenerateChristmasQuizQuestionsInput): Promise<GenerateChristmasQuizQuestionsOutput> {
  return generateChristmasQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChristmasQuizQuestionsPrompt',
  input: {schema: GenerateChristmasQuizQuestionsInputSchema},
  output: {schema: GenerateChristmasQuizQuestionsOutputSchema},
  prompt: `You are an expert in Venezuelan Christmas traditions. Your task is to generate {{numQuestions}} quiz questions focused on {{category}}.\n\nEach question should have a question, a correct answer, and a list of possible answer options (including the correct answer). The output should be a JSON array of quiz questions, each with the fields \"question\", \"answer\", and \"options\".  Make sure that there are no duplicates and there are exactly {{numQuestions}} questions generated.\n\nExample:\n[{
  \"question\": \"What is a traditional Venezuelan Christmas dish made of cornmeal? (English)\",
  \"answer\": \"Hallaca\",
  \"options\": [\"Hallaca\", \"Arepa\", \"Empanada\", \"Cachapa\" ]
}]`,
});

const generateChristmasQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateChristmasQuizQuestionsFlow',
    inputSchema: GenerateChristmasQuizQuestionsInputSchema,
    outputSchema: GenerateChristmasQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
