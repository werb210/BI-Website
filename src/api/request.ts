import axios from "axios";

export async function safeRequest(promise: Promise<any>) {
  try {
    const res = await promise;
    return res.data;
  } catch (e: any) {
    alert("Something went wrong.");
    throw e;
  }
}
