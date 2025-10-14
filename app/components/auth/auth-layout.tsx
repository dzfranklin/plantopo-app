import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex items-center justify-center min-h-screen py-16 px-4">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
