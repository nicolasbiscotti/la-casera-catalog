interface AdminUIState {
  currentPage: string;
  currentId: string | null;
  toast: { message: string; type: "success" | "error" } | null;
}

let state: AdminUIState = {
  currentPage: "dashboard",
  currentId: null,
  toast: null,
};

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

export function getAdminUIState(): AdminUIState {
  return state;
}

export function subscribeUI(callback: Subscriber): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function setState(updates: Partial<AdminUIState>): void {
  state = { ...state, ...updates };
  subscribers.forEach((fn) => fn());
}

export function setPage(page: string, id?: string): void {
  setState({ currentPage: page, currentId: id ?? null });
}

export function setToast(
  message: string,
  type: "success" | "error" = "success",
): void {
  setState({ toast: { message, type } });
  setTimeout(() => setState({ toast: null }), 3000);
}

export function clearToast(): void {
  setState({ toast: null });
}
