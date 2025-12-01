"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GameCategory, GameSettings, Player } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Music, Utensils, Users, X, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories: { value: GameCategory; label: string; icon: React.ElementType }[] = [
  { value: "gastronomy", label: "Gastronomía", icon: Utensils },
  { value: "music", label: "Música", icon: Music },
  { value: "customs", label: "Costumbres", icon: Users },
];

export default function GroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [players, setPlayers] = useState<string[]>([""]);
  const [category, setCategory] = useState<GameCategory>("gastronomy");
  const [numQuestions, setNumQuestions] = useState<number>(5);

  const handlePlayerChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, ""]);
    } else {
      toast({
        title: "Límite de jugadores",
        description: "Solo se permiten hasta 4 jugadores.",
        variant: "destructive",
      });
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const playerNames = players.map(p => p.trim()).filter(p => p !== "");
    if (playerNames.length < 2) {
      toast({
        title: "Jugadores insuficientes",
        description: "Se necesitan al menos 2 jugadores para competir.",
        variant: "destructive",
      });
      return;
    }

    const gamePlayers: Player[] = playerNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name,
      score: 0,
    }));

    const settings: GameSettings = {
      mode: "group",
      category,
      numQuestions,
      players: gamePlayers,
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
          <CardTitle className="font-headline text-4xl text-center">Competencia Grupal</CardTitle>
          <CardDescription className="text-center">Añadan sus nombres, elijan categoría y ¡que comience la parranda!</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Jugadores</Label>
              {players.map((player, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={`Nombre del Jugador ${index + 1}`}
                    value={player}
                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                    required
                  />
                  {players.length > 1 && (
                    <Button variant="ghost" size="icon" type="button" onClick={() => removePlayer(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {players.length < 4 && (
                <Button variant="outline" type="button" onClick={addPlayer} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Jugador
                </Button>
              )}
            </div>
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
              ¡A Parrandear!
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
