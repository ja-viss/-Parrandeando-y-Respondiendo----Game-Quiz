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
  prompt: `You are an expert historian specializing in Venezuelan Christmas traditions. Your task is to generate {{numQuestions}} challenging quiz questions in Spanish about the {{category}}.

The questions must be difficult and require deep knowledge. They should cover:
- Historical origins, specific dates, and key figures (composers, creators, etc.).
- Regional variations (e.g., differences in hallacas between Andean and Eastern regions, unique traditions from Zulia).
- Specific details that go beyond common knowledge.

For the category '{{category}}', focus on these topics:
- **gastronomy**: Ask about controversial or optional hallaca ingredients (like chickpeas), the origin of the pan de jamón recipe, or names of artisanal Christmas liquors.
- **music**: Ask about composers of famous gaitas, specific verses of aguinaldos, technical differences between 'parranda' and 'aguinaldo', or the specific function of instruments like the 'furruco'.
- **customs**: Ask about 'patinatas' (schedules, historical prohibitions), the exact origin of the 'Cañonazo' in Caracas, or specific details of the 'Paseo del Niño'.

Each question must have exactly four answer options. The output must be a JSON array of quiz questions, each with "question", "answer", and "options" fields, all in Spanish. Ensure there are no duplicates and exactly {{numQuestions}} questions are generated.

Example for 'gastronomy':
[{
  "question": "¿Qué ingrediente, considerado controversial por puristas, se incluye a veces en la hallaca andina?",
  "answer": "Garbanzos",
  "options": ["Alcaparras", "Garbanzos", "Pasas", "Aceitunas rellenas"]
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
