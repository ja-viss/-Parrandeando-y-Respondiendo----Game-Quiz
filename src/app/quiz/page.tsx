"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getQuizQuestions } from '@/app/actions';
import type { GameSettings, QuizQuestion, Player, GameResults, GameCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, Users, User, ArrowLeft, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const Leaderboard = ({ players }: { players: Player[] }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline text-2xl"><Trophy className="text-accent" />Puntuación</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {players.sort((a, b) => b.score - a.score).map((player, index) => (
          <li key={player.id} className={cn("flex justify-between items-center p-2 rounded-md bg-muted/50", index === 0 && "pulse")}>
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

const LivesIndicator = ({ lives }: { lives: number }) => (
    <div className="flex items-center gap-2">
        {[...Array(3)].map((_, i) => (
            <Heart key={i} className={cn("h-6 w-6 text-red-500 transition-all", i < lives ? 'fill-current' : 'opacity-25')} />
        ))}
    </div>
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
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const getDifficulty = (questionIndex: number): GameCategory => {
    if (questionIndex < 5) return 'gastronomy'; // Easy proxy
    if (questionIndex < 15) return 'music'; // Medium proxy
    return 'customs'; // Hard proxy
  }

  const finishGame = useCallback(() => {
     if (!settings) return;
     const results: GameResults = {
        scores: players,
        category: settings.category,
        mode: settings.mode,
    };
    sessionStorage.setItem('quizResults', JSON.stringify(results));
    router.push('/results');
  }, [players, settings, router]);

  const handleNextQuestion = useCallback(async () => {
    setIsAnswered(false);
    setSelectedAnswer(null);

    if (settings?.mode === 'survival') {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        const newDifficulty = getDifficulty(nextIndex);
        const newQuestions = await getQuizQuestions(newDifficulty, 1);
        setQuestions(prev => [...prev, ...newQuestions]);
        return;
    }

    if (settings?.mode === 'group') {
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextPlayerIndex);

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
    } else if (parsedSettings.mode === 'survival') {
      setPlayers([{ id: 'survival-player', name: 'Valiente', score: 0 }]);
      setLives(parsedSettings.lives || 3);
    }
    else {
      setPlayers([{ id: 'solo-player', name: 'Tú', score: 0 }]);
    }

    if(parsedSettings.timeLimit) {
      setTimeLeft(parsedSettings.timeLimit);
    }

    const fetchInitialQuestions = async () => {
      setLoading(true);
      const initialDifficulty = parsedSettings.mode === 'survival' ? getDifficulty(0) : parsedSettings.category;
      const numToFetch = parsedSettings.mode === 'survival' ? 1 : parsedSettings.numQuestions;
      const fetchedQuestions = await getQuizQuestions(initialDifficulty, numToFetch);
      setQuestions(fetchedQuestions);
      setLoading(false);
    };

    fetchInitialQuestions();
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

    const isCorrect = answer === currentQuestion.answer;
    
    if (isCorrect) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
        let scoreToAdd = 10;
        if(settings?.mode === 'survival') {
            const difficulty = getDifficulty(currentQuestionIndex);
            if (difficulty === 'music') scoreToAdd *= 1.5;
            if (difficulty === 'customs') scoreToAdd *= 2;
        }
        else if (settings?.mode === 'solo' && timeLeft) {
            scoreToAdd += Math.floor(timeLeft / (settings.timeLimit! / settings.numQuestions!) * 5); // Bonus time
        }
        setPlayers(prevPlayers => prevPlayers.map((p, index) => 
          index === currentPlayerIndex ? { ...p, score: p.score + scoreToAdd } : p
        ));
    } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        if (settings?.mode === 'survival') {
            const newLives = lives - 1;
            setLives(newLives);
            if(newLives <= 0) {
                setIsGameOver(true);
                return;
            }
        }
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };
  
  if (loading || !settings || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
        <div className="flex items-center space-x-2 text-primary">
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin"></div>
          <span className="text-xl font-semibold">Cargando pregunta...</span>
        </div>
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
    <>
    <div className={cn("container mx-auto p-4 min-h-screen flex flex-col items-center justify-center transition-all duration-500", shake && 'shake', confetti && 'confetti-pop')}>
       <Button variant="ghost" className="absolute top-4 left-4" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Salir del Juego
        </Link>
      </Button>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 items-start animate-fade-in-up">
        <div className="md:col-span-2 order-2 md:order-1">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Progress value={((currentQuestionIndex + 1) / settings.numQuestions) * 100} className="mb-4" />
              <CardDescription>Pregunta {currentQuestionIndex + 1}</CardDescription>
              <CardTitle className="font-headline text-3xl md:text-4xl !mt-2">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shuffledOptions.map((option, index) => {
                  const isCorrectAnswer = option === currentQuestion.answer;
                  const isSelected = option === selectedAnswer;
                  
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className={cn(
                        "h-auto py-4 text-base whitespace-normal justify-start text-left transition-all duration-300",
                        isAnswered && isCorrectAnswer && "bg-green-500/80 border-green-500 text-white confetti-pop",
                        isAnswered && isSelected && !isCorrectAnswer && "bg-red-500/80 border-red-500 text-white shake",
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
            ) : settings.mode === 'survival' ? (
                 <>
                    <Alert>
                        <LivesIndicator lives={lives} />
                        <AlertTitle className="font-bold ml-10">Vidas Restantes</AlertTitle>
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
    <AlertDialog open={isGameOver}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-3xl">¡Fin de la Parranda!</AlertDialogTitle>
          <AlertDialogDescription>
            ¡Te has quedado sin vidas! Pero no te preocupes, siempre puedes intentarlo de nuevo.
            Tu puntuación final fue de {players[0]?.score} puntos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={finishGame}>Ver Resultados</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
