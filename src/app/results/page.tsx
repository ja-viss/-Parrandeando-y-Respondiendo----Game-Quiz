"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { GameResults, Player } from '@/lib/types';
import { Trophy, Star, Repeat } from 'lucide-react';

const HIGH_SCORE_KEY = 'parrandeando-highscore';

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<GameResults | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
      const parsedResults: GameResults = JSON.parse(storedResults);
      setResults(parsedResults);

      if (parsedResults.mode === 'solo') {
        const soloScore = parsedResults.scores[0].score;
        const storedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
        const currentHighScore = storedHighScore ? parseInt(storedHighScore, 10) : 0;
        setHighScore(currentHighScore);

        if (soloScore > currentHighScore) {
          localStorage.setItem(HIGH_SCORE_KEY, String(soloScore));
          setIsNewHighScore(true);
          setHighScore(soloScore);
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
    gastronomy: "Gastronomía",
    music: "Música",
    customs: "Costumbres"
  };

  return (
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
            {results.mode === 'group' ? 'Eres el rey (o reina) de la parranda.' : `Resultados de tu partida de ${categoryLabels[results.category]}.`}
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
                    className="flex justify-between items-center p-3 rounded-lg bg-muted"
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
                <div className="p-6 rounded-lg bg-muted">
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
        </CardContent>
        <CardFooter>
          <Button onClick={handlePlayAgain} size="lg" className="w-full font-bold text-lg">
            <Repeat className="mr-2 h-4 w-4" /> Volver a Jugar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
