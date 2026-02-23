import { jwtDecode } from "jwt-decode";

export function validateBFRedirect(token: string) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}
