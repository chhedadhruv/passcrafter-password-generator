// Hand a generated password from the generator to the vault page ("Save to vault").
// sessionStorage is tab-scoped and the vault page removes the value as soon as it reads it.
// The password is never put in a URL, so it can't leak via history or referrers.
export const PENDING_KEY = "passcrafter:pending-password";

export function stashPendingPassword(password) {
  try {
    sessionStorage.setItem(PENDING_KEY, password);
    return true;
  } catch {
    return false;
  }
}
