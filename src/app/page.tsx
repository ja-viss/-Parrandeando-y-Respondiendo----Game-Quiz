import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, Users } from "lucide-react";
import { HallacaIcon } from "@/components/icons/hallaca-icon";
import { CuatroIcon } from "@/components/icons/cuatro-icon";
import { MaracaIcon } from "@/components/icons/maraca-icon";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 text-center">
      <div className="absolute top-8 left-8 flex gap-4 opacity-50">
        <HallacaIcon className="w-8 h-8 text-primary" />
      </div>
      <div className="absolute top-16 right-16 flex gap-4 opacity-50">
        <CuatroIcon className="w-8 h-8 text-accent" />
      </div>
      <div className="absolute bottom-8 right-8 flex gap-4 opacity-50">
        <MaracaIcon className="w-8 h-8 text-primary" />
      </div>

      <div className="z-10 flex flex-col items-center">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary animate-fade-in-down">
          ¡Parrandeando y Respondiendo!
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground/80 animate-fade-in-up">
          Pon a prueba tus conocimientos sobre las tradiciones navideñas de Venezuela. Juega solo o compite con amigos en esta divertida parranda de preguntas.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Link href="/solo" passHref>
            <Card className="hover:border-primary hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl text-center">Juego Individual</CardTitle>
                <CardDescription className="text-center">
                  Compite contra el reloj y establece tu récord personal.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button variant="default" size="lg" className="font-bold">
                  Modo Solitario
                </Button>
              </CardContent>
            </Card>
          </Link>
          <Link href="/group" passHref>
            <Card className="hover:border-primary hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl text-center">Competencia Grupal</CardTitle>
                <CardDescription className="text-center">
                  Reta hasta 3 amigos y vean quién es el rey de la parranda.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button variant="default" size="lg" className="font-bold">
                  Modo Grupal
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
