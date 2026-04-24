export type AuthState = {
  status: "idle" | "error" | "success";
  message: string;
  redirectTo: string | null;
};

export const initialState: AuthState = {
  status: "idle",
  message: "",
  redirectTo: null,
};
