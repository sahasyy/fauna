"use server";

import { initialState, type AuthState } from "@/app/auth/state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateEmailAndPassword(email: string, password: string) {
  if (!emailPattern.test(email)) {
    return "enter a valid email address.";
  }

  if (password.length < 12) {
    return "password must be at least 12 characters.";
  }

  if (password.length > 128) {
    return "password is too long.";
  }

  return null;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signInAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = getValue(formData, "email").toLowerCase();
  const password = getValue(formData, "password");
  const botTrap = getValue(formData, "company");
  const validationError = validateEmailAndPassword(email, password);

  if (botTrap) {
    return initialState;
  }

  if (validationError) {
    return { status: "error", message: validationError, redirectTo: null };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        status: "error",
        message: "email or password is incorrect.",
        redirectTo: null,
      };
    }
  } catch {
    return {
      status: "error",
      message: "auth is not connected yet. add your supabase env keys.",
      redirectTo: null,
    };
  }

  return {
    status: "success",
    message: "",
    redirectTo: "/dex",
  };
}

export async function signUpAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = getValue(formData, "name");
  const email = getValue(formData, "email").toLowerCase();
  const password = getValue(formData, "password");
  const botTrap = getValue(formData, "company");
  const validationError = validateEmailAndPassword(email, password);

  if (botTrap) {
    return initialState;
  }

  if (name.length < 2 || name.length > 80) {
    return {
      status: "error",
      message: "name must be between 2 and 80 characters.",
      redirectTo: null,
    };
  }

  if (validationError) {
    return { status: "error", message: validationError, redirectTo: null };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dex`,
      },
    });

    if (error) {
      return {
        status: "error",
        message: "could not create that account. try another email.",
        redirectTo: null,
      };
    }

    if (data.session) {
      return {
        status: "success",
        message: "",
        redirectTo: "/dex",
      };
    }
  } catch {
    return {
      status: "error",
      message: "auth is not connected yet. add your supabase env keys.",
      redirectTo: null,
    };
  }

  return {
    status: "success",
    message: "check your email to confirm your account.",
    redirectTo: null,
  };
}
