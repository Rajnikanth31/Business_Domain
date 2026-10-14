import { create } from "zustand";
import { Action, Game, act, settle, money } from "../engine/game";
import { load, save } from "../db/save";
type Store = {
  game: Game | null;
  busy: boolean;
  error: string | null;
  offline: string | null;
  boot: () => Promise<void>;
  dispatch: (action?: Action, resumed?: boolean) => Promise<void>;
  dismiss: () => void;
};
function summary(result: ReturnType<typeof settle>) {
  if (result.seconds >= 10)
    return `${result.seconds}s away • ${result.amount >= 0 ? "earned" : "spent"} ${money(Math.abs(result.amount))}${result.anomaly ? " • 8-hour cap applied" : ""}`;
  return result.anomaly
    ? "Clock moved backwards. Earnings paused until it catches up."
    : null;
}
export const useGame = create<Store>((set, get) => ({
  game: null,
  busy: false,
  error: null,
  offline: null,
  dismiss: () => set({ offline: null, error: null }),
  boot: async () => {
    if (get().busy || get().game) return;
    set({ busy: true, error: null });
    try {
      const g = await load();
      const result = settle(g, Date.now());
      await save(result.game);
      set({ game: result.game, offline: summary(result) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },
  dispatch: async (action, resumed) => {
    const { game, busy } = get();
    if (!game || busy) return;
    set({ busy: true, error: null });
    try {
      const result = settle(game, Date.now());
      const next = action ? act(game, action, Date.now()) : result.game;
      await save(next);
      set({ game: next, ...(resumed ? { offline: summary(result) } : {}) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },
}));
