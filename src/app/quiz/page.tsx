"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getQuizQuestions } from '@/app/actions';
import type { GameSettings, QuizQuestion, Player, GameResults } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, Users, User, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const Leaderboard = ({ players }: { players: Player[] }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline text-2xl"><Trophy className="text-accent" />Puntuación</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {players.sort((a, b) => b.score - a.score).map((player, index) => (
          <li key={player.id} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${index === 0 ? 'text-accent' : ''}`}>{index + 1}. {player.name}</span>
            </div>
            <span className="font-bold text-primary">{player.score} pts</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);


export default function QuizPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const finishGame = useCallback(() => {
     const results: GameResults = {
        scores: players,
        category: settings!.category,
        mode: settings!.mode,
    };
    sessionStorage.setItem('quizResults', JSON.stringify(results));
    router.push('/results');
  }, [players, settings, router]);

  const handleNextQuestion = useCallback(() => {
    setIsAnswered(false);
    setSelectedAnswer(null);

    if (settings?.mode === 'group') {
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextPlayerIndex);

      // If we are back to the first player, move to the next question
      if (nextPlayerIndex === 0) {
        if (currentQuestionIndex < settings.numQuestions - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          finishGame();
        }
      }
    } else { // Solo mode
      if (settings && currentQuestionIndex < settings.numQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        finishGame();
      }
    }
  }, [settings, currentPlayerIndex, players.length, currentQuestionIndex, finishGame]);

  useEffect(() => {
    const storedSettings = sessionStorage.getItem('quizSettings');
    if (!storedSettings) {
      toast({ title: "Error", description: "No se encontraron configuraciones de juego. Volviendo al inicio.", variant: "destructive" });
      router.push('/');
      return;
    }
    const parsedSettings: GameSettings = JSON.parse(storedSettings);
    setSettings(parsedSettings);
    if (parsedSettings.mode === 'group' && parsedSettings.players) {
      setPlayers(parsedSettings.players);
    } else {
      setPlayers([{ id: 'solo-player', name: 'Tú', score: 0 }]);
    }

    if(parsedSettings.timeLimit) {
      setTimeLeft(parsedSettings.timeLimit);
    }

    const fetchQuestions = async () => {
      const fetchedQuestions = await getQuizQuestions(parsedSettings.category, parsedSettings.numQuestions);
      setQuestions(fetchedQuestions);
      setLoading(false);
    };

    fetchQuestions();
  }, [router, toast]);

   useEffect(() => {
    let timer: NodeJS.Timeout;
    if (settings?.mode === 'solo' && timeLeft !== null && timeLeft > 0 && !isAnswered) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev! > 0 ? prev! - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(timer);
  }, [timeLeft, settings, isAnswered, handleNextQuestion]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const shuffledOptions = useMemo(() => currentQuestion?.options.sort(() => Math.random() - 0.5), [currentQuestion]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answer);

    let scoreToAdd = 0;
    if (answer === currentQuestion.answer) {
        scoreToAdd = 10;
        if (settings?.mode === 'solo' && timeLeft) {
            scoreToAdd += Math.floor(timeLeft / (settings.timeLimit! / settings.numQuestions!) * 5); // Bonus time
        }
    }

    setPlayers(prevPlayers => prevPlayers.map((p, index) => 
      index === currentPlayerIndex ? { ...p, score: p.score + scoreToAdd } : p
    ));

    setTimeout(() => {
      handleNextQuestion();
    }, 1500); // Wait 1.5 seconds before going to the next question
  };
  
  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full max-w-2xl" />
        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
       <Button variant="ghost" className="absolute top-4 left-4" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Salir del Juego
        </Link>
      </Button>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 order-2 md:order-1">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Progress value={((currentQuestionIndex + 1) / settings.numQuestions) * 100} className="mb-4" />
              <CardDescription>Pregunta {currentQuestionIndex + 1} de {settings.numQuestions}</CardDescription>
              <CardTitle className="font-headline text-3xl md:text-4xl !mt-2">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shuffledOptions.map((option, index) => {
                  const isCorrect = option === currentQuestion.answer;
                  const isSelected = option === selectedAnswer;
                  
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className={cn(
                        "h-auto py-4 text-base whitespace-normal justify-start text-left transition-all duration-300",
                        isAnswered && isCorrect && "bg-green-500/80 border-green-500 text-white confetti-pop",
                        isAnswered && isSelected && !isCorrect && "bg-red-500/80 border-red-500 text-white shake",
                        isAnswered && !isSelected && "opacity-60"
                      )}
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswered}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full space-y-4 order-1 md:order-2">
            {settings.mode === 'group' ? (
                <>
                    <Alert>
                        <Users className="h-4 w-4" />
                        <AlertTitle className="font-bold">Turno de:</AlertTitle>
                        <AlertDescription className="text-lg text-primary">{currentPlayer.name}</AlertDescription>
                    </Alert>
                    <Leaderboard players={players} />
                </>
            ) : (
                <>
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle className="font-bold">Tiempo Restante</AlertTitle>
                        <AlertDescription className="text-2xl text-primary font-mono">{timeLeft}s</AlertDescription>
                    </Alert>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline text-2xl"><User className="text-accent" />Puntuación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-primary">{players[0].score} <span className="text-lg font-normal text-foreground/80">pts</span></p>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
