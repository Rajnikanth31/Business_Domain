import * as SQLite from "expo-sqlite";
import { Game, validate } from "../engine/game";
import { migrate, newPlayer } from "../engine/empire";
let database: SQLite.SQLiteDatabase;
export async function load(): Promise<Game> {
  database = await SQLite.openDatabaseAsync("nextgen.db");
  await database.execAsync("PRAGMA journal_mode = WAL;");
  const version = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if ((version?.user_version ?? 0) > 2)
    throw new Error("This save requires a newer app version.");
  await database.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(
      "CREATE TABLE IF NOT EXISTS game_save (id INTEGER PRIMARY KEY CHECK(id=1),payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS game_backup (id INTEGER PRIMARY KEY CHECK(id=1),payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS game_user_backup (id INTEGER PRIMARY KEY CHECK(id=1),payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS game_recovery (id INTEGER PRIMARY KEY CHECK(id=1),payload TEXT NOT NULL);",
    );
  });
  const row = await database.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM game_save WHERE id=1",
  );
  const old: Game | undefined = row ? JSON.parse(row.payload) : undefined;
  const game = old ? migrate(old) : newPlayer(Date.now());
  await database.withExclusiveTransactionAsync(async (tx) => {
    if (old?.version === 1)
      await tx.runAsync(
        "INSERT INTO game_backup(id,payload) VALUES(1,?) ON CONFLICT(id) DO NOTHING",
        row!.payload,
      );
    await tx.runAsync(
      "INSERT INTO game_save(id,payload) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
      JSON.stringify(game),
    );
    await tx.execAsync("PRAGMA user_version = 2;");
  });
  return game;
}
export async function save(game: Game) {
  validate(game);
  await database.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      "INSERT INTO game_save(id,payload) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
      JSON.stringify(game),
    );
  });
}
export async function writeBackup(game: Game) {
  validate(game);
  await database.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      "INSERT INTO game_user_backup(id,payload) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
      JSON.stringify(game),
    );
  });
}
export async function restoreBackup(): Promise<Game> {
  const version = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if ((version?.user_version ?? 0) > 2)
    throw new Error("A newer app version is required.");
  const user = await database.getFirstAsync<{ payload: string }>(
      "SELECT payload FROM game_user_backup WHERE id=1",
    ),
    original = await database.getFirstAsync<{ payload: string }>(
      "SELECT payload FROM game_backup WHERE id=1",
    );
  let game: Game | undefined;
  for (const row of [user, original]) {
    if (row)
      try {
        game = migrate(JSON.parse(row.payload));
        break;
      } catch {}
  }
  if (!game) throw new Error("No usable backup is available on this device.");
  const broken = await database.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM game_save WHERE id=1",
  );
  await database.withExclusiveTransactionAsync(async (tx) => {
    if (broken)
      await tx.runAsync(
        "INSERT INTO game_recovery(id,payload) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
        broken.payload,
      );
    await tx.runAsync(
      "INSERT INTO game_save(id,payload) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
      JSON.stringify(game),
    );
    await tx.execAsync("PRAGMA user_version = 2;");
  });
  return game;
}
