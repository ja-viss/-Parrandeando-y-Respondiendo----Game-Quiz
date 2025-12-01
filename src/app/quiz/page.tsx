
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getQuizQuestions, polishQuestionDialect } from '@/app/actions';
import type { GameSettings, QuizQuestion, Player, GameResults, Difficulty, PowerUp, GroupPowerUp, SurvivalPowerUp } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, Users, User, ArrowLeft, Heart, Zap, Shield, Bomb, FastForward, Turtle, Gift, Star, Cross, HelpCircle } from 'lucide-react';
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

const groupPowerUpConfig: Record<GroupPowerUp, { name: string; icon: React.ElementType; description: string; malus: boolean }> = {
  'hallaca-de-oro': { name: "Hallaca de Oro", icon: Shield, description: "¡Duplica tus puntos en la siguiente pregunta!", malus: false },
  'palo-de-ciego': { name: "Palo de Ciego", icon: Bomb, description: "¡Oscurece las opciones de un oponente por 3s!", malus: true },
  'la-ladilla': { name: "La Ladilla", icon: Clock, description: "¡Reduce a la mitad el tiempo de un oponente!", malus: true },
  'el-estruendo': { name: "El Estruendo", icon: Zap, description: "¡Lanza una distracción visual a un oponente!", malus: true }
}

const survivalPowerUpConfig: Record<SurvivalPowerUp, { name: string; icon: React.ElementType; description: string; }> = {
    'chiguire-lento': { name: "El Chigüire Lento", icon: Turtle, description: "¡Na' guará, se te acabó la ladilla! Este chigüire te alarga el tiempo pa' pensar." },
    'soplon': { name: "El Soplón", icon: Gift, description: "Este te echa el cuento completo. ¡Te sopla la respuesta correcta de una vez!" },
    'media-hallaca': { name: "La Media Hallaca", icon: HelpCircle, description: "¡Ayuda divina! Te quita dos respuestas incorrectas pa' que la vaina no sea tan pelúa." },
    'milagro-santo': { name: "El Milagro del Santo", icon: Cross, description: "¡Qué bendición! Si la regaste, este te regala una vida extra." }
};


const PowerUpSelector = ({ players, onSelect, ownId, powerUp }: { players: Player[], onSelect: (targetId: string) => void, ownId: string, powerUp: GroupPowerUp }) => (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¡Ataque Parrandero!</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a usar "{groupPowerUpConfig[powerUp].name}". Elige a tu víctima:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col space-y-2">
            {players.filter(p => p.id !== ownId).map(player => (
                <Button key={player.id} onClick={() => onSelect(player.id)} variant="outline">
                    {player.name}
                </Button>
            ))}
        </div>
      </AlertDialogContent>
    </AlertDialog>
)


const Leaderboard = ({ players, currentPlayerId, onUsePowerUp }: { players: Player[], currentPlayerId: string, onUsePowerUp: (powerUp: GroupPowerUp) => void }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline text-2xl"><Trophy className="text-accent" />Puntuación</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {players.sort((a, b) => b.score - a.score).map((player, index) => (
          <li key={player.id} className={cn("flex flex-col p-2 rounded-md bg-muted/50", index === 0 && "ring-2 ring-accent")}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                <span className={`font-bold font-body ${index === 0 ? 'text-accent' : ''}`}>{index + 1}. {player.name}</span>
                </div>
                <span className="font-bold text-primary font-body">{player.score} pts</span>
            </div>
             {player.powerUps.length > 0 && player.id === currentPlayerId && (
                <div className="mt-2 flex gap-2">
                    {player.powerUps.map((pu, i) => {
                        const Icon = groupPowerUpConfig[pu].icon;
                        return(
                            <Button key={i} size="sm" onClick={() => onUsePowerUp(pu)} className='bg-accent text-accent-foreground hover:bg-accent/80'>
                                <Icon className="h-4 w-4 mr-2" /> {groupPowerUpConfig[pu].name}
                            </Button>
                        )
                    })}
                </div>
            )}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const LivesIndicator = ({ lives }: { lives: number }) => (
  <div className="flex items-center gap-2">
    <AlertTitle className="font-bold font-body">Vidas:</AlertTitle>
    <div className="flex items-center gap-1">
      {[...Array(lives)].map((_, i) => (
        <div key={i} className="animate-fade-in-down">
          <Heart className="h-6 w-6 text-red-500 fill-current" />
        </div>
      ))}
      {[...Array(Math.max(0, 3 - lives))].map((_, i) => (
        <Heart key={`empty-${i}`} className="h-6 w-6 text-red-500 opacity-25" />
      ))}
    </div>
  </div>
);


const getDifficulty = (streak: number): { name: Difficulty; multiplier: number; label: string } => {
    if (streak < 6) return { name: 'Juguete de Niño', multiplier: 1.0, label: "Juguete de Niño" };
    if (streak < 16) return { name: "Palo 'e Ron", multiplier: 1.2, label: "Palo 'e Ron" };
    return { name: "¡El Cañonazo!", multiplier: 1.5, label: "¡El Cañonazo!" };
};

const paloERonPhrases = [
    "¡Na' Guará! Ahora la vaina se puso seria. ¡A ver si te la sabes!",
    "¡Fino! Ya dejaste de ser un zamuro cuidando carne. ¡Demuestra que eres un duro!",
    "¡Chévere! Se acabó el bostezo. Ahora es que empieza la parranda de verdad."
];
const elCanonazoPhrases = [
    "¡Qué molleja, chamo! Llegaste al nivel de los que batean de jonrón. ¡No te me achicopales ahora!",
    "¡Arrecho! Eres más criollo que una arepa. ¡Ahora es que hay candela!",
    "¡Burda de bueno! Estás en la candela. ¡A ver si eres de los que masca el agua!"
];


const SurvivalPowerUpBar = ({ powerUps, onUse }: { powerUps: Partial<Record<SurvivalPowerUp, number>>, onUse: (powerUp: SurvivalPowerUp) => void}) => {
    const availablePowerUps = Object.entries(powerUps).filter(([, count]) => count > 0);
    if (availablePowerUps.length === 0) return null;

    return (
        <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-card/80 backdrop-blur-sm">
            <CardContent className="p-2">
                <div className="flex justify-around items-center">
                    {(Object.keys(survivalPowerUpConfig) as SurvivalPowerUp[]).map(powerUpKey => {
                        const config = survivalPowerUpConfig[powerUpKey];
                        const count = powerUps[powerUpKey] || 0;
                        const Icon = config.icon;
                        return (
                            <Button 
                                key={powerUpKey} 
                                variant="ghost" 
                                size="icon"
                                disabled={count === 0}
                                onClick={() => onUse(powerUpKey)}
                                className="relative flex flex-col h-16 w-16"
                            >
                                <Icon className={cn("h-8 w-8", count > 0 ? "text-accent" : "text-muted-foreground")} />
                                <span className="text-xs font-body">{config.name}</span>
                                {count > 0 && <div className="absolute top-0 right-0 h-4 w-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">{count}</div>}
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
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
  const [timeLeft, setTimeLeft] = useState<number>(70);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  
  const [isRapidFire, setIsRapidFire] = useState(false);
  const [activeMalus, setActiveMalus] = useState<Record<string, GroupPowerUp | null>>({});
  const [powerUpToUse, setPowerUpToUse] = useState<GroupPowerUp | null>(null);
  const [usingHallacaDeOro, setUsingHallacaDeOro] = useState<string | null>(null);
  
  const [slowTime, setSlowTime] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [usedMilagro, setUsedMilagro] = useState(false);


  const difficultyInfo = useMemo(() => getDifficulty(currentStreak), [currentStreak]);

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
    if (!settings) return;

    setIsAnswered(false);
    setSelectedAnswer(null);
    setUsingHallacaDeOro(null);
    setActiveMalus({}); // Clear all malus effects

    setSlowTime(false);
    setRevealedAnswer(null);
    setHiddenOptions([]);
    setUsedMilagro(false);
    
    if (Math.random() < 0.15 && settings?.mode === 'group') { // 15% chance for rapid fire
      setIsRapidFire(true);
      toast({ title: "¡RONDA RÁFAGA!", description: "¡3 segundos para responder! ¡El más rápido gana más!", duration: 3000 });
      setTimeLeft(3);
    } else {
      setIsRapidFire(false);
      setTimeLeft(70);
    }

    if (settings.mode === 'survival') {
        const nextIndex = currentQuestionIndex + 1;
        setLoading(true);
        try {
            const newQuestions = await getQuizQuestions(difficultyInfo.name, 1, settings.category);
            const polishedQuestion = await polishQuestionDialect(newQuestions[0]);
            setQuestions(prev => [...prev, polishedQuestion]);
            setCurrentQuestionIndex(nextIndex);
        } catch (error) {
            toast({ title: "Error de red", description: "No se pudo cargar la siguiente pregunta. Inténtalo de nuevo.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
        return;
    }
    
    const nextPlayerIndex = settings.mode === 'group' ? (currentPlayerIndex + 1) % players.length : 0;
    const isNewRound = nextPlayerIndex === 0;

    if (settings.mode === 'group') {
      setCurrentPlayerIndex(nextPlayerIndex);
    }

    if (isNewRound) {
       if (currentQuestionIndex < settings.numQuestions - 1) {
        setLoading(true);
        const nextQuestionIndex = currentQuestionIndex + 1;
        const polishedQuestion = await polishQuestionDialect(questions[nextQuestionIndex]);
        setQuestions(prev => {
          const newQs = [...prev];
          newQs[nextQuestionIndex] = polishedQuestion;
          return newQs;
        });
        setCurrentQuestionIndex(nextQuestionIndex);
        setLoading(false);
      } else {
        finishGame();
      }
    }
  }, [settings, currentPlayerIndex, players.length, currentQuestionIndex, finishGame, toast, difficultyInfo.name, questions]);
  
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const handleAnswer = (answer: string) => {
    if (isAnswered || !currentQuestion) return;
    setIsAnswered(true);
    setSelectedAnswer(answer);

    const isCorrect = answer === currentQuestion.respuestaCorrecta;
    
    if (isCorrect) {
        let scoreToAdd = isRapidFire ? 20 : 10;
        
        if (settings?.mode === 'solo' && settings.difficulty) {
            if (settings.difficulty === "Palo 'e Ron") scoreToAdd *= 1.2;
            if (settings.difficulty === "¡El Cañonazo!") scoreToAdd *= 1.5;
        }

        if (settings?.mode === 'survival') {
            const newStreak = currentStreak + 1;
            const prevDifficulty = difficultyInfo.label;
            const newDifficultyInfo = getDifficulty(newStreak);
            
            if (newDifficultyInfo.label !== prevDifficulty) {
              setLevelUp(true);
              let phrase = "";
              if (newDifficultyInfo.label === "Palo 'e Ron") {
                  phrase = paloERonPhrases[Math.floor(Math.random() * paloERonPhrases.length)];
              } else if (newDifficultyInfo.label === "¡El Cañonazo!") {
                  phrase = elCanonazoPhrases[Math.floor(Math.random() * elCanonazoPhrases.length)];
              }
              toast({ title: `¡Subiste a ${newDifficultyInfo.label}!`, description: phrase });
              setTimeout(() => setLevelUp(false), 1000);
            }
            if (newStreak % 5 === 0 && newStreak > 0) {
                 const allPowerUps: SurvivalPowerUp[] = ['chiguire-lento', 'soplon', 'media-hallaca', 'milagro-santo'];
                 const randomPowerUp = allPowerUps[Math.floor(Math.random() * allPowerUps.length)];
                 setPlayers(prev => prev.map(p => ({
                     ...p,
                     survivalPowerUps: {
                         ...p.survivalPowerUps,
                         [randomPowerUp]: (p.survivalPowerUps?.[randomPowerUp] || 0) + 1
                     }
                 })));
                 toast({ title: "¡Ganaste un Comodín!", description: `¡Recibiste: ${survivalPowerUpConfig[randomPowerUp].name}!` });
            }

            setCurrentStreak(newStreak);
            if (newStreak > highestStreak) {
                setHighestStreak(newStreak);
            }
            scoreToAdd *= newDifficultyInfo.multiplier;
        } else {
            scoreToAdd += Math.floor(timeLeft / 70 * 5); // Bonus time
        }

        if (usingHallacaDeOro === players[currentPlayerIndex].id) {
            scoreToAdd *= 2;
        }
        
        setPlayers(prevPlayers => prevPlayers.map((p, index) => 
          index === currentPlayerIndex ? { ...p, score: p.score + Math.round(scoreToAdd) } : p
        ));

        // Award power-up
        if (settings?.mode === 'group' && (settings.difficulty === "Palo 'e Ron" || settings.difficulty === "¡El Cañonazo!")) {
            if (Math.random() < 0.3) { // 30% chance
                const allPowerUps: GroupPowerUp[] = ['hallaca-de-oro', 'palo-de-ciego', 'la-ladilla', 'el-estruendo'];
                const randomPowerUp = allPowerUps[Math.floor(Math.random() * allPowerUps.length)];
                setPlayers(prev => prev.map((p, index) => 
                    index === currentPlayerIndex ? { ...p, powerUps: [...p.powerUps, randomPowerUp] } : p
                ));
                toast({ title: "¡Ganaste un Power-Up!", description: `¡Recibiste: ${groupPowerUpConfig[randomPowerUp].name}!` });
            }
        }

    } else {
        setShake(players[currentPlayerIndex].id);
        setTimeout(() => setShake(null), 500);
        
        if (settings?.mode === 'survival') {
            if (usedMilagro) {
                setUsedMilagro(false); // consume it
                toast({ title: "¡Salvado por el Santo!", description: "Has conservado tu vida.", duration: 2000 });
                // Don't lose a life, but reset streak
                setCurrentStreak(0);
            } else {
                setCurrentStreak(0); // Reset streak
                const newLives = lives - 1;
                setLives(newLives);
                if(newLives <= 0) {
                    setIsGameOver(true);
                    return;
                }
            }
        }
    }

    setTimeout(() => {
       handleNextQuestion();
    }, 1500);
  };
  
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
      setPlayers(parsedSettings.players.map(p => ({...p, survivalPowerUps: {}})));
    } else if (parsedSettings.mode === 'survival') {
      setPlayers([{ id: 'survival-player', name: 'Valiente', score: 0, powerUps: [], survivalPowerUps: { 'chiguire-lento': 1, 'soplon': 1, 'media-hallaca': 1, 'milagro-santo': 1 } }]);
      setLives(parsedSettings.lives || 3);
    }
    else {
      setPlayers([{ id: 'solo-player', name: 'Tú', score: 0, powerUps: [], survivalPowerUps: {} }]);
    }

    
    setTimeLeft(70);
    

    const fetchInitialQuestions = async () => {
      setLoading(true);
      const initialDifficulty = parsedSettings.mode === 'survival' ? getDifficulty(0).name : parsedSettings.difficulty || 'Juguete de Niño';
      const numToFetch = parsedSettings.mode === 'survival' ? 1 : parsedSettings.numQuestions;
      
      try {
        const fetchedQuestions = await getQuizQuestions(initialDifficulty, numToFetch, parsedSettings.category);
        const polishedQuestions = await Promise.all(fetchedQuestions.map(q => polishQuestionDialect(q)));
        setQuestions(polishedQuestions);
      } catch(error) {
        console.error("Failed to fetch/polish questions:", error);
        toast({ title: "Error", description: "No se pudieron cargar las preguntas.", variant: "destructive"});
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialQuestions();
  }, [router, toast]);

   useEffect(() => {
    let timer: NodeJS.Timeout;
    const playerMalus = activeMalus[players[currentPlayerIndex]?.id];
    let interval = 1000;

    if (playerMalus === 'la-ladilla' || slowTime) {
        interval = 2000; // Time is halved, so interval is doubled
    }
    
    if (timeLeft > 0 && !isAnswered) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, interval);
    } else if (timeLeft === 0 && !isAnswered) {
        handleAnswer(""); // Time's up, count as wrong
    }
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, activeMalus, players, currentPlayerIndex, slowTime, handleAnswer]);

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion?.opciones) return [];
    
    let options = [...currentQuestion.opciones];
    if (hiddenOptions.length > 0) {
        options = options.filter(opt => !hiddenOptions.includes(opt));
    }
    return options.sort(() => Math.random() - 0.5);
  }, [currentQuestion, hiddenOptions]);

   const handleUseGroupPowerUp = (powerUp: GroupPowerUp) => {
    if (groupPowerUpConfig[powerUp].malus) {
        setPowerUpToUse(powerUp);
    } else if (powerUp === 'hallaca-de-oro') {
        setUsingHallacaDeOro(players[currentPlayerIndex].id);
        setPlayers(prev => prev.map(p => p.id === players[currentPlayerIndex].id ? { ...p, powerUps: p.powerUps.filter(pu => pu !== 'hallaca-de-oro') } : p));
        toast({ title: "¡Hallaca de Oro Activada!", description: "¡Tu siguiente respuesta correcta vale el doble!" });
    }
  }
  
    const handleUseSurvivalPowerUp = (powerUp: SurvivalPowerUp) => {
        const currentPlayer = players[0];
        if (!currentPlayer || (currentPlayer.survivalPowerUps?.[powerUp] || 0) <= 0) {
            return;
        }

        // Consume power-up
        setPlayers(prev => prev.map(p => ({
            ...p,
            survivalPowerUps: {
                ...p.survivalPowerUps,
                [powerUp]: (p.survivalPowerUps?.[powerUp] || 1) - 1,
            }
        })));
        
        toast({ title: survivalPowerUpConfig[powerUp].name, description: survivalPowerUpConfig[powerUp].description });

        switch(powerUp) {
            case 'chiguire-lento':
                setSlowTime(true);
                break;
            case 'soplon':
                setRevealedAnswer(currentQuestion.respuestaCorrecta);
                break;
            case 'media-hallaca':
                const wrongOptions = currentQuestion.opciones.filter(opt => opt !== currentQuestion.respuestaCorrecta);
                const optionsToHide = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 2);
                setHiddenOptions(optionsToHide);
                break;
            case 'milagro-santo':
                setUsedMilagro(true);
                break;
        }
    };


  const applyMalus = (targetId: string) => {
    if (!powerUpToUse) return;

    setActiveMalus(prev => ({ ...prev, [targetId]: powerUpToUse }));

    setPlayers(prev => prev.map(p => p.id === players[currentPlayerIndex].id ? { ...p, powerUps: p.powerUps.filter(pu => pu !== powerUpToUse) } : p));
    
    const malusName = groupPowerUpConfig[powerUpToUse].name;
    const targetName = players.find(p => p.id === targetId)?.name;
    toast({ title: `¡Ataque a ${targetName}!`, description: `Has usado ${malusName}.`, variant: "destructive" });

    // Handle 'el-estruendo' visual shake
    if (powerUpToUse === 'el-estruendo') {
        setShake(targetId);
        setTimeout(() => setShake(null), 1000);
    }

    if (powerUpToUse === 'palo-de-ciego') {
        setTimeout(() => setActiveMalus(prev => ({ ...prev, [targetId]: null })), 3000);
    }
     if (powerUpToUse === 'la-ladilla') {
        setTimeout(() => setActiveMalus(prev => ({...prev, [targetId]: null})), 5000);
    }

    setPowerUpToUse(null);
  }


  if (loading || !settings) {
    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full md:col-span-2">
           <Card className="bg-card/80 backdrop-blur-sm w-full">
            <CardHeader>
              <Skeleton className="h-4 w-1/4 mb-4" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];
  const playerMalus = activeMalus[currentPlayer?.id];

  return (
    <>
    {powerUpToUse && (
        <PowerUpSelector players={players} onSelect={applyMalus} ownId={currentPlayer.id} powerUp={powerUpToUse} />
    )}
    <div className={cn("container mx-auto p-4 min-h-screen flex flex-col items-center justify-center transition-all duration-500", shake === currentPlayer.id && 'shake', isRapidFire && 'ring-4 ring-red-500 ring-inset')}>
       <Button variant="ghost" className="absolute top-4 left-4 z-30" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Salir
        </Link>
      </Button>
      {playerMalus === 'el-estruendo' && (
          <div 
              className='absolute inset-0 z-50 pointer-events-none bg-white animate-fade-in-down'
          />
      )}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fade-in-up">
        
        {/* Main Content */}
        <div className="md:col-span-2 order-2 md:order-1 w-full">
            <div
              className={cn(playerMalus === 'palo-de-ciego' && "blur-sm transition-all duration-300", "animate-fade-in-down")}
            >
              {!currentQuestion ? (
                  <Card className="bg-card/80 backdrop-blur-sm w-full">
                    <CardHeader>
                        <Skeleton className="h-4 w-1/4 mb-4" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/2 mt-1" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                      </div>
                    </CardContent>
                  </Card>
              ) : (
                <Card className="bg-card/80 backdrop-blur-sm w-full">
                  <CardHeader>
                    {settings.mode !== 'survival' && <Progress value={((currentQuestionIndex + 1) / settings.numQuestions) * 100} className="mb-4" />}
                     <div className="flex justify-between items-center text-sm text-muted-foreground font-body">
                          <span>
                              {settings.mode === 'survival' 
                                  ? `Racha actual: ${currentStreak}` 
                                  : `Pregunta ${currentQuestionIndex + 1} de ${settings.numQuestions}`}
                          </span>
                          {currentQuestion.categoria !== "Error" && <span className='font-bold'>Categoría: {currentQuestion.categoria}</span>}
                      </div>
                    <CardTitle className="font-body text-2xl md:text-3xl lg:text-4xl !mt-2">{currentQuestion.pregunta}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {shuffledOptions.map((option, index) => {
                        const isCorrectAnswer = option === currentQuestion.respuestaCorrecta;
                        const isSelected = option === selectedAnswer;
                        const isRevealed = option === revealedAnswer;
                        
                        return (
                          <div
                            key={index}
                             className="transition-transform transform hover:scale-105"
                          >
                            <Button
                              variant="outline"
                              size="lg"
                              className={cn(
                                "h-auto py-3 text-base whitespace-normal justify-start text-left w-full font-body",
                                "transition-all duration-300 transform",
                                isAnswered && isCorrectAnswer && "bg-green-500/80 border-green-700 ring-2 ring-white text-white font-bold",
                                isAnswered && isSelected && !isCorrectAnswer && "bg-red-500/80 border-red-700 ring-2 ring-white text-white font-bold",
                                isAnswered && !isSelected && !isCorrectAnswer && "opacity-50",
                                !isAnswered && isRevealed && "bg-yellow-500/80 border-yellow-700 ring-2 ring-white text-white font-bold"
                              )}
                              onClick={() => handleAnswer(option)}
                              disabled={isAnswered}
                            >
                              {option}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
        </div>

        {/* Sidebar */}
        <div className="w-full space-y-4 order-1 md:order-2">
           <div 
              className="sticky top-4 z-20"
            >
            <Alert className={cn("bg-background/80 backdrop-blur-sm", slowTime && "bg-green-500/20", isRapidFire && "bg-red-500/20", timeLeft <= 5 && "animate-pulse")}>
                <Clock className="h-4 w-4" />
                <AlertTitle className="font-bold font-body">Tiempo:</AlertTitle>
                <AlertDescription className="text-3xl text-primary font-mono">{timeLeft}s</AlertDescription>
            </Alert>
          </div>

            {settings.mode === 'group' ? (
                <>
                    <Alert>
                        <Users className="h-4 w-4" />
                        <AlertTitle className="font-bold font-body">Turno de:</AlertTitle>
                        <AlertDescription className="text-xl text-primary font-body">{currentPlayer.name}</AlertDescription>
                    </Alert>
                    <Leaderboard players={players} currentPlayerId={currentPlayer.id} onUsePowerUp={handleUseGroupPowerUp}/>
                </>
            ) : settings.mode === 'survival' ? (
                 <>
                    <Alert>
                        <Heart className="h-4 w-4" />
                        <LivesIndicator lives={lives} />
                    </Alert>
                     <Alert className={cn("relative overflow-hidden transition-all duration-300", levelUp && "ring-2 ring-accent confetti-pop")}>
                        <Zap className="h-4 w-4" />
                        <AlertTitle className="font-bold font-body">Nivel de Dificultad</AlertTitle>
                        <AlertDescription className="text-xl text-primary font-body">{difficultyInfo.label}</AlertDescription>
                    </Alert>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline text-2xl"><User className="text-accent" />Puntuación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-5xl font-bold text-primary font-body">{players[0].score} <span className="text-xl font-normal text-foreground/80">pts</span></p>
                        </CardContent>
                    </Card>
                </>
            ) : ( // solo mode
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline text-2xl"><User className="text-accent" />Puntuación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-5xl font-bold text-primary font-body">{players[0].score} <span className="text-xl font-normal text-foreground/80">pts</span></p>
                        </CardContent>
                    </Card>
                </>
            )}
             {isRapidFire && (
                <Alert variant="destructive" className="flex items-center gap-2">
                    <FastForward className="h-6 w-6 animate-pulse" />
                    <div>
                        <AlertTitle className="font-bold font-body">¡FUEGO RÁPIDO!</AlertTitle>
                        <AlertDescription className="font-body">¡Responde lo más rápido que puedas!</AlertDescription>
                    </div>
                </Alert>
            )}
        </div>
      </div>
       {settings.mode === 'survival' && players[0] && (
          <SurvivalPowerUpBar powerUps={players[0].survivalPowerUps || {}} onUse={handleUseSurvivalPowerUp} />
      )}
    </div>
    <AlertDialog open={isGameOver}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-3xl">¡Fin de la Parranda!</AlertDialogTitle>
          <AlertDialogDescription className="font-body">
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
