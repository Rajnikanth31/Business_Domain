const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const packageName = "com.nextgen.businessempire";
const output = "builds/native-smoke";
fs.mkdirSync(output, { recursive: true });
const adb = (...args) =>
  execFileSync("adb", args, { encoding: "utf8", timeout: 30000 });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function nodes(xml) {
  return [...xml.matchAll(/<node\s+([^>]+)>/g)].map((match) => {
    const a = {};
    for (const pair of match[1].matchAll(/([\w-]+)="([^"]*)"/g))
      a[pair[1]] = pair[2]
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    return a;
  });
}
function dump() {
  adb(
    "shell",
    "uiautomator",
    "dump",
    "--compressed",
    "/sdcard/nextgen-window.xml",
  );
  return adb("shell", "cat", "/sdcard/nextgen-window.xml");
}
async function waitNode(predicate, label, timeout = 90000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try {
      const xml = dump();
      fs.writeFileSync(path.join(output, "last-ui.xml"), xml);
      const node = nodes(xml).find(predicate);
      if (node) return node;
    } catch {}
    await sleep(800);
  }
  throw new Error(`UI check timed out: ${label}`);
}
function tap(node) {
  const b = (node.bounds ?? "").match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  assert(b, "UI element needs visible bounds");
  adb(
    "shell",
    "input",
    "tap",
    String(Math.floor((+b[1] + +b[3]) / 2)),
    String(Math.floor((+b[2] + +b[4]) / 2)),
  );
}
const hasText = (text) => (n) => n.text === text || n["content-desc"] === text;
async function click(text) {
  tap(await waitNode(hasText(text), text));
}
function screenshot(name) {
  fs.writeFileSync(
    path.join(output, `${name}.png`),
    execFileSync("adb", ["exec-out", "screencap", "-p"], {
      timeout: 30000,
      maxBuffer: 20 * 1024 * 1024,
    }),
  );
}
function launch() {
  adb("shell", "am", "start", "-W", "-n", `${packageName}/.MainActivity`);
}
async function main() {
  const apk = process.argv[2];
  assert(apk && fs.existsSync(apk), "Provide the built APK path.");
  adb("install", "-r", apk);
  adb("shell", "pm", "clear", packageName);
  adb("logcat", "-c");
  launch();
  let target = await waitNode(
    hasText("Tap to earn $2.50"),
    "new-player earnings",
  );
  await waitNode(hasText("$0.00"), "zero starting balance");
  screenshot("01-earnings-new-player");
  tap(target);
  await waitNode(hasText("$2.50"), "first committed tap");
  for (let i = 0; i < 10; i++) tap(target);
  await waitNode(hasText("$27.50"), "all eleven taps credited");
  screenshot("02-earnings-taps");
  adb("shell", "am", "force-stop", packageName);
  await sleep(3000);
  launch();
  await waitNode(hasText("$27.50"), "SQLite balance after process restart");
  tap(
    await waitNode(
      (n) =>
        n.text === "Business" ||
        (n["content-desc"] ?? "").startsWith("Business,"),
      "Business navigation",
    ),
  );
  await click("Start a business");
  await waitNode(hasText("Choose a new business category"), "business catalog");
  screenshot("03-business-catalog");
  await click("Choose Shop");
  await waitNode(hasText("Open for $4,899.00"), "shop purchase screen");
  screenshot("04-company-opening");
  adb("shell", "input", "keyevent", "4");
  await sleep(500);
  adb("shell", "input", "keyevent", "4");
  tap(
    await waitNode(
      (n) =>
        n.text === "Investing" ||
        (n["content-desc"] ?? "").startsWith("Investing,"),
      "Investing navigation",
    ),
  );
  await click("Real Estate");
  await waitNode(hasText("Real estate market"), "real estate investing");
  screenshot("05-real-estate");
  tap(
    await waitNode(
      (n) =>
        n.text === "Profile" ||
        (n["content-desc"] ?? "").startsWith("Profile,"),
      "Profile navigation",
    ),
  );
  await waitNode(hasText("Entrepreneur"), "player profile");
  screenshot("06-profile");
  const logs = adb("logcat", "-d");
  fs.writeFileSync(path.join(output, "logcat.txt"), logs);
  assert(
    !logs.includes("FATAL EXCEPTION: mqt_native_modules"),
    "No fatal React Native exception",
  );
  fs.writeFileSync(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        passed: true,
        checks: [
          "APK launch",
          "new-player cash and click value",
          "eleven credited taps",
          "SQLite persistence after force-stop",
          "company category and opening screen",
          "property investing navigation",
          "player profile",
        ],
        balance: "$27.50",
      },
      null,
      2,
    ),
  );
  console.log("Android player smoke checks passed.");
}
main().catch((error) => {
  try {
    screenshot("failure");
    fs.writeFileSync(path.join(output, "logcat.txt"), adb("logcat", "-d"));
  } catch {}
  console.error(error.message);
  process.exitCode = 1;
});
