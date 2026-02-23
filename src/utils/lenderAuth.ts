import { jwtDecode } from "jwt-decode";

export function validateLenderToken(token: string) {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded?.lenderId) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
