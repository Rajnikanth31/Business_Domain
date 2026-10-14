import { initialGame } from "../src/engine/game";
jest.mock("../src/db/save", () => ({ load: jest.fn(), save: jest.fn() }));
import { save } from "../src/db/save";
import { useGame } from "../src/store/game";
beforeEach(() => {
  jest.clearAllMocks();
  useGame.setState({
    game: initialGame(Date.now()),
    busy: false,
    error: null,
    offline: null,
  });
});
test("concurrent duplicate action is ignored while saving", async () => {
  let finish!: () => void;
  (save as jest.Mock).mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const first = useGame.getState().dispatch({ type: "tap" });
  await useGame.getState().dispatch({ type: "tap" });
  expect(save).toHaveBeenCalledTimes(1);
  expect(useGame.getState().game!.taps).toBe(0);
  finish();
  await first;
  expect(useGame.getState().game!.taps).toBe(1);
});
test("failed purchase does not publish uncommitted cash or ownership", async () => {
  (save as jest.Mock).mockRejectedValueOnce(new Error("Disk full"));
  await useGame.getState().dispatch({ type: "buy", index: 0 });
  expect(useGame.getState().game!.cash).toBe(100000);
  expect(useGame.getState().game!.levels[0]).toBe(0);
  expect(useGame.getState().error).toBe("Disk full");
});
test("returning from background shows offline earnings once", async () => {
  (save as jest.Mock).mockResolvedValue(undefined);
  useGame.setState({
    game: { ...initialGame(Date.now() - 60000), levels: [1, 0, 0, 0, 0] },
  });
  await useGame.getState().dispatch(undefined, true);
  expect(useGame.getState().offline).toContain("earned");
  const balance = useGame.getState().game!.cash;
  await useGame.getState().dispatch(undefined, true);
  expect(useGame.getState().offline).toBeNull();
  expect(useGame.getState().game!.cash - balance).toBeLessThan(100);
});
