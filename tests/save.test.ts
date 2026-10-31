import { initialGame } from "../src/engine/game";
import { migrate } from "../src/engine/empire";
let mockPayload: string | null = null,
  mockBackup: string | null = null,
  mockUserBackup: string | null = null,
  mockRecovery: string | null = null,
  mockVersion = 0,
  mockFail = false;
const mockTransaction = {
  execAsync: jest.fn(async (sql: string) => {
    if (sql.includes("user_version = 2")) mockVersion = 2;
  }),
  runAsync: jest.fn(async (sql: string, value: string) => {
    if (mockFail) throw new Error("Disk full");
    if (sql.includes("game_user_backup")) mockUserBackup = value;
    else if (sql.includes("game_recovery")) mockRecovery = value;
    else if (sql.includes("game_backup")) mockBackup ??= value;
    else mockPayload = value;
  }),
};
jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(async () => {}),
    getFirstAsync: jest.fn(async (sql: string) => {
      if (sql.includes("user_version")) return { user_version: mockVersion };
      const value = sql.includes("game_user_backup")
        ? mockUserBackup
        : sql.includes("game_backup")
          ? mockBackup
          : sql.includes("game_recovery")
            ? mockRecovery
            : mockPayload;
      return value ? { payload: value } : null;
    }),
    withExclusiveTransactionAsync: jest.fn(
      async (fn: (tx: typeof mockTransaction) => Promise<void>) => {
        const oldPayload = mockPayload,
          oldVersion = mockVersion,
          oldBackup = mockBackup,
          oldUser = mockUserBackup,
          oldRecovery = mockRecovery;
        try {
          await fn(mockTransaction);
        } catch (e) {
          mockPayload = oldPayload;
          mockVersion = oldVersion;
          mockBackup = oldBackup;
          mockUserBackup = oldUser;
          mockRecovery = oldRecovery;
          throw e;
        }
      },
    ),
  })),
}));
import { load, save, writeBackup, restoreBackup } from "../src/db/save";
beforeEach(() => {
  mockPayload = null;
  mockBackup = null;
  mockUserBackup = null;
  mockRecovery = null;
  mockVersion = 0;
  mockFail = false;
});
test("first load creates version-2 player and commits schema", async () => {
  const g = await load();
  expect(mockVersion).toBe(2);
  expect(JSON.parse(mockPayload!)).toEqual(g);
  expect(g.version).toBe(2);
  expect(g.cash).toBe(0);
});
test("legacy restart migrates holdings and keeps the original snapshot backup", async () => {
  const old = { ...initialGame(1000), cash: 20000, levels: [1, 0, 0, 0, 0] };
  mockPayload = JSON.stringify(old);
  mockVersion = 1;
  expect(await load()).toEqual(migrate(old));
  expect(JSON.parse(mockBackup!)).toEqual(old);
  expect(mockVersion).toBe(2);
});
test("version-2 restart loads committed snapshot unchanged", async () => {
  const g = await load();
  await save({ ...g, cash: 43210 });
  expect((await load()).cash).toBe(43210);
});
test("failed write preserves previous snapshot", async () => {
  const g = await load();
  mockFail = true;
  await expect(save({ ...g, cash: 999 })).rejects.toThrow("Disk full");
  expect(JSON.parse(mockPayload!)).toEqual(g);
});
test("failed migration preserves original data and schema", async () => {
  const old = initialGame(0);
  mockPayload = JSON.stringify(old);
  mockVersion = 1;
  mockFail = true;
  await expect(load()).rejects.toThrow("Disk full");
  expect(JSON.parse(mockPayload!)).toEqual(old);
  expect(mockVersion).toBe(1);
});
test("corrupt save is preserved and reported", async () => {
  mockPayload = "broken";
  await expect(load()).rejects.toThrow();
  expect(mockPayload).toBe("broken");
});
test("future schema is not overwritten", async () => {
  mockVersion = 99;
  await expect(load()).rejects.toThrow("newer app");
  expect(mockVersion).toBe(99);
});

test("manual backup restores a broken snapshot and retains recovery data", async () => {
  const g = await load();
  await writeBackup({ ...g, cash: 12345 });
  mockPayload = "broken";
  await expect(load()).rejects.toThrow();
  const restored = await restoreBackup();
  expect(restored.cash).toBe(12345);
  expect(mockRecovery).toBe("broken");
  expect(JSON.parse(mockPayload!)).toEqual(restored);
});
test("restore refuses incompatible future schema", async () => {
  await load();
  mockVersion = 99;
  await expect(restoreBackup()).rejects.toThrow("newer");
});
test("missing backup returns a useful error without changing data", async () => {
  const g = await load();
  await expect(restoreBackup()).rejects.toThrow("No usable backup");
  expect(JSON.parse(mockPayload!)).toEqual(g);
});
