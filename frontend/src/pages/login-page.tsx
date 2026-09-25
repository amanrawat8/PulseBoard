import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2, Zap } from "lucide-react";

import heroImage from "@/assets/hero.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { extractErrorMessage } from "@/lib/api-client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@pulseboard.dev" },
  { role: "Project Manager", email: "pm1@pulseboard.dev" },
  { role: "Developer", email: "dev1@pulseboard.dev" },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-24 size-80 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" fill="currentColor" />
          </div>
          <span className="font-display text-lg font-bold text-white">
            PulseBoard
          </span>
        </div>

        <img
          src={heroImage}
          alt=""
          className="relative w-40 opacity-90 drop-shadow-[0_20px_40px_rgba(124,58,237,0.35)]"
        />

        <div className="relative max-w-md space-y-4">
          <h2 className="font-display text-3xl leading-tight font-bold text-white">
            Real-time visibility into every project, for every role.
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            Track tasks, watch status changes land live, and stay on top of
            what matters — scoped precisely to what your role should see.
          </p>
        </div>

        <p className="relative text-xs text-sidebar-foreground/40">
          Real-time client project dashboard
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1.5 text-center lg:text-left">
            <h1 className="font-display text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your PulseBoard account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@pulseboard.dev"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Demo accounts &middot; password: password123
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setValue("email", account.email);
                    setValue("password", "password123");
                  }}
                  className="rounded-md border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {account.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
