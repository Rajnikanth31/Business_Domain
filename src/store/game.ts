import { create } from "zustand";
import { Action, Game, act, settle, money } from "../engine/game";
import { load, save, writeBackup, restoreBackup } from "../db/save";
type Store = {
  game: Game | null;
  busy: boolean;
  error: string | null;
  offline: string | null;
  boot: () => Promise<void>;
  restore: () => Promise<void>;
  dispatch: (
    action?: Action | { type: "backup" },
    resumed?: boolean,
  ) => Promise<void>;
  dismiss: () => void;
};
let tail: Promise<void> = Promise.resolve(),
  pending = 0,
  lastSaveAt = 0;
function summary(result: ReturnType<typeof settle>) {
  if (result.seconds >= 10)
    return `${result.seconds}s away · ${result.amount >= 0 ? "earned" : "spent"} ${money(Math.abs(result.amount))}${result.anomaly ? " · 8-hour income cap applied" : ""}`;
  return result.anomaly
    ? "Clock moved backwards. Earnings pause until it catches up."
    : null;
}
export const useGame = create<Store>((set, get) => ({
  game: null,
  busy: false,
  error: null,
  offline: null,
  dismiss: () => set({ error: null, offline: null }),
  boot: async () => {
    if (get().game || get().busy) return;
    set({ busy: true, error: null });
    try {
      const g = await load(),
        r = settle(g, Date.now());
      await save(r.game);
      lastSaveAt = r.game.lastSettlement;
      set({ game: r.game, offline: summary(r) });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },
  restore: async () => {
    if (get().game || get().busy) return;
    set({ busy: true, error: null });
    try {
      const g = await restoreBackup(),
        r = settle(g, Date.now());
      await save(r.game);
      lastSaveAt = r.game.lastSettlement;
      set({
        game: r.game,
        offline:
          "Backup restored. Progress after the backup has been reverted.",
      });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },
  dispatch: (action, resumed) => {
    if (!get().game) return Promise.resolve();
    if (!action && pending && !resumed) return tail;
    // Taps are legitimate individual inputs; financial buttons stay locked until their queued write completes.
    if (action && action.type !== "tap" && get().busy) return Promise.resolve();
    pending++;
    if (action && action.type !== "tap") set({ busy: true });
    const task = tail.then(async () => {
      try {
        const game = get().game!,
          now = Date.now();
        if (action?.type === "backup") {
          await writeBackup(game);
          set({ offline: "Save backup created on this device.", error: null });
          return;
        }
        const r = settle(game, now),
          next = action ? act(game, action, now) : r.game;
        const idle =
          !action &&
          !resumed &&
          now - lastSaveAt < 60000 &&
          next.cash === game.cash &&
          next.earned === game.earned &&
          next.remainder === game.remainder &&
          next.dividendsEarned === game.dividendsEarned &&
          next.dividendRemainder === game.dividendRemainder &&
          !(game.companies ?? []).some((c) => c.upgrade || c.project);
        if (!idle) {
          await save(next);
          lastSaveAt = now;
        }
        const note = summary(r);
        set({
          game: next,
          ...(action ? { error: null } : {}),
          ...((resumed || r.seconds >= 10 || r.anomaly) && note
            ? { offline: note }
            : {}),
        });
      } catch (e) {
        set({ error: (e as Error).message });
      } finally {
        pending--;
        if (!pending) set({ busy: false });
      }
    });
    tail = task;
    return task;
  },
}));
