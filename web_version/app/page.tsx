"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Command } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1500);
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background text-foreground">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Command className="mr-2 h-6 w-6 text-cyan-500" />
          Paulista PDV
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Sistema integrado de gestão para materiais de construção e varejo.&rdquo;
            </p>
            <footer className="text-sm">Paulista Tecnologia</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-8 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Acesso ao Sistema
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para continuar
            </p>
          </div>
          <div className={cn("grid gap-6")}>
            <form onSubmit={onSubmit}>
              <div className="grid gap-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                    Senha
                  </label>
                  <input
                    id="password"
                    placeholder="••••••"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Button disabled={isLoading} variant="premium" className="w-full mt-4">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Entrar
                </Button>
              </div>
            </form>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Ao clicar em Entrar, você concorda com nossos{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
