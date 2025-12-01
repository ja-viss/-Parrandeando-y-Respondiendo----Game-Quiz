"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getQuizQuestions } from '@/app/actions';
import type { GameSettings, QuizQuestion, Player, GameResults, Difficulty } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, Users, User, ArrowLeft, Heart, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
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
          <li key={player.id} className={cn("flex justify-between items-center p-2 rounded-md bg-muted/50", index === 0 && "ring-2 ring-accent")}>
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
    <div className="flex items-center gap-1">
      <AnimatePresence>
        {[...Array(3)].map((_, i) => (
           i < lives ? (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 90, transition: { duration: 0.3 } }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Heart className="h-6 w-6 text-red-500 fill-current" />
            </motion.div>
           ) : null
        ))}
       </AnimatePresence>
       {[...Array(3 - lives)].map((_, i) => (
            <Heart key={`empty-${i}`} className="h-6 w-6 text-red-500 opacity-25" />
        ))}
    </div>
);

const getDifficulty = (streak: number): { name: Difficulty; multiplier: number; label: string } => {
    if (streak < 6) return { name: 'Juguete de Niño', multiplier: 1.0, label: "Juguete de Niño" };
    if (streak < 16) return { name: "Palo 'e Ron", multiplier: 1.2, label: "Palo 'e Ron" };
    return { name: "¡El Cañonazo!", multiplier: 1.5, label: "¡El Cañonazo!" };
};

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
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [levelUp, setLevelUp] = useState(false);

  const difficultyInfo = useMemo(() => getDifficulty(currentStreak), [currentStreak]);

  useEffect(() => {
    const prevDifficulty = getDifficulty(currentStreak > 0 ? currentStreak - 1 : 0);
    const currentDifficultyInfo = getDifficulty(currentStreak);
    if (settings?.mode === 'survival' && prevDifficulty.name !== currentDifficultyInfo.name && currentStreak > 0) {
      setLevelUp(true);
      toast({
        title: "¡Subiste de Nivel!",
        description: `La dificultad ahora es: ${currentDifficultyInfo.label}`,
      });
      setTimeout(() => setLevelUp(false), 1500); // Animation duration
    }
  }, [currentStreak, settings?.mode, toast]);


  const finishGame = useCallback(() => {
     if (!settings) return;
     const results: GameResults = {
        scores: players,
        category: settings.category,
        mode: settings.mode,
        survivalStreak: highestStreak
    };
    sessionStorage.setItem('quizResults', JSON.stringify(results));
    router.push('/results');
  }, [players, settings, router, highestStreak]);

  const handleNextQuestion = useCallback(async () => {
    setIsAnswered(false);
    setSelectedAnswer(null);

    if (settings?.mode === 'survival') {
        setLoading(true);
        const nextIndex = currentQuestionIndex + 1;
        try {
            const newQuestions = await getQuizQuestions(difficultyInfo.name, 1, settings.category);
            setQuestions(prev => [...prev, ...newQuestions]);
            setCurrentQuestionIndex(nextIndex);
        } catch (error) {
            toast({ title: "Error de red", description: "No se pudo cargar la siguiente pregunta. Inténtalo de nuevo.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
        return;
    }
    
    const nextPlayerIndex = settings?.mode === 'group' ? (currentPlayerIndex + 1) % players.length : 0;
    const isNewRound = nextPlayerIndex === 0;

    if (settings?.mode === 'group') {
      setCurrentPlayerIndex(nextPlayerIndex);
    }

    if (isNewRound) {
       if (currentQuestionIndex < settings.numQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        finishGame();
      }
    }
  }, [settings, currentPlayerIndex, players.length, currentQuestionIndex, finishGame, toast, difficultyInfo.name]);

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
      const initialDifficulty = parsedSettings.mode === 'survival' ? getDifficulty(0).name : parsedSettings.difficulty || 'Juguete de Niño';
      const numToFetch = parsedSettings.mode === 'survival' ? 1 : parsedSettings.numQuestions;
      const fetchedQuestions = await getQuizQuestions(initialDifficulty, numToFetch, parsedSettings.category);
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
    } else if (timeLeft === 0 && !isAnswered) {
        setIsAnswered(true); // Mark as answered to stop timer and prevent interaction
        toast({
            title: "¡Se acabó el tiempo!",
            variant: "destructive"
        });
        setTimeout(() => handleNextQuestion(), 1500);
    }
    return () => clearInterval(timer);
  }, [timeLeft, settings, isAnswered, handleNextQuestion, toast]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const shuffledOptions = useMemo(() => currentQuestion?.opciones ? [...currentQuestion.opciones].sort(() => Math.random() - 0.5) : [], [currentQuestion]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answer);

    const isCorrect = answer === currentQuestion.respuestaCorrecta;
    
    if (isCorrect) {
        let scoreToAdd = 10;
        
        if (settings?.mode === 'solo' && settings.difficulty) {
            if (settings.difficulty === "Palo 'e Ron") scoreToAdd *= 1.2;
            if (settings.difficulty === "¡El Cañonazo!") scoreToAdd *= 1.5;
        }

        if (settings?.mode === 'survival') {
            const newStreak = currentStreak + 1;
            setCurrentStreak(newStreak);
            if (newStreak > highestStreak) {
                setHighestStreak(newStreak);
            }
            scoreToAdd *= difficultyInfo.multiplier;
        } else if (settings?.mode === 'solo' && timeLeft) {
            scoreToAdd += Math.floor(timeLeft / (settings.timeLimit! / settings.numQuestions!) * 5); // Bonus time
        }
        
        setPlayers(prevPlayers => prevPlayers.map((p, index) => 
          index === currentPlayerIndex ? { ...p, score: p.score + Math.round(scoreToAdd) } : p
        ));
    } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        
        if (settings?.mode === 'survival') {
            setCurrentStreak(0); // Reset streak
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
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-64 w-full max-w-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
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
    <div className={cn("container mx-auto p-4 min-h-screen flex flex-col items-center justify-center transition-all duration-500", shake && 'shake')}>
       <Button variant="ghost" className="absolute top-4 left-4" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Salir del Juego
        </Link>
      </Button>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 items-start animate-fade-in-up">
        <div className="md:col-span-2 order-2 md:order-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm w-full">
                <CardHeader>
                  {settings.mode !== 'survival' && <Progress value={((currentQuestionIndex + 1) / settings.numQuestions) * 100} className="mb-4" />}
                   <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                            {settings.mode === 'survival' 
                                ? `Racha actual: ${currentStreak}` 
                                : `Pregunta ${currentQuestionIndex + 1} de ${settings.numQuestions}`}
                        </span>
                        {currentQuestion.categoria !== "Error" && <span className='font-bold'>Categoría: {currentQuestion.categoria}</span>}
                    </div>
                  <CardTitle className="font-headline text-2xl md:text-3xl !mt-2">{currentQuestion.pregunta}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {shuffledOptions.map((option, index) => {
                      const isCorrectAnswer = option === currentQuestion.respuestaCorrecta;
                      const isSelected = option === selectedAnswer;
                      
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: !isAnswered ? 1.05 : 1, boxShadow: !isAnswered ? "0px 5px 15px hsla(var(--ring), 0.2)" : "" }}
                          whileTap={{ scale: !isAnswered ? 0.98 : 1 }}
                        >
                          <Button
                            variant="outline"
                            size="lg"
                            className={cn(
                              "h-auto py-4 text-base whitespace-normal justify-start text-left w-full",
                              "transition-all duration-300 transform",
                              isAnswered && isCorrectAnswer && "bg-green-500/80 border-green-700 ring-2 ring-white text-white font-bold",
                              isAnswered && isSelected && !isCorrectAnswer && "bg-red-500/80 border-red-700 ring-2 ring-white text-white font-bold",
                              isAnswered && !isSelected && !isCorrectAnswer && "opacity-50"
                            )}
                            onClick={() => handleAnswer(option)}
                            disabled={isAnswered}
                          >
                            {option}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
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
                        <AlertTitle className="font-bold ml-10 -mt-5">Vidas Restantes</AlertTitle>
                    </Alert>
                     <Alert className={cn("relative overflow-hidden transition-all duration-300", levelUp && "ring-2 ring-accent confetti-pop")}>
                        <Zap className="h-4 w-4" />
                        <AlertTitle className="font-bold">Nivel de Dificultad</AlertTitle>
                        <AlertDescription className="text-lg text-primary">{difficultyInfo.label}</AlertDescription>
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
                     <motion.div 
                        className="md:hidden sticky top-4 z-20"
                        animate={timeLeft && timeLeft <= 5 ? { scale: [1, 1.1, 1], transition: { duration: 0.5, repeat: Infinity } } : {}}
                      >
                      <Alert className="bg-background/80 backdrop-blur-sm">
                          <Clock className="h-4 w-4" />
                          <AlertTitle className="font-bold">Tiempo:</AlertTitle>
                          <AlertDescription className="text-2xl text-primary font-mono">{timeLeft}s</AlertDescription>
                      </Alert>
                    </motion.div>
                    <motion.div 
                      className="hidden md:block"
                      animate={timeLeft && timeLeft <= 5 ? { scale: [1, 1.05, 1], transition: { duration: 0.5, repeat: Infinity } } : {}}
                    >
                      <Alert>
                          <Clock className="h-4 w-4" />
                          <AlertTitle className="font-bold">Tiempo Restante</AlertTitle>
                          <AlertDescription className="text-2xl text-primary font-mono">{timeLeft}s</AlertDescription>
                      </Alert>
                    </motion.div>
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
            Tu puntuación final fue de <span className="font-bold text-primary">{players[0]?.score}</span> puntos y tu mejor racha fue de <span className="font-bold text-primary">{highestStreak}</span>.
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