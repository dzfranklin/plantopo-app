import { useState } from "react";
import { useNavigate } from "react-router";
import authClient from "~/auth.client";
import { AuthForm } from "./auth-form";

export function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/",
      });
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create Account"
      footer={{
        text: "Already have an account?",
        linkText: "Sign in",
        linkHref: "/login",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="At least 8 characters"
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 px-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </AuthForm>
  );
}
