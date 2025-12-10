"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MaracaIcon } from "@/components/icons/maraca-icon";
import { CuatroIcon } from "@/components/icons/cuatro-icon";
import { HallacaIcon } from "@/components/icons/hallaca-icon";
import { Trophy, Cog } from "lucide-react";
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
import { useRouter } from "next/navigation";


export default function Home() {
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  
  const handleAdminAccess = () => {
    if (password === "Jojoxto2420**") {
      sessionStorage.setItem("admin-auth", "true");
      router.push("/admin/upload-scores");
    } else {
      toast({
        title: "Clave incorrecta",
        description: "La clave de acceso de administrador no es válida.",
        variant: "destructive",
      });
      setPassword("");
    }
    setShowAdminDialog(false);
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 text-center overflow-x-hidden">
      <div 
        className="z-10 flex flex-col items-center p-4 md:p-10 rounded-xl bg-card/90 shadow-2xl backdrop-blur-sm animate-fade-in-down w-full max-w-sm md:max-w-6xl"
      >
        <h1 
          className="font-brand text-5xl md:text-8xl font-bold text-primary title-pulse"
        >
          ¡Parrandeando y Respondiendo!
        </h1>
        <p 
          className="mt-4 max-w-2xl text-base md:text-lg text-foreground/90 font-body"
        >
          Pon a prueba tus conocimientos sobre las tradiciones navideñas de Venezuela. Juega solo o compite con amigos en esta divertida parranda de preguntas.
        </p>

        <div 
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-fade-in-up"
        >
          <Link href="/solo" passHref className="flex">
            <div
              className="w-full transition-transform transform hover:scale-105"
            >
              <Card className="flex flex-col h-full cursor-pointer bg-card border-2 border-primary/50 relative overflow-hidden group hover:shadow-lg hover:shadow-accent/30">
                <CardHeader className="flex-grow">
                  <div className="flex justify-center mb-4">
                    <MaracaIcon className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl text-center text-foreground font-bold">Juego Individual</CardTitle>
                  <CardDescription className="text-center text-foreground/80 font-body min-h-[40px] px-2">
                    Compite contra el reloj y establece tu récord personal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center mt-auto p-4 pt-0">
                  <div className="w-full">
                     <Button variant="default" size="lg" className="w-full font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_hsl(var(--accent))] transition-shadow button-pulse">
                      Modo Solitario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Link>
          <Link href="/group" passHref className="flex">
             <div
              className="w-full transition-transform transform hover:scale-105"
            >
              <Card className="flex flex-col h-full cursor-pointer bg-card border-2 border-primary/50 relative overflow-hidden group hover:shadow-lg hover:shadow-accent/30">
                <CardHeader className="flex-grow">
                  <div className="flex justify-center mb-4">
                    <CuatroIcon className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl text-center text-foreground font-bold">Competencia Grupal</CardTitle>
                  <CardDescription className="text-center text-foreground/80 font-body min-h-[40px] px-2">
                    Reta hasta 3 amigos y vean quién es el rey de la parranda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center mt-auto p-4 pt-0">
                   <div className="w-full">
                    <Button variant="default" size="lg" className="w-full font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_hsl(var(--accent))] transition-shadow button-pulse">
                      Modo Grupal
                    </Button>
                   </div>
                </CardContent>
              </Card>
            </div>
          </Link>
          <Link href="/survival" passHref className="flex">
            <div
              className="w-full transition-transform transform hover:scale-105"
            >
              <Card className="flex flex-col h-full cursor-pointer bg-card border-2 border-primary/50 relative overflow-hidden group hover:shadow-lg hover:shadow-accent/30">
                <CardHeader className="flex-grow">
                  <div className="flex justify-center mb-4">
                    <HallacaIcon className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl text-center text-foreground font-bold">Supervivencia</CardTitle>
                  <CardDescription className="text-center text-foreground/80 font-body min-h-[40px] px-2">
                    ¿Cuánto puedes resistir? Una vida, una pregunta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center mt-auto p-4 pt-0">
                  <div className="w-full">
                    <Button variant="default" size="lg" className="w-full font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_hsl(var(--accent))] transition-shadow button-pulse">
                      Supervivencia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Link>
          <Link href="/scores" passHref className="flex">
            <div
              className="w-full transition-transform transform hover:scale-105"
            >
              <Card className="flex flex-col h-full cursor-pointer bg-card border-2 border-primary/50 relative overflow-hidden group hover:shadow-lg hover:shadow-accent/30">
                <CardHeader className="flex-grow">
                  <div className="flex justify-center mb-4">
                    <Trophy className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl text-center text-foreground font-bold">Puntajes</CardTitle>
                  <CardDescription className="text-center text-foreground/80 font-body min-h-[40px] px-2">
                    Revisa los récords y mira quién es el verdadero parrandero.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center mt-auto p-4 pt-0">
                  <div className="w-full">
                    <Button variant="secondary" size="lg" className="w-full font-bold text-lg bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-[0_0_15px_hsl(var(--primary))] transition-shadow">
                      Ver Puntajes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Link>
        </div>
      </div>
      
       <Button 
          variant="ghost" 
          size="icon" 
          className="fixed bottom-2 right-2 text-muted-foreground/30 hover:text-accent hover:bg-transparent"
          onClick={() => setShowAdminDialog(true)}
        >
          <Cog className="w-4 h-4" />
        </Button>
        
        <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Acceso de Administrador</AlertDialogTitle>
                <AlertDialogDescription>
                  Por favor, introduce la clave para acceder a la carga de puntajes.
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
    </main>
  );
}
