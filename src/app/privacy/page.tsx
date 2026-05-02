"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ui } from "../stylePatterns";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mb-6 text-sm leading-7 text-[#8b6f65]">
          This MVP is designed as a private digital sanctuary. For now, your
          account and app data are stored in your browser&apos;s localStorage, not
          a connected backend.
        </p>

        <div className="space-y-4 text-sm leading-7 text-[#6f554d]">
          <section className={ui.paper}>
            <h2 className="mb-1 font-semibold text-[#5c4033]">
              What is stored
            </h2>
            <p>
              The app may store your signup details, agreement signature,
              journal entries, mood entries, planner items, and homepage
              customization locally in your browser.
            </p>
          </section>

          <section className={ui.paper}>
            <h2 className="mb-1 font-semibold text-[#5c4033]">
              Where it is stored
            </h2>
            <p>
              In this MVP, data stays on the device and browser where it was
              created. Clearing browser data may remove saved app content.
            </p>
          </section>

          <section className={ui.paper}>
            <h2 className="mb-1 font-semibold text-[#5c4033]">
              Future updates
            </h2>
            <p>
              If cloud sync or backend storage is added later, this policy
              should be updated before that system is used.
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
            href="/terms"
            className={`${ui.secondaryButton} rounded-full px-5 py-3 text-center text-sm`}
          >
            View Terms
          </Link>
        </div>
      </div>
    </main>
  );
}
