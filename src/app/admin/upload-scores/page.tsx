"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload } from 'lucide-react';
import { overwriteScores } from '@/app/scores/actions';

export default function UploadScoresPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [scoresJson, setScoresJson] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Basic auth check to prevent direct URL access without "logging in"
    const isAdmin = sessionStorage.getItem('admin-auth') === 'true';
    if (!isAdmin) {
      toast({
        title: "Acceso Denegado",
        description: "Debes ingresar la clave de administrador para acceder a esta página.",
        variant: "destructive"
      });
      router.replace('/');
    }
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoresJson.trim()) {
      toast({
        title: "Contenido vacío",
        description: "Por favor, pega el contenido del archivo JSON de los puntajes.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const result = await overwriteScores(scoresJson);

    if (result.success) {
      toast({
        title: "¡Éxito!",
        description: result.message,
        className: "bg-green-600 text-white",
      });
      setScoresJson("");
    } else {
       toast({
        title: "Error al Cargar",
        description: result.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Button variant="ghost" onClick={() => router.back()} className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
      </Button>
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-center text-primary">Cargar Respaldo de Puntajes</CardTitle>
          <CardDescription className="text-center font-body">Pega el contenido de tu archivo <code>scores.json</code> de respaldo para restaurar los puntajes.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scores-json" className="text-lg font-semibold font-body">Contenido JSON</Label>
              <Textarea
                id="scores-json"
                value={scoresJson}
                onChange={(e) => setScoresJson(e.target.value)}
                placeholder='[ { "scores": [...], "mode": "...", ... } ]'
                className="font-mono h-64"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Atención:</strong> Esta acción sobrescribirá todos los puntajes actuales en el servidor con el contenido que pegues aquí. Asegúrate de que el formato sea correcto.
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isLoading}>
              <Upload className="mr-2 h-5 w-5" />
              {isLoading ? 'Cargando...' : 'Cargar Puntajes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
