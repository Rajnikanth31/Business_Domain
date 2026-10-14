import { initialGame } from "../src/engine/game";
let mockPayload: string | null = null;
let mockVersion = 0;
let mockFail = false;
const mockTransaction = {
  execAsync: jest.fn(async () => {
    mockVersion = 1;
  }),
  runAsync: jest.fn(async (_sql: string, value: string) => {
    if (mockFail) throw new Error("Disk full");
    mockPayload = value;
  }),
};
jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(async () => {}),
    getFirstAsync: jest.fn(async (sql: string) =>
      sql.includes("user_version")
        ? { user_version: mockVersion }
        : mockPayload
          ? { payload: mockPayload }
          : null,
    ),
    withExclusiveTransactionAsync: jest.fn(
      async (fn: (tx: typeof mockTransaction) => Promise<void>) => {
        const oldPayload = mockPayload,
          oldVersion = mockVersion;
        try {
          await fn(mockTransaction);
        } catch (e) {
          mockPayload = oldPayload;
          mockVersion = oldVersion;
          throw e;
        }
      },
    ),
  })),
}));
import { load, save } from "../src/db/save";
beforeEach(() => {
  mockPayload = null;
  mockVersion = 0;
  mockFail = false;
});
test("first load migrates schema and saves starting wallet", async () => {
  const g = await load();
  expect(mockVersion).toBe(1);
  expect(JSON.parse(mockPayload!)).toEqual(g);
  expect(g.cash).toBe(100000);
});
test("restart loads committed snapshot", async () => {
  await load();
  const g = { ...initialGame(1000), cash: 20000, levels: [1, 0, 0, 0, 0] };
  await save(g);
  expect(await load()).toEqual(g);
});
test("failed write preserves previous snapshot", async () => {
  const g = await load();
  mockFail = true;
  await expect(save({ ...g, cash: 0 })).rejects.toThrow("Disk full");
  expect(JSON.parse(mockPayload!)).toEqual(g);
});
test("corrupt save is preserved and reported", async () => {
  mockPayload = "broken";
  await expect(load()).rejects.toThrow();
  expect(mockPayload).toBe("broken");
});
test("future schema mockVersion is not overwritten", async () => {
  mockVersion = 99;
  await expect(load()).rejects.toThrow("newer app");
  expect(mockVersion).toBe(99);
});
