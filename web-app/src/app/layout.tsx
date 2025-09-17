import React from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Navigation />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
