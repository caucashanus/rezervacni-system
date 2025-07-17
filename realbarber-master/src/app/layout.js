import { Inter } from "next/font/google";
import "./globals.css";
import LocationSelector from "@/components/LocationSelector";
import Loader from "@/components/Loader";
import { Suspense } from "react";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PWAKeyManager } from "@/components/PWAKeyManager";
import { Providers } from "@/components/Providers";
import { AdminProvider } from "@/contexts/AdminContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Real Barber",
  description: "Barbershop management application",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Real Barber",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFD700",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFD700" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Real Barber" />
      </head>
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <Providers>
          <Suspense fallback={<Loader />}>
            <AdminProvider>
              <ServiceWorkerRegistration />
              <PWAKeyManager />
              <main className="">
                {children}
              </main>
            </AdminProvider>
          </Suspense>
        </Providers>
        <Suspense fallback={<Loader />}>
          <LocationSelector />
        </Suspense>
      </body>
    </html>
  );
}
