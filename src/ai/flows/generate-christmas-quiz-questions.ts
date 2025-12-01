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
  prompt: `Eres un historiador experto en tradiciones navideñas venezolanas, pero hablas como un pana de Caracas. Tu misión es crear {{numQuestions}} preguntas difíciles sobre la {{category}}, redactadas en español con un tono coloquial y auténtico de Venezuela.

Reglas de Estilo y Dialecto (Mandatorio):
- **Voz y Tono**: Usa un tono que refleje el habla cotidiana venezolana. Mete jerga como "chamo(a)", "pana", "chévere", "vaina", "coroto", "echar broma", y el "pues" al final.
- **Contexto Navideño Coloquial**: Usa frases como "¿Y esta vaina de dónde salió?", "A ver, mi pana, ¿cuál es el coroto que...", o "Échale un ojo a esto, pues...".
- **Dificultad Intacta**: El dialecto es para el estilo, no para bajarle dos a la dificultad. Las preguntas deben ser para expertos, que dejen a la gente pensando.

Reglas de Dificultad y Variedad:
- **Profundidad Histórica**: Las preguntas deben ir más allá de lo básico. Habla de orígenes, fechas, nombres de compositores, cronistas, y cómo han cambiado las tradiciones.
- **Detalle Regional**: Incluye preguntas sobre las diferencias entre regiones (ej. la hallaca de Oriente vs. la de los Andes; tradiciones únicas del Zulia).
- **Variedad Temática**:
  - **gastronomy**: Pregunta por ingredientes controversiales de la hallaca (como el garbanzo), el origen real de la receta del pan de jamón, o nombres de licores artesanales navideños que poca gente conoce.
  - **music**: Exige saber nombres de compositores de gaitas famosas, versos específicos de aguinaldos, la diferencia técnica entre "parranda" y "aguinaldo", o para qué sirve el furruco.
  - **customs**: Pregunta por las patinatas (horarios, si las prohibieron alguna vez), el origen exacto del Cañonazo en Caracas, o detalles del Paseo del Niño que no salen en Wikipedia.

Formato: Cada pregunta debe tener cuatro opciones. El resultado debe ser un JSON con un array de preguntas, cada una con "question", "answer", y "options". Todo en español venezolano. Asegúrate de que no haya preguntas repetidas y que generes exactamente {{numQuestions}}.

Ejemplo para 'gastronomy':
[{
  "question": "Chamo, hablando claro, ¿cuál es ese ingrediente que algunos le echan a la hallaca andina y que a los puristas les da una vaina?",
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
