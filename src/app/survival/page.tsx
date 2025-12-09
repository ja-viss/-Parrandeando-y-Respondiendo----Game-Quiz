"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GameSettings, Player } from "@/lib/types";
import { ArrowLeft, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SurvivalPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("Valiente");

  const handleStartSurvival = () => {
    const player: Player = {
        id: 'survival-player',
        name: nickname.trim() === '' ? 'Valiente' : nickname,
        score: 0,
        powerUps: [],
    };
      
    const settings: GameSettings = {
      mode: "survival",
      category: "all",
      numQuestions: 99, // A high number for endless play
      lives: 3,
      players: [player]
    };
    sessionStorage.setItem("quizSettings", JSON.stringify(settings));
    router.push("/quiz");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in-down">
       <Button variant="ghost" onClick={() => router.back()} className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4 text-primary">
            <Zap size={64} />
          </div>
          <CardTitle className="font-headline text-3xl md:text-4xl text-primary">Supervivencia Parrandera</CardTitle>
          <CardDescription className="text-lg font-body">
            Responde preguntas sin parar. La dificultad aumenta, pero solo tienes 3 vidas. ¡A ver hasta dónde llegas!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="nickname" className="text-lg font-semibold font-body text-center block">Tu Apodo de Leyenda</Label>
                <Input 
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Escribe tu apodo aquí"
                className="font-body text-center text-lg"
                />
            </div>
            <p className="text-center text-muted-foreground font-body">
                Cada respuesta correcta aumenta tu puntuación. <br/>
                ¡No te equivoques o perderás una vida!
            </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartSurvival} size="lg" className="w-full font-bold text-lg bg-primary text-primary-foreground button-pulse">
            Empezar la Racha
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
