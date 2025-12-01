"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { GameResults } from '@/lib/types';
import { Trophy, Star, Repeat, Award, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


const HIGH_SCORE_KEY = 'parrandeando-highscore';
const BEST_STREAK_KEY = 'parrandeando-beststreak';

const streakAchievements = [
  { name: 'El Maestro', description: 'Alcanzar una racha de 100. ¡El Vencedor del Cañonazo!', threshold: 100, icon: <Trophy className="w-8 h-8" /> },
  { name: 'El Inmortal', description: 'Alcanzar una racha de 50. ¡Cazador de Hallacas!', threshold: 50, icon: <Award className="w-8 h-8" /> },
  { name: 'Fogonazo', description: 'Alcanzar una racha de 25. ¡El Ciclón Decembrino!', threshold: 25, icon: <Star className="w-8 h-8" /> },
  { name: 'Parrandita', description: 'Alcanzar una racha de 10. ¡Aprendiz de Racha!', threshold: 10, icon: <Star className="w-8 h-8 opacity-70" /> },
];


export default function ResultsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [results, setResults] = useState<GameResults | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<typeof streakAchievements[0] | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
      const parsedResults: GameResults = JSON.parse(storedResults);
      setResults(parsedResults);
      
      const storedHighScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
      setHighScore(storedHighScore);
      
      const storedBestStreak = parseInt(localStorage.getItem(BEST_STREAK_KEY) || '0', 10);
      setBestStreak(storedBestStreak);

      if (parsedResults.mode === 'solo' || parsedResults.mode === 'survival') {
        const finalScore = parsedResults.scores[0].score;
        if (finalScore > storedHighScore) {
          localStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
          setIsNewHighScore(true);
          setHighScore(finalScore);
        }
      }
      
      if (parsedResults.mode === 'survival' && parsedResults.survivalStreak) {
        const finalStreak = parsedResults.survivalStreak;
        if (finalStreak > storedBestStreak) {
          localStorage.setItem(BEST_STREAK_KEY, String(finalStreak));
          setBestStreak(finalStreak);

          // Check for newly unlocked achievement
          const newlyUnlocked = streakAchievements.find(ach => finalStreak >= ach.threshold && storedBestStreak < ach.threshold);
          if (newlyUnlocked) {
            setNewlyUnlockedAchievement(newlyUnlocked);
          }
        }
      }

    } else {
        router.push('/');
    }
  }, [router]);

  const handlePlayAgain = () => {
    sessionStorage.removeItem('quizSettings');
    sessionStorage.removeItem('quizResults');
    router.push('/');
  };

  const handleShare = () => {
    let shareText = "";
    if (results) {
      if (results.mode === 'survival') {
        shareText = `¡Soy un Catedrático Parrandero! 🇻🇪 Logré una racha de ${results.survivalStreak} y una puntuación de ${results.scores[0].score} en el modo Supervivencia de ¡Parrandeando y Respondiendo! ¿Puedes superarme?`;
      } else if (results.mode === 'group') {
        const winner = results.scores.sort((a,b) => b.score - a.score)[0];
        shareText = `¡${winner.name} es el rey de la parranda! 👑 Ganó con ${winner.score} puntos en ¡Parrandeando y Respondiendo! ¡Juguemos otra vez!`;
      } else {
        shareText = `¡Reto cumplido! 🇻🇪 Hice ${results.scores[0].score} puntos en el modo Solitario de ¡Parrandeando y Respondiendo! ¿Te atreves a jugar?`;
      }
    }
    
    // Using navigator.clipboard to copy text to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
        toast({
            title: "¡Logro Copiado!",
            description: "¡Pega el mensaje en WhatsApp y presume tu título!",
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            title: "Error",
            description: "No se pudo copiar el texto.",
            variant: "destructive",
        });
    });
  };

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando resultados...
      </div>
    );
  }

  const sortedScores = results.scores.sort((a, b) => b.score - a.score);
  const winner = sortedScores[0];
  const categoryLabels = {
    'all': "Todas las Categorías",
    'Gastronomía': "Gastronomía",
    'Música y Parrandas': "Música y Parrandas",
    'Tradiciones y Costumbres': "Tradiciones y Costumbres",
    'Folclore Regional': "Folclore Regional",
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl text-center bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Trophy className="w-20 h-20 text-accent" />
          </div>
          <CardTitle className="font-headline text-5xl">
            {results.mode === 'group' ? `¡Felicidades, ${winner.name}!` : '¡Juego Terminado!'}
          </CardTitle>
          <CardDescription className="text-lg">
            {results.mode === 'group' ? `¡Son los reyes (o reinas) de la parranda en la categoría ${categoryLabels[results.category]}!` : `Resultados de tu partida de ${results.mode === 'survival' ? 'Supervivencia' : 'Solitario'}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.mode === 'group' ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Clasificación Final</h3>
              <ul className="space-y-2 text-left">
                {sortedScores.map((player, index) => (
                  <li
                    key={player.id}
                    className={cn("flex justify-between items-center p-3 rounded-lg bg-muted/80", index === 0 && "ring-2 ring-accent")}
                  >
                    <span className="text-lg font-semibold">
                      {index + 1}. {player.name}
                    </span>
                    <span className="text-lg font-bold text-primary">{player.score} pts</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
                <div className="p-6 rounded-lg bg-muted/80">
                    <p className="text-xl">Tu puntuación final</p>
                    <p className="text-6xl font-bold text-primary my-2">{winner.score}</p>
                    <p className="text-muted-foreground">puntos</p>
                </div>
                {isNewHighScore && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/20 text-accent-foreground font-semibold">
                        <Star className="text-accent" />
                        ¡Nuevo récord personal!
                    </div>
                )}
                <p className="text-lg">Tu mejor puntuación: <span className="font-bold text-primary">{highScore} pts</span></p>
            </div>
          )}

          {results.mode === 'survival' && (
             <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/80">
                    <p className="text-lg">Mejor racha de tu vida</p>
                    <p className="text-4xl font-bold text-primary my-1">{bestStreak}</p>
                    <p className="text-muted-foreground">respuestas correctas</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Insignias de Racha</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {streakAchievements.map(ach => (
                      <div key={ach.name} className={cn("flex flex-col items-center justify-start p-3 rounded-lg border-2 text-center", bestStreak >= ach.threshold ? 'border-accent bg-accent/10' : 'border-muted bg-muted/50 opacity-60')}>
                          <div className={cn("mb-2", bestStreak >= ach.threshold ? 'text-accent' : 'text-muted-foreground')}>
                            {ach.icon}
                          </div>
                          <p className="font-bold text-sm leading-tight">{ach.name}</p>
                           <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={handlePlayAgain} size="lg" variant="outline" className="w-full font-bold text-lg">
            <Repeat className="mr-2 h-4 w-4" /> Volver a Jugar
          </Button>
           <Button onClick={handleShare} size="lg" className="w-full font-bold text-lg">
            <Share2 className="mr-2 h-4 w-4" /> ¡Presume tu Título!
          </Button>
        </CardFooter>
      </Card>
    </div>
    <AlertDialog open={!!newlyUnlockedAchievement}>
        <AlertDialogContent>
            <AlertDialogHeader className="items-center">
                <div className="text-accent mb-4 scale-150">{newlyUnlockedAchievement?.icon}</div>
                <AlertDialogTitle className="font-headline text-3xl text-center">¡Insignia Desbloqueada!</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-lg">
                    ¡Felicidades! Has ganado la insignia:
                    <br />
                    <span className="font-bold text-accent text-xl">{newlyUnlockedAchievement?.name}</span>
                     <br />
                    <span className="text-sm">{newlyUnlockedAchievement?.description}</span>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setNewlyUnlockedAchievement(null)}>¡Chévere!</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
