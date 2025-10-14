import type { Route } from "./+types/register";
import { AuthLayout } from "../components/auth/auth-layout";
import { RegisterForm } from "../components/auth/register-form";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Account - PlanTopo" },
    { name: "description", content: "Create a new account" },
  ];
}

export default function Register() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
