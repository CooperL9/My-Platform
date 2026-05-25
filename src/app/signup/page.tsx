"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserAccount = {
  name?: string;
  profilePicture?: string;
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

const compressProfileImage = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    const image = document.createElement("img");

    image.onload = () => {
      const maxSize = 360;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Image preview is not available."));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };

    image.onerror = () => reject(new Error("This photo could not be loaded."));
    reader.onerror = () => reject(new Error("This photo could not be read."));
    reader.onload = () => {
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
};

const loadUsers = () => {
  const storedUsers =
    localStorage.getItem("users") ?? localStorage.getItem("userAccounts");
  const users = storedUsers ? (JSON.parse(storedUsers) as UserAccount[]) : [];

  return users.map((user) => ({
    ...user,
    name:
      user.name ||
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.email,
  }));
};

export default function SignupPage() {
  const router = useRouter();
  const agreementDate = getTodayKey();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const canCreateAccount = acceptedAgreement && signatureName.trim() !== "";
  const inputClassName =
    "w-full rounded-[1.25rem] border border-[#ded0c5] bg-white/82 px-4 py-3 text-sm text-[#312722] shadow-[inset_0_1px_8px_rgba(66,46,36,0.05)] placeholder-[#9e8b82] outline-none transition focus:border-[#b89583] focus:bg-white focus:ring-2 focus:ring-[#e3c7b7]";
  const labelClassName =
    "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d5d4f]";
  const legalLinkClassName =
    "font-semibold text-[#4e6350] underline decoration-[#b8c7aa] underline-offset-4 transition hover:text-[#2f4432]";

  const handleProfilePictureUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    compressProfileImage(file)
      .then((compressedImage) => {
        setProfilePicture(compressedImage);
        setErrorMessage("");
      })
      .catch(() => {
        setErrorMessage("That photo is too large. Please try a smaller image.");
      });

    event.target.value = "";
  };

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

    const accounts = loadUsers();

    const normalizedEmail = email.trim().toLowerCase();
    const accountExists = accounts.some(
      (account) => account.email.toLowerCase() === normalizedEmail
    );

    if (accountExists) {
      setErrorMessage("An account with this email already exists.");
      return;
    }

    const newAccount = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      profilePicture,
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

    localStorage.setItem("users", JSON.stringify(updatedAccounts));
    localStorage.setItem("currentLoggedInUser", JSON.stringify(newAccount));

    router.push("/home");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#efe4d8] px-5 py-8 text-[#312722] sm:px-6 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(95,118,79,0.22)_0,transparent_24%),radial-gradient(circle_at_86%_12%,rgba(196,139,164,0.24)_0,transparent_22%),radial-gradient(circle_at_76%_88%,rgba(124,92,82,0.18)_0,transparent_24%),linear-gradient(135deg,#fffaf2_0%,#ead9cc_42%,#cdb7a7_100%)]" />
      <div className="absolute left-8 top-16 h-36 w-36 rounded-full bg-white/30 blur-3xl" />
      <div className="absolute bottom-10 right-8 h-44 w-44 rounded-full bg-[#d9b7a9]/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(90deg,rgba(88,70,54,0.12)_1px,transparent_1px),linear-gradient(rgba(88,70,54,0.10)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/78 shadow-[0_28px_80px_rgba(72,52,42,0.18)] backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative hidden overflow-hidden border-r border-white/60 bg-[#2f4432] p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-16 top-12 h-40 w-40 rounded-full border border-white/15" />
            <div className="absolute -bottom-12 left-10 h-36 w-36 rounded-[2rem] border border-white/15 rotate-12" />
            <div className="relative">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/62">
                Greatest Invention Yet
              </p>
              <h2 className="max-w-xs text-5xl font-semibold leading-[0.95]">
                A softer place to become.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/72">
                Journal, plan, check in, and keep the pieces of your life
                somewhere private and beautiful.
              </p>
            </div>

            <div className="relative rounded-[1.5rem] border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/76 shadow-[0_18px_44px_rgba(0,0,0,0.16)]">
              Your space starts simple. It grows with your rituals.
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#7d5d4f]">
              Begin gently
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-[#3b2d27] sm:text-4xl">
              Create your account
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#756257]">
              Start building your private space for reflection, planning, and
              becoming.
            </p>

            <div className="mt-7 flex flex-col gap-4">
              <label className="group flex cursor-pointer flex-col items-center rounded-[1.75rem] border border-dashed border-[#cdbbae] bg-[#fffaf4]/72 p-5 text-center shadow-[inset_0_1px_10px_rgba(66,46,36,0.04)] transition hover:border-[#9fb08d] hover:bg-white/82">
                <span className="relative mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-[#f3e7dc] shadow-[0_16px_34px_rgba(72,52,42,0.14)] ring-4 ring-[#efe1d4]/70 transition group-hover:ring-[#dce7d2]">
                  {profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePicture}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a7468]">
                      Add photo
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold text-[#4e6350]">
                  Add a profile photo
                </span>
                <span className="mt-1 text-xs text-[#8a7468]">
                  Optional, saved privately on this device.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="sr-only"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className={inputClassName}
                />

                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className={inputClassName}
                />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={inputClassName}
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={inputClassName}
              />

              <div>
                <label className={labelClassName}>Enter your birthday</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <section className="rounded-[1.5rem] border border-[#ded0c5] bg-[#fffaf4]/82 p-4 text-sm text-[#604f46] shadow-[inset_0_1px_10px_rgba(66,46,36,0.04)]">
                <p className={labelClassName}>Terms + Privacy</p>

                <label className="mb-4 flex gap-3 rounded-[1.25rem] border border-[#e4d7cc] bg-white/72 p-3">
                  <input
                    type="checkbox"
                    checked={acceptedAgreement}
                    onChange={(e) => setAcceptedAgreement(e.target.checked)}
                    className="mt-1 accent-[#4e6350]"
                  />
                  <span className="leading-6">
                    I have read and agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={legalLinkClassName}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={legalLinkClassName}
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                <label className="mb-2 block text-sm font-semibold text-[#59483f]">
                  Signature
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Type your full name"
                  className={inputClassName}
                />

                <p className="mt-3 rounded-full bg-white/72 px-4 py-2 text-xs text-[#756257]">
                  Agreement date: {getPrettyDate(agreementDate)}
                </p>
              </section>

              {errorMessage && (
                <p className="rounded-[1.25rem] border border-[#e4d7cc] bg-white/80 p-4 text-sm text-[#7d3f32]">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                onClick={handleSignup}
                disabled={!canCreateAccount}
                className="mt-1 rounded-full bg-[#2f4432] py-3.5 text-center text-sm font-semibold text-white shadow-[0_16px_34px_rgba(47,68,50,0.24)] transition hover:-translate-y-0.5 hover:bg-[#253728] disabled:cursor-not-allowed disabled:bg-[#cbbdb3] disabled:text-white/80 disabled:shadow-none disabled:hover:translate-y-0"
              >
                Create account
              </button>

              <p className="text-center text-sm text-[#756257]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#4e6350] underline decoration-[#b8c7aa] underline-offset-4 transition hover:text-[#2f4432]"
                >
                  Log in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
