"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ui } from "../stylePatterns";

type UserAccount = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    const storedAccounts = localStorage.getItem("userAccounts");
    const accounts: UserAccount[] = storedAccounts
      ? JSON.parse(storedAccounts)
      : [];

    const matchingAccount = accounts.find(
      (account) =>
        account.email.toLowerCase() === email.trim().toLowerCase() &&
        account.password === password
    );

    if (!matchingAccount) {
      setErrorMessage("We could not find an account with those details.");
      return;
    }

    localStorage.setItem("currentLoggedInUser", JSON.stringify(matchingAccount));
    router.push("/home");
  };

  return (
    <main className={`${ui.centeredPage} flex items-center justify-center`}>
      <div className={ui.authCard}>
        <p className={ui.eyebrow}>Private space</p>
        <h1 className="mb-2 text-3xl font-semibold text-[#5c4033]">
          Welcome back
        </h1>
        <p className="mb-6 text-sm leading-6 text-[#8b6f65]">
          Log in to return to your saved journal, mood, and planner space.
        </p>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={ui.input}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={ui.input}
          />

          {errorMessage && <p className={ui.paper}>{errorMessage}</p>}

          <button
            type="button"
            onClick={handleLogin}
            className={`${ui.primaryButton} mt-2 py-3.5 text-center`}
          >
            Login
          </button>

          <Link
            href="/signup"
            className={`${ui.secondaryButton} py-3.5 text-center`}
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
