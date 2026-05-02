"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ui } from "../stylePatterns";

export default function TermsPage() {
  const isSignedIn = useSyncExternalStore(
    () => () => {},
    () => Boolean(localStorage.getItem("currentLoggedInUser")),
    () => false
  );

  const backHref = isSignedIn ? "/home" : "/signup";
  const backLabel = isSignedIn ? "Back to Home" : "Back to signup";

  return (
    <main className={`${ui.centeredPage} py-10`}>
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-[#eadfd9] bg-white/90 p-6 shadow-[0_20px_50px_rgba(124,92,82,0.10)] sm:p-8">
        <p className={ui.eyebrow}>Greatest Invention Yet</p>
        <h1 className="mb-3 text-3xl font-semibold text-[#5c4033]">
          Terms of Service
        </h1>
        <p className="mb-6 text-sm leading-7 text-[#8b6f65]">
          These MVP terms are here to keep expectations clear while the app is
          in beta. Greatest Invention Yet is a private planning, journaling, and
          reflection space stored locally in your browser for now.
        </p>

        <div className="space-y-4 text-sm leading-7 text-[#6f554d]">
          <section className={ui.paper}>
            <h2 className="mb-1 font-semibold text-[#5c4033]">Use of the app</h2>
            <p>
              You agree to use the app for personal planning, journaling, mood
              tracking, and reflection. Do not use it for harmful, illegal, or
              abusive activity.
            </p>
          </section>

          <section className={ui.paper}>
            <h2 className="mb-1 font-semibold text-[#5c4033]">Your content</h2>
            <p>
              Your entries, moods, planner items, and customization choices are
              yours. In this MVP, they are saved locally on the device and
              browser you use.
            </p>
          </section>

          <section className={ui.paper}>
            <h2 className="mb-1 font-semibold text-[#5c4033]">Beta experience</h2>
            <p>
              This app is still evolving. Features may change, and local browser
              storage can be cleared by browser settings or device changes.
            </p>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={backHref}
            className={`${ui.primaryButton} rounded-full px-5 py-3 text-center text-sm`}
          >
            {backLabel}
          </Link>
          <Link
            href="/privacy"
            className={`${ui.secondaryButton} rounded-full px-5 py-3 text-center text-sm`}
          >
            View Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
