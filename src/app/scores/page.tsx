"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLeaderboards } from '@/app/scores/actions';
import { Player } from '@/lib/types';
import { ArrowLeft, Medal, Star, Trophy, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AddScoreDialog } from '@/components/scores/add-score-dialog';
import { useScoreStore } from '@/lib/store/use-score-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";


type LeaderboardPlayer = Player & { date: string; mode: string; };
type StreakRecord = { name: string; streak: number; date: string; };

type Leaderboards = {
    allTime: LeaderboardPlayer[];
    solo: LeaderboardPlayer[];
    group: LeaderboardPlayer[];
    survival: LeaderboardPlayer[];
    survivalStreaks: StreakRecord[];
}

const getModeLabel = (mode: string) => {
    switch (mode) {
        case 'solo': return 'Solitario';
        case 'group': return 'Grupal';
        case 'survival': return 'Supervivencia';
        default: return 'N/A';
    }
}

const getMedal = (index: number) => {
    if (index === 0) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-yellow-700" />;
    return <span className="font-bold w-5 text-center">{index + 1}</span>;
}


const ScoreTable = ({ title, players, isStreak = false }: { title: string, players: (LeaderboardPlayer[] | StreakRecord[]), isStreak?: boolean }) => (
    <Card>
        <CardHeader>
            <CardTitle className='font-headline text-xl'>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Pos.</TableHead>
                        <TableHead>Jugador</TableHead>
                        <TableHead className="text-right">{isStreak ? 'Racha' : 'Puntaje'}</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Fecha</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {players.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                Aún no hay puntajes registrados. ¡Sé el primero!
                            </TableCell>
                        </TableRow>
                    ) : (
                        players.map((player, index) => (
                            <TableRow key={`${title}-${index}`}>
                                <TableCell className="font-medium">{getMedal(index)}</TableCell>
                                <TableCell>{(player as LeaderboardPlayer).name}</TableCell>
                                <TableCell className="text-right font-bold text-primary">
                                    {isStreak ? (player as StreakRecord).streak : (player as LeaderboardPlayer).score}
                                </TableCell>
                                <TableCell className="text-right hidden sm:table-cell">{format(new Date(player.date), "d MMM yyyy", { locale: es })}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

export default function ScoresPage() {
    const [leaderboards, setLeaderboards] = useState<Leaderboards | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { openModal, isAdmin, setAdmin } = useScoreStore();
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [password, setPassword] = useState("");
    const { toast } = useToast();

    const fetchLeaderboards = async () => {
        setLoading(true);
        try {
            const data = await getLeaderboards();
            setLeaderboards(data);
        } catch (err) {
            console.error("Failed to load leaderboards:", err);
            toast({ title: "Error", description: "No se pudieron cargar los puntajes.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAdminClick = () => {
        if (isAdmin) {
            openModal();
        } else {
            setShowAuthDialog(true);
        }
    };
    
    const handleAdminAccess = () => {
        if (password === "Jojoxto2420**") {
            setAdmin(true);
            setShowAuthDialog(false);
            openModal();
            setPassword("");
             toast({ title: "Acceso concedido", description: "Panel de administrador desbloqueado.", variant: "default" });
        } else {
            toast({ title: "Clave incorrecta", description: "La clave de acceso no es válida.", variant: "destructive" });
            setPassword("");
        }
    };


    return (
        <>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="relative flex justify-center items-center mb-6">
                     <Button variant="ghost" onClick={() => router.back()} className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>
                    <h1 
                        className="font-brand text-4xl md:text-6xl text-primary title-pulse cursor-pointer"
                        onClick={handleAdminClick}
                    >
                        Salón de la Fama
                    </h1>
                     {isAdmin && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-2 text-green-500">
                           <ShieldCheck className="h-5 w-5"/>
                           <span className='font-body text-sm font-bold'>Admin</span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center">Cargando puntajes...</div>
                ) : !leaderboards ? (
                    <div className="text-center text-destructive">No se pudieron cargar los puntajes.</div>
                ) : (
                    <div className="space-y-8">
                        <Card className="bg-primary text-primary-foreground border-accent">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 font-headline text-2xl"><Trophy className="text-accent"/> Salón de los Cuarto Bates</CardTitle>
                                        <CardDescription className="text-primary-foreground/80">El top 10 de todos los tiempos. La crema y nata de la parranda.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                             <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className='border-primary-foreground/50'>
                                            <TableHead className="w-[50px] text-primary-foreground">Pos.</TableHead>
                                            <TableHead className='text-primary-foreground'>Jugador</TableHead>
                                            <TableHead className="hidden sm:table-cell text-primary-foreground">Modo</TableHead>
                                            <TableHead className="text-right text-primary-foreground">Puntaje</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaderboards.allTime.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-primary-foreground/80">
                                                    Aún no hay puntajes registrados.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            leaderboards.allTime.map((player, index) => (
                                                <TableRow key={`all-time-${index}`} className='border-primary-foreground/50'>
                                                    <TableCell className="font-medium">{getMedal(index)}</TableCell>
                                                    <TableCell>{player.name}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{getModeLabel(player.mode)}</TableCell>
                                                    <TableCell className="text-right font-bold text-accent">{player.score}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="space-y-8">
                                <ScoreTable title='El Muro de los Duros (Solitario)' players={leaderboards.solo} />
                                <ScoreTable title="Mejores Puntajes: Grupal" players={leaderboards.group} />
                            </div>
                            <div className="space-y-8">
                                <ScoreTable title="Salón de la Lacrería (Supervivencia)" players={leaderboards.survival} />
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='font-headline text-xl flex items-center gap-2'><Star className='text-accent'/>Rachas de Lacreo</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]">Pos.</TableHead>
                                                    <TableHead>Jugador</TableHead>
                                                    <TableHead className="text-right">Racha</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {leaderboards.survivalStreaks.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                            No hay rachas registradas.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    leaderboards.survivalStreaks.map((record, index) => (
                                                         <TableRow key={`streak-${index}`}>
                                                            <TableCell className="font-medium">{getMedal(index)}</TableCell>
                                                            <TableCell>{record.name}</TableCell>
                                                            <TableCell className="text-right font-bold text-primary">{record.streak}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        <AddScoreDialog onScoreAdded={fetchLeaderboards} />
        <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Acceso de Administrador</AlertDialogTitle>
                <AlertDialogDescription>
                  Por favor, introduce la clave para acceder al panel de gestión de puntajes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input 
                type="password"
                placeholder="Clave de acceso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPassword("")}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleAdminAccess}>Ingresar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
