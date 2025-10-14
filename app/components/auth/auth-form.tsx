import type { ReactNode } from "react";
import { Link } from "react-router";

interface AuthFormProps {
  title: string;
  children: ReactNode;
  footer?: {
    text: string;
    linkText: string;
    linkHref: string;
  };
}

export function AuthForm({ title, children, footer }: AuthFormProps) {
  return (
    <div className="rounded-3xl border border-gray-200 p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-center text-gray-900">
        {title}
      </h1>
      {children}
      {footer && (
        <p className="text-center text-sm text-gray-600">
          {footer.text}{" "}
          <Link
            to={footer.linkHref}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            {footer.linkText}
          </Link>
        </p>
      )}
    </div>
  );
}
