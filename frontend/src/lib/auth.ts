export function clearAuthStorage() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem("accessToken");
    storage.removeItem("employeeId");
    storage.removeItem("employeeName");
    storage.removeItem("employeeEmail");
    storage.removeItem("role");
  }
}

export function getRole(): string | null {
  return window.localStorage.getItem("role") ?? window.sessionStorage.getItem("role");
}

export function isAdmin(): boolean {
  return getRole() === "ADMIN";
}
