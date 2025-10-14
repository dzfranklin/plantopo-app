import type { Route } from "./+types/login";
import { AuthLayout } from "../components/auth/auth-layout";
import { LoginForm } from "../components/auth/login-form";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In - PlanTopo" },
    { name: "description", content: "Sign in to your account" },
  ];
}

export default function Login() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
