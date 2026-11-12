"use strict";
const copy = {
  pt: {
    steps: ["Preparar", "Conectar", "Backup", "Conferir", "Gravar", "Finalizar"],
    simulated: "Modo simulado · Nenhum equipamento necessário", live: "Modo com equipamento",
    board: ["Prepare a placa XIAO", "Conecte só a XIAO ao computador com um cabo USB de dados. Deixe o FM-1 desligado e com a bateria cheia.", "Preparar a XIAO"],
    wire: ["Conecte os três fios", "Com o FM-1 desligado, ligue D6 a D+, D7 a D− e GND a GND. As cores do cabo variam. Siga os nomes dos pinos e deixe o VBUS solto. Depois, desconecte e reconecte a XIAO ao computador.", "Fios ligados, FM-1 desligado"],
    power: ["Ligue o FM-1 agora", "A XIAO está pronta. A tela do FM-1 pode continuar apagada durante a recuperação.", "FM-1 ligado, verificar"],
    backup: ["Salve uma cópia do FM-1", "O assistente lê toda a memória duas vezes e só salva a cópia quando as leituras coincidem.", "Criar backup"],
    firmware: ["Escolha o firmware V15", "O backup está salvo. Escolha o V15 oficial para conferir o que precisa ser gravado.", "Usar o V15 do FM1Backups"],
    review: ["Confira antes de gravar", "Durante a gravação e a verificação, mantenha tudo ligado e conectado.", "Avançar para gravar"],
    write: ["Grave o V15", "Mantenha o FM-1 ligado e os cabos conectados até o fim da verificação.", "Gravar e verificar"],
    done: ["Recuperação verificada", "Desligue o FM-1, retire os três fios e ligue-o de novo. Para instalar outro firmware, use o instalador normal com a bateria cheia, o computador acordado e o cabo firme até terminar."],
    danger: ["Mantenha o FM-1 ligado", "A gravação ou a verificação falhou. Mantenha todos os fios conectados. É seguro tentar de novo com uma nova leitura dupla e gravar os setores que ainda diferem.", "Criar novo backup"],
    errors: {
      board: "A XIAO não ficou pronta. Confira o cabo de dados e deixe só uma XIAO conectada. Se necessário, segure BOOT ao conectar. É seguro tentar de novo.",
      uf2: "O arquivo da XIAO falhou na conferência. Use o arquivo gerado na preparação original. É seguro tentar com a cópia íntegra.",
      transporter: "O assistente não encontrou a XIAO pronta. Deixe o FM-1 desligado, reconecte a XIAO e tente de novo.",
      uboot: "O FM-1 não respondeu no modo de recuperação. Desligue-o, confira D+ e D−, reconecte a XIAO e use Preparar para religar. É seguro tentar de novo.",
      reads: "As duas leituras foram diferentes. Confira se os três fios estão firmes e tente o backup de novo. É seguro repetir a leitura.",
      changed: "A memória mudou desde o backup. Crie um novo backup antes de tentar gravar. É seguro repetir a leitura.",
      backup: "O backup desta sessão está ausente ou mudou. É seguro criar uma nova cópia com duas leituras.",
      verify: "A gravação ou a verificação falhou. Mantenha tudo ligado e conectado enquanto tenta de novo com um novo backup.",
      v16: "O V16 ocupa mais espaço do que a XIAO consegue gravar nesta recuperação. Use o V15 oficial e instale o V16 depois pelo instalador normal.",
      v15: "O arquivo não corresponde ao V15 oficial. Escolha a cópia do FM1Backups ou outro arquivo V15 íntegro.",
      awake: "O computador não conseguiu manter-se acordado. Tente novamente antes de iniciar a gravação.",
      unknown: "O assistente interrompeu esta etapa. Veja os detalhes técnicos antes de tentar de novo."
    },
    rewire: "Preparar para religar", picker: "Solte o arquivo V15 aqui ou escolha um arquivo",
    package: "Pacote", sectors: "Setores", range: "Faixa", ref: "Arquivo de backup", hash: "SHA-256",
    zero: "O V15 já está na memória. Avance para as instruções finais.",
    finish: "Ver instruções finais", confirm: "Digite WRITE para autorizar a gravação",
    details: "Detalhes técnicos", close: "Encerrar assistente", backups: "Backups",
    resume: "Voltar à recuperação", folder: "Abrir pasta da sessão",
    oldFolder: "Abrir pasta dos backups anteriores", empty: "Nenhum backup salvo.",
    working: "Aguarde, etapa em andamento.", protect: "Mantenha tudo ligado e conectado. Aguarde a verificação.",
    offline: "A conexão com o assistente foi interrompida.", closed: "Assistente encerrado. Você já pode fechar esta aba.",
    detected: {rp2: "XIAO detectada no modo RPI-RP2.", transporter: "Transporter detectado.", simulated: "XIAO simulada pronta para preparar."},
    boot: "FM-1 detectado no computador.", bootDemo: "Reinício do FM-1 simulado.",
    diagram: "Diagrama da XIAO. D6 para D+, D7 para D−, GND para GND. VBUS fica solto."
  },
  en: {
    steps: ["Prepare", "Connect", "Back up", "Review", "Write", "Finish"],
    simulated: "Simulation · No hardware needed", live: "Hardware mode",
    board: ["Prepare the XIAO", "Connect only the XIAO to the computer with a USB data cable. Leave the FM-1 off and fully charged.", "Prepare the XIAO"],
    wire: ["Connect the three wires", "With the FM-1 off, connect D6 to D+, D7 to D−, and GND to GND. Cable colors vary. Follow the pin labels and leave VBUS disconnected. Then unplug the XIAO from the computer and plug it back in.", "Wires connected, FM-1 off"],
    power: ["Turn on the FM-1 now", "The XIAO is ready. The FM-1 screen may stay dark during recovery.", "FM-1 is on, check connection"],
    backup: ["Back up your FM-1", "The assistant reads the entire memory twice and saves a copy when both reads match.", "Create backup"],
    firmware: ["Choose V15 firmware", "Your backup is saved. Choose the official V15 to see what needs to be written.", "Use V15 from FM1Backups"],
    review: ["Review before writing", "Keep the FM-1 powered on and all cables connected while writing and verification are in progress.", "Continue to writing"],
    write: ["Write V15", "Keep the FM-1 on and all cables connected until verification finishes.", "Write and verify"],
    done: ["Recovery verified", "Turn off the FM-1, remove the three wires, then turn it back on. To install other firmware, use its regular installer with a full battery, keep the computer awake, and leave the cable connected until it finishes."],
    danger: ["Keep the FM-1 on", "Writing or verification failed. Leave all wires connected. You can safely retry with a fresh double-read backup and write the sectors that still differ.", "Create a new backup"],
    errors: {
      board: "The XIAO did not become ready. Check the data cable and connect just one XIAO. If needed, hold BOOT while plugging it in. You can safely retry.",
      uf2: "The XIAO file failed verification. Use the file generated during setup. You can safely retry with an intact copy.",
      transporter: "The assistant could not find a ready XIAO. Keep the FM-1 off, reconnect the XIAO, and try again.",
      uboot: "The FM-1 did not respond in recovery mode. Turn it off, check D+ and D−, reconnect the XIAO, and select Prepare to power on again. You can safely retry.",
      reads: "The two reads differed. Check that all three wires are secure and try the backup again. It is safe to repeat the read.",
      changed: "Memory changed since the backup. Create a fresh backup before writing. It is safe to repeat the read.",
      backup: "This session’s backup is missing or has changed. You can safely create a fresh double-read backup.",
      verify: "Writing or verification failed. Keep everything powered and connected while you retry with a fresh backup.",
      v16: "V16 needs more space than the XIAO can write during recovery. Use official V15 and install V16 afterward with the regular installer.",
      v15: "The file does not match official V15. Choose the copy from FM1Backups or another intact V15 file.",
      awake: "The computer could not stay awake. Try again before starting the write.",
      unknown: "The assistant stopped this step. Review the technical details before retrying."
    },
    rewire: "Prepare to power on again", picker: "Drop the V15 file here or choose a file",
    package: "Package", sectors: "Sectors", range: "Range", ref: "Backup file", hash: "SHA-256",
    zero: "V15 is already in memory. Continue to the final instructions.",
    finish: "View final instructions", confirm: "Type WRITE to authorize writing",
    details: "Technical details", close: "Close assistant", backups: "Backups",
    resume: "Return to recovery", folder: "Open session folder",
    oldFolder: "Open earlier backups", empty: "No saved backups.",
    working: "Please wait. This step is in progress.", protect: "Keep everything on and connected until verification finishes.",
    offline: "The assistant connection was interrupted.", closed: "Assistant closed. You can now close this tab.",
    detected: {rp2: "XIAO detected in RPI-RP2 mode.", transporter: "Transporter detected.", simulated: "Simulated XIAO ready to prepare."},
    boot: "FM-1 detected on this computer.", bootDemo: "FM-1 restart simulated.",
    diagram: "XIAO wiring diagram. D6 to D+, D7 to D−, GND to GND. Leave VBUS disconnected."
  }
};

const token = location.hash.slice(1);
const get = id => document.getElementById(id);
let lang = localStorage.getItem("fm1-language") === "pt" ? "pt" : "en";
let t = copy[lang];
let state;
let view = "";
let list = [];
let signature = "";
let pending = false;
let closed = false;
let submitting = false;
let localError = "";
const step = {board: 1, wire: 2, power: 2, backup: 3, firmware: 4, review: 4, write: 5, danger: 5, done: 6};
function add(parent, tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}
function button(parent, label, click, primary = false) {
  const element = add(parent, "button", label, primary ? "primary" : "");
  element.type = "button";
  element.disabled = Boolean(state.busy || pending);
  element.onclick = click;
  return element;
}
async function request(route, method = "GET", body) {
  const response = await fetch("/api/" + route, {method, body, headers: {"X-Rescue-Token": token}});
  if (!response.ok) throw new Error(response.status);
  return response.json();
}
async function act(action, body) {
  if (pending || state.busy) return;
  pending = true;
  submitting = action === "apply";
  localError = "";
  if (submitting) get("status").textContent = t.protect;
  for (const el of document.querySelectorAll("#screen button, #screen input, #close")) el.disabled = true;
  try {
    await request(action, "POST", body);
    if (action === "close") {
      closed = true;
      get("status").textContent = t.closed;
      return;
    }
  } catch {
    localError = "unknown";
  } finally {
    pending = false;
    submitting = false;
    signature = "";
    if (!closed) await poll();
  }
}
function describe(root, entries) {
  const dl = add(root, "dl");
  for (const [label, value] of entries) {
    add(dl, "dt", label);
    add(dl, "dd", String(value));
  }
}
async function showBackups() {
  if (view === "backups") {
    view = "";
  } else {
    try {
      list = await request("backups");
      view = "backups";
    } catch {
      localError = "unknown";
    }
  }
  signature = "";
  render(true);
}
function render(focus = false) {
  const phase = view === "write" && state.phase === "review" ? "write" : state.phase;
  const key = JSON.stringify([phase, view, lang, state.busy, state.board, state.booted, state.error, localError, state.protect, state.bundled_v15, state.uf2_ready]);
  if (key === signature) return;
  signature = key;
  t = copy[lang];
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  get("mode").textContent = state.dry ? t.simulated : t.live;
  get("guide-nav").textContent = view === "guide" ? t.resume : (lang === "en" ? "What you need" : "O que você precisa");
  get("guide-nav").disabled = state.busy || state.protect;
  get("step-count").textContent = lang === "en" ? `Step ${step[phase]} of 6` : `Etapa ${step[phase]} de 6`;
  get("step-context").textContent = lang === "en" ? "Follow each step in order. Your backup is saved before you can authorize a write." : "Siga as etapas na ordem. O backup é salvo antes de você autorizar a gravação.";
  get("steps").setAttribute("aria-label", lang === "en" ? "Recovery steps" : "Etapas da recuperação");
  get("screen").setAttribute("aria-busy", state.busy ? "true" : "false");
  get("backup-nav").textContent = view === "backups" ? t.resume : t.backups;
  get("backup-nav").disabled = state.busy || state.protect;
  get("close").textContent = t.close;
  get("close").disabled = state.busy || state.protect;
  get("details").querySelector("summary").textContent = t.details;
  get("steps").replaceChildren();
  for (const [index, name] of t.steps.entries()) {
    const item = add(get("steps"), "li");
    add(item, "span", String(index + 1), "step-number");
    add(item, "span", name);
    if (index + 1 < step[phase]) item.classList.add("complete");
    if (step[phase] === index + 1) item.setAttribute("aria-current", "step");
  }
  const root = get("screen");
  root.replaceChildren();
  root.dataset.view = view || phase;
  if (view === "guide") {
    renderGuide(root);
  } else if (view === "backups") {
    add(root, "h1", t.backups);
    if (!list.length) add(root, "p", t.empty);
    for (const item of list) {
      add(root, "h2", item.name);
      const date = new Date(item.date).toLocaleString(document.documentElement.lang);
      describe(root, [[lang === "en" ? "Date" : "Data", date], ["Bytes", item.size.toLocaleString(document.documentElement.lang)], [t.hash, item.hash]]);
    }
    const actions = add(root, "div", "", "actions");
    button(actions, t.folder, () => act("folder"));
    button(actions, t.oldFolder, () => act("old-folder"));
  } else {
    const [title, description, label] = t[phase];
    add(root, "h1", title);
    add(root, "p", description);
    if (phase === "board" && state.board) add(root, "p", t.detected[state.board], "notice");
    if (phase === "board" && !state.uf2_ready) {
      const label = add(root, "label", lang === "en"
        ? "For hardware recovery, choose the prepared Transporter .uf2 from the original tool."
        : "Para recuperar o equipamento, escolha o .uf2 do Transporter preparado pela ferramenta original.", "drop");
      const input = add(label, "input");
      input.type = "file";
      input.accept = ".uf2";
      input.disabled = state.busy;
      input.onchange = () => { if (input.files.length) act("prepare-upload", input.files[0]); };
    }
    if (phase === "wire") {
      const image = add(root, "img");
      image.src = "/wiring.svg";
      image.alt = t.diagram;
    }
    if (phase === "done" && state.booted) add(root, "p", state.dry ? t.bootDemo : t.boot, "notice");
    if (phase === "firmware") {
      add(root, "p", state.backup);
      const drop = add(root, "label", t.picker, "drop");
      const file = add(drop, "input");
      file.type = "file";
      file.accept = ".fwsc";
      file.disabled = state.busy;
      file.onchange = () => { if (file.files.length) act("upload", file.files[0]); };
      drop.ondragover = event => event.preventDefault();
      drop.ondrop = event => {
        event.preventDefault();
        if (event.dataTransfer.files.length) act("upload", event.dataTransfer.files[0]);
      };
    }
    if (phase === "review" || phase === "write") {
      describe(root, [[t.package, "M-VAVE FM-1 V15 · " + (state.plan.identity || "FM-1")],
        [t.sectors, state.plan.sectors], [t.range, state.plan.range], [t.ref, state.backup], [t.hash, state.plan.hash]]);
    }
    const actions = add(root, "div", "", "actions");
    const mapped = {board: "prepare", wire: "wire", power: "power", backup: "backup", danger: "backup", firmware: "bundled"};
    if (mapped[phase] && (phase !== "firmware" || state.bundled_v15)) {
      button(actions, label, () => act(mapped[phase]), true);
    }
    if (phase === "power" && state.error) button(actions, t.rewire, () => act("rewire"));
    if (phase === "review") {
      if (state.plan.sectors) {
        button(actions, label, () => { view = "write"; render(true); }, true);
      } else {
        add(root, "p", t.zero);
        button(actions, t.finish, () => act("apply"), true);
      }
    }
    if (phase === "write") {
      const prompt = add(actions, "label", t.confirm);
      const input = add(prompt, "input");
      input.type = "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.disabled = state.busy;
      const write = button(actions, label, () => act("apply", input.value), true);
      write.disabled = true;
      input.oninput = () => { write.disabled = state.busy || input.value !== "WRITE"; };
    }
  }
  const status = get("status");
  status.className = state.error || localError ? "error" : "";
  status.textContent = state.busy ? (phase === "write" || state.protect ? t.protect : t.working)
    : t.errors[localError || state.error] || (state.protect && phase !== "danger" ? t.protect : "");
  if (focus) {
    const heading = root.querySelector("h1");
    heading.tabIndex = -1;
    heading.focus();
  }
}
async function poll() {
  if (closed) return;
  try {
    const previous = state?.phase;
    state = await request("state");
    if (previous === "review" && state.phase !== "review" && view === "write") view = "";
    render(previous && previous !== state.phase);
    const log = get("log");
    const nearBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 30;
    log.textContent = state.log.join("\n");
    if (nearBottom) log.scrollTop = log.scrollHeight;
  } catch {
    get("status").textContent = t.offline;
  }
}
get("language").value = lang;
get("language").onchange = event => {
  lang = event.target.value;
  localStorage.setItem("fm1-language", lang);
  if (state) render();
};
get("guide-nav").onclick = () => {
  if (!state || state.busy || state.protect) return;
  view = view === "guide" ? "" : "guide";
  render(true);
};
get("backup-nav").onclick = () => { if (state) showBackups(); };
get("close").onclick = () => { if (state) act("close"); };
window.addEventListener("beforeunload", event => {
  if (!closed && (submitting || state?.protect || state?.busy && state?.phase === "review")) {
    event.preventDefault();
    event.returnValue = true;
  }
});
poll();
setInterval(poll, 650);

function renderGuide(root) {
  const en = lang === "en";
  add(root, "h1", en ? "Your recovery kit" : "Seu kit de recuperação");
  add(root, "p", en
    ? "For an FM-1 that stays dark and never appears on USB. Gather these parts before connecting anything."
    : "Para um FM-1 que fica apagado e nunca aparece no USB. Separe estas peças antes de conectar tudo.");
  const shopping = add(root, "ul", "", "guide-list");
  const parts = en ? [
    ["1 × Seeed Studio XIAO RP2040, with headers fitted", "Choose the pre-soldered RP2040 version. The Transporter requires this chip. The RP2350 version is incompatible."],
    ["1 × USB-C male to 4-pin female Dupont cable", "It must expose D+, D−, GND and VBUS separately. Individual female sockets fit the XIAO header pins."],
    ["1 × USB data cable for the XIAO", "Use a USB-C connector at the board end and a connector that fits your computer."],
    ["Insulating tape", "Cover the unused VBUS wire. A multimeter is helpful for identifying the cable wires."]
  ] : [
    ["1 × Seeed Studio XIAO RP2040 com pinos soldados", "Escolha a versão RP2040 com os pinos já soldados. O Transporter exige esse chip. A versão RP2350 é incompatível."],
    ["1 × cabo USB-C macho para 4 conectores Dupont fêmea", "O cabo deve expor D+, D−, GND e VBUS separadamente. Os conectores fêmea individuais encaixam nos pinos da XIAO."],
    ["1 × cabo USB de dados para a XIAO", "Use USB-C na ponta da placa e um conector compatível com seu computador na outra ponta."],
    ["Fita isolante", "Cubra o fio VBUS que ficará solto. Um multímetro ajuda a identificar os fios do cabo."]
  ];
  for (const [title, description] of parts) {
    const li = add(shopping, "li");
    add(li, "strong", title);
    add(li, "span", description);
  }
  add(root, "h2", en ? "Before you start" : "Antes de começar");
  add(root, "p", en
    ? "Fully charge the FM-1. The standalone app includes the recovery engine. Supply the prepared Transporter UF2 and official V15 firmware yourself."
    : "Carregue completamente o FM-1. O aplicativo standalone inclui o motor de recuperação. Forneça o UF2 preparado do Transporter e o firmware V15 oficial.");
  add(root, "h2", en ? "Connect, back up, recover" : "Conectar, salvar e recuperar");
  const sequence = add(root, "ol", "", "guide-list");
  const actions = en ? [
    "Prepare the XIAO in step 1. Keep the FM-1 off while wiring D6 → D+, D7 → D− and GND → GND. Leave VBUS insulated and disconnected. Follow pin labels because cable colors vary.",
    "Reconnect the XIAO. Turn on the FM-1 only when the assistant asks, after the console reader is running.",
    "Create the double-read backup, choose verified V15, review the write and type WRITE. Keep everything connected through verification.",
    "When recovery is verified, switch off the FM-1, remove the three wires and switch it on again. Install any later firmware through its regular installer with a full battery."
  ] : [
    "Prepare a XIAO na etapa 1. Com o FM-1 desligado, ligue D6 → D+, D7 → D− e GND → GND. Deixe o VBUS isolado e desconectado. Siga os nomes dos pinos, pois as cores variam.",
    "Reconecte a XIAO. Ligue o FM-1 só quando o assistente pedir, depois de iniciar a leitura do console.",
    "Crie o backup de duas leituras, escolha o V15 verificado, confira o plano e digite WRITE. Mantenha tudo conectado até o fim da verificação.",
    "Após a recuperação ser verificada, desligue o FM-1, retire os três fios e ligue-o novamente. Instale outros firmwares pelo instalador normal com a bateria cheia."
  ];
  for (const action of actions) add(sequence, "li", action);
  add(root, "p", en
    ? "The double-click launcher starts a simulation. Real recovery uses FM1-Rescue.command --live. Real-hardware validation of this interface is still pending."
    : "O launcher de duplo clique inicia uma simulação. A recuperação real usa FM1-Rescue.command --live. A validação desta interface com equipamento real ainda está pendente.", "notice");
  const links = add(root, "div", "", "guide-links");
  for (const [label, href] of [
    [en ? "Buy the RP2040 board" : "Comprar a placa RP2040", "https://www.seeedstudio.com/Seeed-Studio-XIAO-RP2040-Pre-Soldered-p-6333.html"],
    [en ? "Parts list & cable example" : "Lista de peças e exemplo de cabo", "https://github.com/Quixotic7/MvaveFM1Unbricker/blob/main/TRANSPORTER-GUIDE.md#parts"]
  ]) {
    const link = add(links, "a", label);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  button(add(root, "div", "", "actions"), t.resume, () => { view = ""; render(true); }, true);
}

document.addEventListener("click", async event => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const destinations = {
    "https://pedronogueira.dev/": "author",
    "https://www.seeedstudio.com/Seeed-Studio-XIAO-RP2040-Pre-Soldered-p-6333.html": "board",
    "https://github.com/Quixotic7/MvaveFM1Unbricker/blob/main/TRANSPORTER-GUIDE.md#parts": "parts"
  };
  const destination = destinations[link.href];
  if (!destination) return;
  event.preventDefault();
  try {
    await request("external", "POST", destination);
  } catch {
    get("status").textContent = lang === "en"
      ? "Could not open the link in your browser. You can copy the link address."
      : "Não foi possível abrir o link no navegador. Você pode copiar o endereço.";
  }
});
