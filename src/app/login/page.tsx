"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("أدخل بريدًا صحيحًا"),
  password: z.string().min(6, "كلمة المرور قصيرة جدًا"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const res = await signIn("credentials", {
      ...values,
      redirect: false,
    });
    if (res?.error) {
      setServerError("بيانات الدخول غير صحيحة.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-3xl border bg-card p-8 shadow-luxury">
          <div className="text-center">
            <div className="text-sm font-bold">Alhana Logistique</div>
            <div className="mt-1 text-xs text-muted-foreground">تسجيل الدخول</div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" dir="ltr" {...form.register("email")} />
              {form.formState.errors.email ? (
                <div className="text-xs text-destructive">{form.formState.errors.email.message}</div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" dir="ltr" {...form.register("password")} />
              {form.formState.errors.password ? (
                <div className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </div>
              ) : null}
            </div>

            {serverError ? <div className="text-xs text-destructive">{serverError}</div> : null}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              دخول
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}

