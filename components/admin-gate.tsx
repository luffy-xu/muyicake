"use client";

import { useState } from "react";

const key = "muyi-admin-password";

function readStoredPassword() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.sessionStorage.getItem(key) ?? "";
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState(readStoredPassword);
  const [unlocked, setUnlocked] = useState(() => Boolean(readStoredPassword()));

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF7EC] p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            window.sessionStorage.setItem(key, password);
            setUnlocked(true);
          }}
          className="w-full max-w-md rounded-[2rem] bg-[#FFFCF7] p-6 shadow-lg"
        >
          <h1 className="text-2xl font-semibold">Admin access</h1>
          <p className="mt-2 text-sm leading-6 text-[#7A6258]">
            Enter the operator password to manage reservations.
          </p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input mt-5"
            placeholder="Admin password"
            aria-label="Admin password"
          />
          <button className="mt-5 w-full rounded-full bg-[#6B3F2A] px-5 py-3 font-semibold text-white">
            Continue
          </button>
        </form>
      </main>
    );
  }

  return <>{children}</>;
}

export function getAdminPassword() {
  return readStoredPassword();
}
