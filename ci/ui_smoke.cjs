"use strict";
const fs = require("node:fs");
const path = require("node:path");
const [url, profile, output] = process.argv.slice(2);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(read) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const value = await read();
    if (value) return value;
    await pause(100);
  }
  throw new Error("Timed out waiting for UI state");
}
async function main() {
  const port = await until(() => {
    try { return fs.readFileSync(path.join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]; }
    catch { return null; }
  });
  const tabs = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json();
  const tab = tabs.find(item => item.type === "page");
  if (!tab) throw new Error("Bundled browser did not create a page");
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, message => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result));
    socket.send(JSON.stringify({id, method, params}));
  });
  const evaluate = async expression => {
    const response = await send("Runtime.evaluate", {expression, returnByValue: true});
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  };
  const heading = text => until(() => evaluate("document.querySelector('h1')?.textContent === " + JSON.stringify(text)));
  const primary = async () => {
    await until(() => evaluate("Boolean(document.querySelector('#screen button.primary:not(:disabled)'))"));
    await evaluate("document.querySelector('#screen button.primary').click()");
  };
  const capture = async name => {
    const screenshot = await send("Page.captureScreenshot", {captureBeyondViewport: false});
    fs.writeFileSync(path.join(output, name + ".png"), Buffer.from(screenshot.data, "base64"));
  };
  const upload = async file => {
    const document = await send("DOM.getDocument");
    const input = await send("DOM.querySelector", {nodeId: document.root.nodeId, selector: '#screen input[type=file][accept=".fwsc"]'});
    await send("DOM.setFileInputFiles", {nodeId: input.nodeId, files: [file]});
  };
  await send("Emulation.setDeviceMetricsOverride", {width: 1240, height: 940, deviceScaleFactor: 1, mobile: false});
  await send("Page.navigate", {url});
  await heading("Prepare the XIAO");
  await send("Runtime.evaluate", {expression: "document.fonts.ready", awaitPromise: true});
  if (!await evaluate("document.fonts.check('14px Silkscreen')")) throw new Error("Local CTA font missing");
  if (!await evaluate("document.querySelector('#mode').textContent.includes('Simulation')")) throw new Error("Expected simulation");
  await capture("01-start");
  await primary();
  await heading("Connect the three wires");
  if (!await evaluate("document.querySelector('#screen img').complete")) await pause(400);
  await primary();
  await heading("Turn on the FM-1 now");
  await primary();
  await heading("Back up your FM-1");
  await primary();
  await heading("Choose V15 firmware");
  await upload(process.env.FM1_TEST_V16);
  await until(() => evaluate("document.querySelector('#status').textContent.includes('V16')"));
  await capture("02-v16-refused");
  await upload(process.env.FM1_TEST_V15);
  await heading("Review before writing");
  await capture("03-plan");
  await primary();
  await heading("Write V15");
  if (!await evaluate("document.querySelector('#screen button.primary').disabled")) throw new Error("WRITE gate unlocked early");
  await evaluate("(() => { const input = document.querySelector('#screen input[type=text]'); input.value='write'; input.dispatchEvent(new Event('input')); })()");
  if (!await evaluate("document.querySelector('#screen button.primary').disabled")) throw new Error("Lowercase write accepted");
  await evaluate("(() => { const input = document.querySelector('#screen input[type=text]'); input.value='WRITE'; input.dispatchEvent(new Event('input')); })()");
  await primary();
  await heading("Recovery verified");
  await capture("04-verified");
  await evaluate("document.querySelector('#backup-nav').click()");
  await heading("Backups");
  if (!await evaluate("document.querySelectorAll('#screen h2').length >= 1")) throw new Error("Backup missing");
  await evaluate("document.querySelector('#backup-nav').click()");
  await heading("Recovery verified");
  await evaluate("document.querySelector('#close').click()");
  await until(() => evaluate("document.querySelector('#status').textContent.includes('Assistant closed')")).catch(() => {});
  socket.close();
  console.log("PASS: standalone GUI, backup, V16 refusal, WRITE confirmation, final verification, close.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
