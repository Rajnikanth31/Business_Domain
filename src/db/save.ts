import * as SQLite from "expo-sqlite";
import { Game, initialGame, validate } from "../engine/game";
let database: SQLite.SQLiteDatabase;
export async function load(): Promise<Game> {
  database = await SQLite.openDatabaseAsync("nextgen.db");
  await database.execAsync("PRAGMA journal_mode = WAL;");
  const version = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if ((version?.user_version ?? 0) > 1)
    throw new Error("This save requires a newer app version.");
  await database.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(
      "CREATE TABLE IF NOT EXISTS game_save (id INTEGER PRIMARY KEY CHECK (id=1), payload TEXT NOT NULL); PRAGMA user_version = 1;",
    );
  });
  const row = await database.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM game_save WHERE id=1",
  );
  if (row) return validate(JSON.parse(row.payload));
  const game = initialGame(Date.now());
  await save(game);
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
