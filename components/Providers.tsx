"use client";
import { ThemeProvider } from "next-themes";
import { LangProvider } from "@/lib/i18n";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}
