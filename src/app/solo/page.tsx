"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GameCategory, GameSettings } from "@/lib/types";
import { ArrowLeft, Music, Utensils, Users } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories: { value: GameCategory; label: string; icon: React.ElementType }[] = [
  { value: "gastronomy", label: "Gastronomía", icon: Utensils },
  { value: "music", label: "Música", icon: Music },
  { value: "customs", label: "Costumbres", icon: Users },
];

export default function SoloPage() {
  const router = useRouter();
  const [category, setCategory] = useState<GameCategory>("gastronomy");
  const [numQuestions, setNumQuestions] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings: GameSettings = {
      mode: "solo",
      category,
      numQuestions,
      timeLimit: numQuestions * 20, // 20 seconds per question
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
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">Modo Solitario</CardTitle>
          <CardDescription className="text-center">Elige una categoría y cuántas preguntas quieres responder.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Categoría</Label>
              <RadioGroup value={category} onValueChange={(value: GameCategory) => setCategory(value)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <Label
                    key={cat.value}
                    htmlFor={cat.value}
                    className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors ${category === cat.value ? 'border-primary bg-primary/10' : 'border-muted hover:border-accent'}`}
                  >
                    <RadioGroupItem value={cat.value} id={cat.value} className="sr-only" />
                    <cat.icon className="w-8 h-8 mb-2" />
                    <span className="font-bold">{cat.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
                <Label htmlFor="num-questions" className="text-lg font-semibold">Número de Preguntas</Label>
                <Select value={String(numQuestions)} onValueChange={(val) => setNumQuestions(Number(val))}>
                    <SelectTrigger id="num-questions" className="w-full">
                        <SelectValue placeholder="Selecciona el número de preguntas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 Preguntas</SelectItem>
                        <SelectItem value="10">10 Preguntas</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full font-bold text-lg">
              ¡A Jugar!
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
