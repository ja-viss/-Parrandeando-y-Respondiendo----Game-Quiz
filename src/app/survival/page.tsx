"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GameSettings } from "@/lib/types";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

export default function SurvivalPage() {
  const router = useRouter();

  const handleStartSurvival = () => {
    const settings: GameSettings = {
      mode: "survival",
      category: "customs", // Or any default, it will be dynamic
      numQuestions: 99, // A high number for endless play
      lives: 3
    };
    sessionStorage.setItem("quizSettings", JSON.stringify(settings));
    router.push("/quiz");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in-down">
       <Button variant="ghost" className="absolute top-4 left-4" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Link>
      </Button>
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4 text-primary">
            <Zap size={64} />
          </div>
          <CardTitle className="font-headline text-4xl">Supervivencia Parrandera</CardTitle>
          <CardDescription className="text-lg">
            Responde preguntas sin parar. La dificultad aumenta, pero solo tienes 3 vidas. ¡A ver hasta dónde llegas!
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">
                Cada respuesta correcta aumenta tu puntuación. <br/>
                ¡No te equivoques o perderás una vida!
            </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartSurvival} size="lg" className="w-full font-bold text-lg">
            Empezar la Racha
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
