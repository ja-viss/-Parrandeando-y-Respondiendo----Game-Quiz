"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GameCategory, GameSettings, Difficulty } from "@/lib/types";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { MaracaIcon } from "@/components/icons/maraca-icon";
import { CuatroIcon } from "@/components/icons/cuatro-icon";
import { HallacaIcon } from "@/components/icons/hallaca-icon";

const difficulties: {
  value: Difficulty;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "Juguete de Niño",
    label: "Juguete de Niño",
    description: "Preguntas sencillitas, como para ir calentando la parranda. ¡No te confíes, pues!",
    icon: MaracaIcon,
  },
  {
    value: "Palo 'e Ron",
    label: "Palo 'e Ron",
    description: "La cosa se pone seria. Tienes que saberte la letra y la receta completa. ¡Abre los ojos, chamo!",
    icon: CuatroIcon,
  },
  {
    value: "¡El Cañonazo!",
    label: "¡El Cañonazo!",
    description: "Solo para los expertos de la tradición. Preguntas históricas y con toda la jerga. ¡El reto final, pana!",
    icon: HallacaIcon,
  },
];

export default function SoloPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("Juguete de Niño");
  
  const handleStart = () => {
    const settings: GameSettings = {
      mode: "solo",
      category: "customs",
      numQuestions: 10,
      difficulty: difficulty,
      timeLimit: 200,
    };
    sessionStorage.setItem("quizSettings", JSON.stringify(settings));
    router.push("/quiz");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Button variant="ghost" className="absolute top-4 left-4" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Link>
      </Button>
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">Modo Solitario</CardTitle>
          <CardDescription className="text-center">Elige el nivel de picante para tus preguntas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficulties.map((d) => (
              <Button
                key={d.value}
                variant={difficulty === d.value ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center justify-start text-left transition-all duration-300 transform hover:scale-105 ${difficulty === d.value ? 'ring-2 ring-accent shadow-lg' : ''}`}
                onClick={() => setDifficulty(d.value)}
              >
                <d.icon className="w-12 h-12 mb-3 text-primary" />
                <p className="font-headline text-xl font-bold">{d.label}</p>
                <p className="font-body text-xs text-muted-foreground mt-1 whitespace-normal">{d.description}</p>
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStart} size="lg" className="w-full font-bold text-lg">
            ¡A Jugar!
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
