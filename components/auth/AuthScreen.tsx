"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signInAction, signUpAction } from "@/app/auth/actions";
import { initialState, type AuthState } from "@/app/auth/state";

export type AuthMode = "login" | "signup";

const authCopy: Record<
  AuthMode,
  {
    title: string;
    subtitle: string;
    button: string;
    alternateLabel: string;
    alternateHref: string;
    alternateText: string;
  }
> = {
  login: {
    title: "sign in",
    subtitle: "return to your field ledger.",
    button: "enter fauna",
    alternateLabel: "need an account?",
    alternateHref: "/auth/signup",
    alternateText: "create one",
  },
  signup: {
    title: "sign up",
    subtitle: "start a ledger for what you find in the wild.",
    button: "create your ledger",
    alternateLabel: "already registered?",
    alternateHref: "/auth/login",
    alternateText: "sign in",
  },
};

const fieldClass =
  "mt-2 h-12 w-full rounded-[6px] border border-[#86935b]/22 bg-white/82 px-4 text-[0.95rem] text-[#172332] outline-none transition-colors placeholder:text-[#637180] focus:border-[#6b7a3d] focus:ring-2 focus:ring-[#6b7a3d]/20";

function SubmitButton({ label, locked }: { label: string; locked: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || locked;
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex h-12 w-full items-center justify-center rounded-[6px] bg-[#172433] px-6 text-[0.74rem] font-medium tracking-[0.14em] text-white transition-colors hover:bg-[#101b28] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "checking…" : label}
    </button>
  );
}

function StatusMessage({ state }: { state: AuthState }) {
  if (!state.message) {
    return <div className="min-h-[52px]" aria-hidden="true" />;
  }
  return (
    <p
      aria-live="polite"
      className={`rounded-[6px] border px-4 py-3 text-sm leading-5 ${
        state.status === "success"
          ? "border-[#87945a]/24 bg-[#edf2df] text-[#364229]"
          : "border-[#a67b5b]/22 bg-[#fff8f5] text-[#6c4734]"
      }`}
    >
      {state.message}
    </p>
  );
}

export function AuthScreen({
  mode,
  locked = false,
  onAuthenticated,
}: {
  mode: AuthMode;
  locked?: boolean;
  onAuthenticated: (redirectTo?: string) => void | Promise<void>;
}) {
  const copy = authCopy[mode];
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction] = useActionState(action, initialState);
  const handledRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state.redirectTo) {
      handledRedirectRef.current = null;
      return;
    }
    if (handledRedirectRef.current === state.redirectTo) return;
    handledRedirectRef.current = state.redirectTo;
    void onAuthenticated(state.redirectTo);
  }, [onAuthenticated, state.redirectTo]);

  const isSignup = mode === "signup";

  return (
    <div className="flex h-full flex-col p-6 sm:p-7">
      <div className="grid grid-cols-2 rounded-[6px] border border-[#87945a]/20 bg-white/48 p-1">
        <Link
          href="/auth/login"
          className={`flex h-10 items-center justify-center rounded-[4px] text-[0.72rem] font-medium tracking-[0.12em] transition-colors ${
            mode === "login"
              ? "bg-[#172433] text-white"
              : "text-[#50616f] hover:bg-white/72"
          }`}
        >
          sign in
        </Link>
        <Link
          href="/auth/signup"
          className={`flex h-10 items-center justify-center rounded-[4px] text-[0.72rem] font-medium tracking-[0.12em] transition-colors ${
            mode === "signup"
              ? "bg-[#172433] text-white"
              : "text-[#50616f] hover:bg-white/72"
          }`}
        >
          sign up
        </Link>
      </div>

      <form action={formAction} key={mode} className="mt-8 flex flex-1 flex-col">
        <div>
          <h1 className="font-display text-[3.25rem] font-light leading-[0.9] tracking-[-0.055em] text-[#0d1f2d]/88 sm:text-[3.5rem]">
            {copy.title}
          </h1>
          <p className="mt-3 text-[0.96rem] leading-6 text-[#33485a]/78">
            {copy.subtitle}
          </p>
        </div>

        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[10000px] h-px w-px opacity-0"
        />

        <div className="mt-8 space-y-4">
          <label
            className="block"
            aria-hidden={!isSignup}
            style={{
              visibility: isSignup ? "visible" : "hidden",
              pointerEvents: isSignup ? "auto" : "none",
            }}
          >
            <span className="text-[0.72rem] font-medium tracking-[0.12em] text-[#586673]">
              name
            </span>
            <input
              name="name"
              type="text"
              minLength={isSignup ? 2 : undefined}
              maxLength={80}
              required={isSignup}
              autoComplete="name"
              placeholder="your name"
              className={fieldClass}
              tabIndex={isSignup ? 0 : -1}
            />
          </label>

          <label className="block">
            <span className="text-[0.72rem] font-medium tracking-[0.12em] text-[#586673]">
              email
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@fauna.app"
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="text-[0.72rem] font-medium tracking-[0.12em] text-[#586673]">
              password
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={12}
              maxLength={128}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="12+ characters"
              className={fieldClass}
            />
          </label>
        </div>

        <div className="mt-auto space-y-4 pt-8">
          <SubmitButton label={copy.button} locked={locked} />
          <StatusMessage state={state} />

          <p className="text-center text-[0.9rem] text-[#50616f]">
            {copy.alternateLabel}{" "}
            <Link
              href={copy.alternateHref}
              className="font-medium text-[#132133] transition-opacity hover:opacity-70"
            >
              {copy.alternateText}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
