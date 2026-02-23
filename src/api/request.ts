function showToast(message: string, type: "error" | "success") {
  if (type === "error") {
    alert(message);
    return;
  }

  console.info(message);
}

export async function safeRequest<T>(promise: Promise<{ data: T }>) {
  try {
    const res = await promise;
    return res.data;
  } catch (err: any) {
    if (!err.response) {
      showToast("Network error. Please try again.", "error");
    } else {
      showToast("Something went wrong.", "error");
    }

    throw err;
  }
}
