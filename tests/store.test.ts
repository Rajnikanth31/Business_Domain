import { act } from "../src/engine/game";
import { newPlayer } from "../src/engine/empire";
jest.mock("../src/db/save", () => ({
  load: jest.fn(),
  save: jest.fn(),
  writeBackup: jest.fn(),
  restoreBackup: jest.fn(),
}));
import { save, writeBackup } from "../src/db/save";
import { useGame } from "../src/store/game";
beforeEach(() => {
  jest.spyOn(Date, "now").mockReturnValue(1000000);
  (save as jest.Mock).mockReset().mockResolvedValue(undefined);
  useGame.setState({
    game: { ...newPlayer(Date.now()), cash: 1000000 },
    busy: false,
    error: null,
    offline: null,
  });
});
afterEach(() => jest.restoreAllMocks());
test("legitimate rapid taps are queued and credited after atomic saves", async () => {
  let finish!: () => void;
  (save as jest.Mock).mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const first = useGame.getState().dispatch({ type: "tap" });
  await Promise.resolve();
  const second = useGame.getState().dispatch({ type: "tap" });
  expect(save).toHaveBeenCalledTimes(1);
  expect(useGame.getState().game!.taps).toBe(0);
  finish();
  await Promise.all([first, second]);
  expect(useGame.getState().game!.taps).toBe(2);
  expect(useGame.getState().game!.cash).toBe(1000500);
});
test("duplicate financial purchase is ignored while saving", async () => {
  let finish!: () => void;
  (save as jest.Mock).mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const first = useGame
    .getState()
    .dispatch({ type: "openCompany", kind: "shop" });
  await Promise.resolve();
  await useGame.getState().dispatch({ type: "openCompany", kind: "shop" });
  expect(save).toHaveBeenCalledTimes(1);
  finish();
  await first;
  expect(useGame.getState().game!.companies).toHaveLength(1);
});
test("failed company purchase does not publish uncommitted cash or ownership", async () => {
  (save as jest.Mock).mockRejectedValueOnce(new Error("Disk full"));
  await useGame.getState().dispatch({ type: "openCompany", kind: "shop" });
  expect(useGame.getState().game!.cash).toBe(1000000);
  expect(useGame.getState().game!.companies).toHaveLength(0);
  expect(useGame.getState().error).toBe("Disk full");
});
test("passive updates preserve a visible error until explicitly resolved", async () => {
  useGame.setState({ error: "A purchase could not be saved" });
  await useGame.getState().dispatch();
  expect(useGame.getState().error).toBe("A purchase could not be saved");
  useGame.getState().dismiss();
  expect(useGame.getState().error).toBeNull();
});
test("recovery backup includes the latest queued tap", async () => {
  const first = useGame.getState().dispatch({ type: "tap" }),
    backup = useGame.getState().dispatch({ type: "backup" });
  await Promise.all([first, backup]);
  expect(writeBackup).toHaveBeenCalledWith(
    expect.objectContaining({ cash: 1000250, taps: 1 }),
  );
});
test("returning from background shows earnings without duplicate payout", async () => {
  const then = Date.now() - 60000;
  useGame.setState({
    game: act(
      { ...newPlayer(then), cash: 1000000 },
      { type: "openCompany", kind: "shop" },
      then,
    ),
  });
  await useGame.getState().dispatch(undefined, true);
  expect(useGame.getState().offline).toContain("earned");
  const balance = useGame.getState().game!.cash;
  await useGame.getState().dispatch(undefined, true);
  expect(useGame.getState().game!.cash).toBe(balance);
  useGame.getState().dismiss();
  expect(useGame.getState().offline).toBeNull();
});
