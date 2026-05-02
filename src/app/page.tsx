import Link from "next/link";
import { ui } from "./stylePatterns";

export default function LandingPage() {
  return (
    <main className={`${ui.centeredPage} flex items-center justify-center`}>
      <div className={`${ui.authCard} text-center`}>
        <p className={ui.eyebrow}>Greatest Invention Yet</p>
        <h1 className="mb-4 text-4xl font-semibold leading-tight text-[#5c4033]">
          Welcome back
        </h1>

        <p className="mx-auto mb-8 max-w-md leading-7 text-[#8b6f65]">
          Your space to plan, reflect, and breathe.
        </p>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/login"
            className={`${ui.primaryButton} px-6 py-3.5 text-center`}
          >
            Login
          </Link>

          <Link
            href="/signup"
            className={`${ui.secondaryButton} px-6 py-3.5 text-center`}
          >
            Signup
          </Link>

          <Link
            href="/home"
            className="mt-2 text-center text-sm font-medium text-[#7c5c52]"
          >
            Go to Home
          </Link>

          <Link
            href="/planner"
            className="text-center text-sm font-medium text-[#7c5c52]"
          >
            Go to Planner
          </Link>

          <Link
            href="/journal"
            className="text-center text-sm font-medium text-[#7c5c52]"
          >
            Go to Journal
          </Link>

          <Link
            href="/mood"
            className="text-center text-sm font-medium text-[#7c5c52]"
          >
            Go to Mood
          </Link>

          <Link
            href="/history"
            className="text-center text-sm font-medium text-[#7c5c52]"
          >
            Go to History
          </Link>
        </div>
      </div>
    </main>
  );
}
