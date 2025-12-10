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
import { addScore } from '@/app/scores/actions';
import { GameResults } from '@/lib/types';

export function AddScoreDialog({ onScoreAdded }: { onScoreAdded: () => void }) {
  const { isModalOpen, closeModal } = useScoreStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'solo' | 'group' | 'survival'>('solo');
  const [survivalStreak, setSurvivalStreak] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);


  const handleSubmit = async (e: React.FormEvent) => {
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
        closeModal();
        // Reset form
        setName('');
        setScore(0);
        setMode('solo');
        setSurvivalStreak(0);
        setDate(new Date().toISOString().split('T')[0]);
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }

    setLoading(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className='font-headline text-2xl'>Añadir Puntaje Manualmente</DialogTitle>
          <DialogDescription>
            Introduce los detalles de la partida para añadirla al salón de la fama.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
            <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Puntaje'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
