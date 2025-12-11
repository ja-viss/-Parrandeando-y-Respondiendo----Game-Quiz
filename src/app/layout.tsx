import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Snow } from '@/components/snow';

export const metadata: Metadata = {
  title: '¡Parrandeando y Respondiendo!',
  description: 'A Venezuelan Christmas Quiz Game',
  verification: {
    google: 'TfDX11S0lqZZnLYV47WXILP2QoV0VnyuFFEu-zbp_yc',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-body antialiased min-h-screen bg-background relative animated-gradient">
        <Snow />
        <div className="relative z-10">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
