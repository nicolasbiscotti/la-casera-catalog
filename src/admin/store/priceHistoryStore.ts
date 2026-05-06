import type { PriceChange } from "@/types";
import { getPriceHistory } from "@/services";

interface PriceHistoryState {
  historyData: PriceChange[];
  isLoading: boolean;
  error: string | null;
}

let state: PriceHistoryState = {
  historyData: [],
  isLoading: false,
  error: null,
};

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

export function getPriceHistoryState(): PriceHistoryState {
  return state;
}

export function subscribePriceHistory(callback: Subscriber): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function setState(updates: Partial<PriceHistoryState>): void {
  state = { ...state, ...updates };
  subscribers.forEach((fn) => fn());
}

export async function loadPriceHistory(limitCount = 50): Promise<void> {
  if (state.isLoading) return;
  setState({ isLoading: true, error: null });
  try {
    const historyData = await getPriceHistory(limitCount);
    setState({ historyData, isLoading: false });
  } catch (error) {
    setState({
      isLoading: false,
      error:
        error instanceof Error ? error.message : "Error al cargar historial",
    });
  }
}
