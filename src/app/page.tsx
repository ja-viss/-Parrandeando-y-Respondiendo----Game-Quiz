import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GingerbreadManIcon } from "@/components/icons/gingerbread-man-icon";
import { CarolersIcon } from "@/components/icons/carolers-icon";
import { HallacaIcon } from "@/components/icons/hallaca-icon";
import { Stars } from "@/components/stars";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 text-center overflow-hidden">
      <Stars />
      <div className="z-10 flex flex-col items-center p-6 md:p-10 rounded-xl bg-card/90 shadow-2xl backdrop-blur-sm animate-fade-in-down">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary title-pulse">
          ¡Parrandeando y Respondiendo!
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground/90 font-body">
          Pon a prueba tus conocimientos sobre las tradiciones navideñas de Venezuela. Juega solo o compite con amigos en esta divertida parranda de preguntas.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          <Link href="/solo" passHref className="flex">
            <Card className="flex flex-col hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-card border-2 border-primary/50 relative overflow-hidden group">
               <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary origin-bottom-left rotate-45" />
               <div className="absolute top-1 right-5 w-px h-20 bg-accent/50" />
               <div className="absolute top-5 right-1 w-20 h-px bg-accent/50" />
              <CardHeader className="flex-grow">
                <div className="flex justify-center mb-4">
                  <GingerbreadManIcon className="w-20 h-20 text-primary" />
                </div>
                <CardTitle className="font-body text-3xl text-center text-foreground font-bold">Juego Individual</CardTitle>
                <CardDescription className="text-center text-foreground/80 font-body min-h-[40px]">
                  Compite contra el reloj y establece tu récord personal.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center mt-auto p-6 pt-0">
                <Button variant="default" size="lg" className="w-full font-bold text-lg bg-primary text-accent hover:bg-primary/90 hover:shadow-[0_0_15px_hsl(var(--accent))] transition-shadow button-pulse">
                  Modo Solitario
                </Button>
              </CardContent>
            </Card>
          </Link>
          <Link href="/group" passHref className="flex">
            <Card className="flex flex-col hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-card border-2 border-primary/50 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary origin-bottom-left rotate-45" />
               <div className="absolute top-1 right-5 w-px h-20 bg-accent/50" />
               <div className="absolute top-5 right-1 w-20 h-px bg-accent/50" />
              <CardHeader className="flex-grow">
                <div className="flex justify-center mb-4">
                  <CarolersIcon className="w-20 h-20 text-primary" />
                </div>
                <CardTitle className="font-body text-3xl text-center text-foreground font-bold">Competencia Grupal</CardTitle>
                <CardDescription className="text-center text-foreground/80 font-body min-h-[40px]">
                  Reta hasta 3 amigos y vean quién es el rey de la parranda.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center mt-auto p-6 pt-0">
                <Button variant="default" size="lg" className="w-full font-bold text-lg bg-primary text-accent hover:bg-primary/90 hover:shadow-[0_0_15px_hsl(var(--accent))] transition-shadow button-pulse">
                  Modo Grupal
                </Button>
              </CardContent>
            </Card>
          </Link>
          <Link href="/survival" passHref className="flex">
            <Card className="flex flex-col hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-card border-2 border-primary/50 relative overflow-hidden group">
               <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary origin-bottom-left rotate-45" />
               <div className="absolute top-1 right-5 w-px h-20 bg-accent/50" />
               <div className="absolute top-5 right-1 w-20 h-px bg-accent/50" />
              <CardHeader className="flex-grow">
                <div className="flex justify-center mb-4">
                  <HallacaIcon className="w-20 h-20 text-primary" />
                </div>
                <CardTitle className="font-body text-3xl text-center text-foreground font-bold">Supervivencia</CardTitle>
                <CardDescription className="text-center text-foreground/80 font-body min-h-[40px]">
                  ¿Cuánto puedes resistir? Una vida, una pregunta.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center mt-auto p-6 pt-0">
                <Button variant="default" size="lg" className="w-full font-bold text-lg bg-primary text-accent hover:bg-primary/90 hover:shadow-[0_0_15px_hsl(var(--accent))] transition-shadow button-pulse">
                  Modo Supervivencia
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
