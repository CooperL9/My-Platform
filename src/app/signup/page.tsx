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
  agreedToTerms: boolean;
  signatureName: string;
  agreementDate: string;
};

const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getPrettyDate = (dateKey: string) => {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function SignupPage() {
  const router = useRouter();
  const agreementDate = getTodayKey();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const canCreateAccount = acceptedAgreement && signatureName.trim() !== "";

  const handleSignup = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !birthday
    ) {
      setErrorMessage("Please fill out every field before creating an account.");
      return;
    }

    if (!acceptedAgreement || !signatureName.trim()) {
      setErrorMessage(
        "Please agree to the Terms and Privacy Policy and type your signature."
      );
      return;
    }

    const storedAccounts = localStorage.getItem("userAccounts");
    const accounts: UserAccount[] = storedAccounts
      ? JSON.parse(storedAccounts)
      : [];

    const normalizedEmail = email.trim().toLowerCase();
    const accountExists = accounts.some(
      (account) => account.email.toLowerCase() === normalizedEmail
    );

    if (accountExists) {
      setErrorMessage("An account with this email already exists.");
      return;
    }

    const newAccount = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      birthday,
      agreedToTerms: true,
      signatureName: signatureName.trim(),
      agreementDate,
    };

    const updatedAccounts = [...accounts, newAccount];

    localStorage.setItem("userAccounts", JSON.stringify(updatedAccounts));
    localStorage.setItem("currentLoggedInUser", JSON.stringify(newAccount));

    router.push("/home");
  };

  return (
    <main className={`${ui.centeredPage} flex items-center justify-center`}>
      <div className="w-full max-w-md rounded-[2rem] border border-[#eadfd9] bg-white/90 p-6 shadow-[0_20px_50px_rgba(124,92,82,0.10)] sm:p-7">
        <p className={ui.eyebrow}>Begin gently</p>
        <h1 className="mb-2 text-3xl font-semibold text-[#5c4033]">
          Create your account
        </h1>
        <p className="mb-6 text-sm leading-6 text-[#8b6f65]">
          Make a private space for your reflections, moods, and plans.
        </p>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className={ui.input}
          />

          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className={ui.input}
          />

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

          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className={ui.input}
          />

          <section className="rounded-[1.5rem] border border-[#eadfd9] bg-[#fffaf8] p-4 text-sm text-[#6f554d] shadow-[inset_0_1px_8px_rgba(124,92,82,0.04)]">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#b07d62]">
              Terms + Privacy
            </p>

            <label className="mb-4 flex gap-3 rounded-[1.25rem] border border-[#eadfd9] bg-white/70 p-3">
              <input
                type="checkbox"
                checked={acceptedAgreement}
                onChange={(e) => setAcceptedAgreement(e.target.checked)}
                className="mt-1 accent-[#d8b4a0]"
              />
              <span className="leading-6">
                I have read and agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#7c5c52] underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#7c5c52] underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <label className="mb-2 block text-sm font-medium text-[#7c5c52]">
              Signature
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Type your full name"
              className={ui.input}
            />

            <p className="mt-3 rounded-full bg-white/70 px-4 py-2 text-xs text-[#8b6f65]">
              Agreement date: {getPrettyDate(agreementDate)}
            </p>
          </section>

          {errorMessage && <p className={ui.paper}>{errorMessage}</p>}

          <button
            type="button"
            onClick={handleSignup}
            disabled={!canCreateAccount}
            className={`${ui.primaryButton} mt-2 py-3.5 text-center disabled:cursor-not-allowed disabled:bg-[#d8c8bf] disabled:text-white/80 disabled:shadow-none`}
          >
            Create account
          </button>

          <Link
            href="/login"
            className="text-center text-sm font-medium text-[#7c5c52]"
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
