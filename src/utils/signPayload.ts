const SECRET = import.meta.env.VITE_SUBMIT_SECRET;

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function signPayload(payload: unknown) {
  if (!SECRET) {
    throw new Error("Missing VITE_SUBMIT_SECRET");
  }

  const body = JSON.stringify(payload);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );

  return {
    body,
    signature: toHex(signatureBuffer)
  };
}
