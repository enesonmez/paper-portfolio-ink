import type { LoginFormState } from "./login.shared";
import { LoginBackground } from "./components/login-background";
import { LoginFooter } from "./components/login-footer";
import { LoginFormCard } from "./components/login-form-card";
import { LoginHeader } from "./components/login-header";

interface LoginScreenProps extends LoginFormState {
  isSubmitting?: boolean;
}

export function LoginScreen({
  errors,
  isSubmitting = false,
  values,
}: LoginScreenProps) {
  return (
    <main className="bg-background relative flex min-h-screen flex-col overflow-hidden">
      <LoginBackground />
      <LoginHeader />

      <section className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 md:px-6 md:py-14">
        <LoginFormCard
          errors={errors}
          isSubmitting={isSubmitting}
          values={values}
        />
      </section>

      <LoginFooter />
    </main>
  );
}
