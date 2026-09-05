export function isRequestAbort(error: unknown): boolean {
  let current: unknown = error;

  for (let depth = 0; depth < 5 && current != null; depth += 1) {
    if (!(current instanceof Error)) return false;

    if (
      current.name === "AbortError" ||
      current.message === "aborted" ||
      current.message === "The operation was aborted"
    ) {
      return true;
    }

    current = current.cause;
  }

  return false;
}