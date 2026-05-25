"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ui } from "../stylePatterns";

type UserAccount = {
  name?: string;
  profilePicture?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
  agreedToTerms?: boolean;
  signatureName?: string;
  agreementDate?: string;
};

type StoredUserAccount = Partial<UserAccount> & {
  email?: string;
  password?: string;
};

const parseStoredUsers = (storedUsers: string | null) => {
  if (!storedUsers) return [];

  try {
    const parsedUsers = JSON.parse(storedUsers) as
      | StoredUserAccount
      | StoredUserAccount[];

    return Array.isArray(parsedUsers) ? parsedUsers : [parsedUsers];
  } catch {
    return [];
  }
};

const normalizeUser = (user: StoredUserAccount): UserAccount | null => {
  const email = user.email?.trim().toLowerCase();
  const password = user.password ?? "";

  if (!email || !password) return null;

  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";

  return {
    name: user.name || `${firstName} ${lastName}`.trim() || email,
    profilePicture: user.profilePicture ?? "",
    firstName,
    lastName,
    email,
    password,
    birthday: user.birthday ?? "",
    agreedToTerms: user.agreedToTerms,
    signatureName: user.signatureName,
    agreementDate: user.agreementDate,
  };
};

const loadUsers = () => {
  const storedUsers = parseStoredUsers(localStorage.getItem("users"));
  const legacyUsers = parseStoredUsers(localStorage.getItem("userAccounts"));
  const usersByEmail = new Map<string, UserAccount>();

  [...legacyUsers, ...storedUsers].forEach((user) => {
    const normalizedUser = normalizeUser(user);

    if (normalizedUser) {
      usersByEmail.set(normalizedUser.email, normalizedUser);
    }
  });

  return Array.from(usersByEmail.values());
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

    const accounts = loadUsers();

    const matchingAccount = accounts.find(
      (account) =>
        account.email.toLowerCase() === email.trim().toLowerCase() &&
        account.password === password
    );

    if (!matchingAccount) {
      setErrorMessage("Email or password is incorrect.");
      return;
    }

    localStorage.setItem("users", JSON.stringify(accounts));
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
