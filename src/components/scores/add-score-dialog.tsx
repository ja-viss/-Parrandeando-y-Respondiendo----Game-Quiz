"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useScoreStore } from '@/lib/store/use-score-store';
import { useToast } from '@/hooks/use-toast';
import { addScore, overwriteScores, getScoresAsJsonString } from '@/app/scores/actions';
import { GameResults } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export function AddScoreDialog({ onScoreAdded }: { onScoreAdded: () => void }) {
  const { isModalOpen, closeModal } = useScoreStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'solo' | 'group' | 'survival'>('solo');
  const [survivalStreak, setSurvivalStreak] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [jsonContent, setJsonContent] = useState('');

  const resetForm = () => {
    setName('');
    setScore(0);
    setMode('solo');
    setSurvivalStreak(0);
    setDate(new Date().toISOString().split('T')[0]);
    setJsonContent('');
  }

  const handleClose = () => {
    resetForm();
    closeModal();
  }

  const handleAddSingleScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim() || score < 0) {
        toast({ title: "Datos inválidos", description: "Revisa el nombre y el puntaje.", variant: "destructive" });
        setLoading(false);
        return;
    }

    const newGameResult: Omit<GameResults, 'category'> & { date: string } = {
        mode,
        scores: [{ id: `manual-${Date.now()}`, name, score, powerUps: [] }],
        survivalStreak: mode === 'survival' ? survivalStreak : undefined,
        date: new Date(date).toISOString(),
    };
    
    const result = await addScore(newGameResult);

    if (result.success) {
        toast({ title: "¡Éxito!", description: result.message });
        onScoreAdded();
        handleClose();
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }

    setLoading(false);
  };
  
  const handleLoadJson = async () => {
    setLoading(true);
    if (!jsonContent.trim()) {
        toast({ title: "JSON vacío", description: "Pega el contenido del archivo JSON.", variant: "destructive" });
        setLoading(false);
        return;
    }

    const result = await overwriteScores(jsonContent);
     if (result.success) {
        toast({ title: "¡Puntajes Restaurados!", description: result.message });
        onScoreAdded();
        handleClose();
    } else {
        toast({ title: "Error al cargar JSON", description: result.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDownloadJson = async () => {
    setLoading(true);
    try {
        const scoresJsonString = await getScoresAsJsonString();
        const blob = new Blob([scoresJsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scores.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Descarga Iniciada", description: "Tu respaldo de scores.json se está descargando." });
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudo descargar el archivo: ${error.message}`, variant: "destructive" });
    }
    setLoading(false);
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className='font-headline text-2xl'>Panel de Administración</DialogTitle>
          <DialogDescription>
            Añade un puntaje, o carga/descarga un respaldo completo en formato JSON.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="add">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Añadir Puntaje</TabsTrigger>
            <TabsTrigger value="json">Cargar/Descargar JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="add">
             <form onSubmit={handleAddSingleScore} className="grid gap-4 py-4">
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Apodo
                </Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="score" className="text-right">
                  Puntaje
                </Label>
                <Input id="score" type="number" value={score} onChange={e => setScore(Number(e.target.value))} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mode" className="text-right">
                  Modo
                </Label>
                <Select value={mode} onValueChange={(value: any) => setMode(value)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona un modo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="solo">Solitario</SelectItem>
                        <SelectItem value="group">Grupal</SelectItem>
                        <SelectItem value="survival">Supervivencia</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              {mode === 'survival' && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="streak" className="text-right">
                    Racha
                    </Label>
                    <Input id="streak" type="number" value={survivalStreak} onChange={e => setSurvivalStreak(Number(e.target.value))} className="col-span-3" />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Fecha
                </Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="col-span-3" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Puntaje'}</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="json">
            <div className='py-4 space-y-4'>
                <div>
                    <Label htmlFor="json-content">Contenido del JSON de respaldo</Label>
                    <Textarea 
                        id="json-content" 
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
                        placeholder='Pega aquí el contenido de tu archivo scores.json de respaldo.'
                        className='min-h-[150px] font-mono text-xs mt-2'
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleDownloadJson} disabled={loading}>{loading ? "..." : "Descargar Puntajes"}</Button>
                    <Button onClick={handleLoadJson} disabled={loading}>{loading ? 'Cargando...' : 'Cargar Puntajes desde JSON'}</Button>
                </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
        
      </DialogContent>
    </Dialog>
  );
}
