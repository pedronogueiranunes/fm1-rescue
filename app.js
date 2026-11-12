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
  status.className = state.error || localError ? "error" : state.busy ? "busy" : state.protect && phase !== "danger" ? "protect" : "";
  if (state.busy && state.protect) status.classList.add("protect");
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

const LINKS = {
  author: "https://pedronogueira.dev/",
  board: "https://www.seeedstudio.com/Seeed-Studio-XIAO-RP2040-Pre-Soldered-p-6333.html",
  parts: "https://github.com/Quixotic7/MvaveFM1Unbricker/blob/main/TRANSPORTER-GUIDE.md#parts",
  video: "https://www.youtube.com/watch?v=-zk3BxrubBM",
  illustrated: "https://quixotic7.github.io/MvaveFM1Unbricker/",
  dummies: "https://github.com/GoodPerson42/FM1-Unbricking-For-Dummies",
  rescuebox: "https://thefirmwarehub.com/tools/rescue/",
  official: "https://www.m-vave.com/download",
  backups: "https://github.com/Quixotic7/FM1Backups",
  upstream: "https://github.com/Quixotic7/MvaveFM1Unbricker",
  help: "https://github.com/Quixotic7/MvaveFM1Unbricker/issues",
  transporter: "https://github.com/kurogedelic/FM-1-transporter#hardware"
};
function renderGuide(root) {
  const en = lang === "en";
  const x = (english, portuguese) => en ? english : portuguese;
  const link = (parent, key, label) => {
    const a = add(parent, "a", label);
    a.href = LINKS[key];
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  };
  const section = (title, intro) => {
    add(root, "h2", title);
    if (intro) add(root, "p", intro);
  };
  const terms = (parent, list) => {
    const row = add(parent, "span", "", "terms");
    add(row, "em", x("Search for:", "Pesquise:"));
    for (const term of list) add(row, "code", term);
  };
  const items = (list, className = "guide-list") => {
    const ul = add(root, "ul", "", className);
    for (const [title, detail, searchTerms] of list) {
      const li = add(ul, "li");
      add(li, "strong", title);
      add(li, "span", detail);
      if (searchTerms) terms(li, searchTerms);
    }
    return ul;
  };

  add(root, "h1", x("Don’t panic. Many “dead” FM-1s can be brought back.", "Calma. Muitos FM-1 “mortos” podem ser recuperados."));
  add(root, "p", x(
    "A failed update usually breaks the software inside the FM-1, not the hardware. This guide shows what to check, what to buy and what to do, in order. Nothing is written to your FM-1 until a verified backup is saved and you type WRITE.",
    "Uma atualização que falha normalmente estraga o software do FM-1, não o equipamento. Este guia mostra o que conferir, o que comprar e o que fazer, em ordem. Nada é gravado no FM-1 antes de existir um backup verificado e de você digitar WRITE."));

  section(x("1. Do you need this at all?", "1. Você precisa mesmo disso?"));
  const fork = add(root, "ul", "", "guide-list");
  let li = add(fork, "li");
  add(li, "strong", x("The FM-1 shows up on your computer in any way", "O FM-1 aparece no computador de alguma forma"));
  add(li, "span", x(
    "As a USB drive, a MIDI device or something called WL82 UBOOT. You may not need any hardware. Try these free routes first:",
    "Como disco USB, dispositivo MIDI ou algo chamado WL82 UBOOT. Talvez você não precise de nenhum hardware. Tente primeiro estes caminhos gratuitos:"));
  let row = add(li, "span", "", "inline-links");
  link(row, "rescuebox", x("Rescue box (The Firmware Hub)", "Rescue box (The Firmware Hub)"));
  link(row, "illustrated", x("Illustrated guide with a “find my fix” wizard", "Guia ilustrado com assistente “encontre sua solução”"));
  li = add(fork, "li");
  add(li, "strong", x("Black screen and nothing on USB, on any cable or computer", "Tela preta e nada no USB, em qualquer cabo ou computador"));
  add(li, "span", x(
    "This is the case this app was made for. Keep reading: you need a small board and a cable, about three wires in total.",
    "Este é o caso para o qual o app foi feito. Continue: você precisa de uma placa pequena e de um cabo, com três fios no total."));

  section(x("2. Watch it done first", "2. Veja o processo feito antes"));
  row = add(root, "p", "", "inline-links");
  link(row, "video", x("Video by the creator of the recovery script: MVave FM-1 unbricking with an RP2040 and the FM-1 Transporter", "Vídeo do criador do script de recuperação: recuperando um FM-1 com um RP2040 e o FM-1 Transporter"));
  row = add(root, "p", "", "inline-links");
  link(row, "dummies", x("Step-by-step community guide with photos (RP2040-Zero, Windows)", "Guia da comunidade com fotos, passo a passo (RP2040-Zero, Windows)"));

  section(x("3. What to buy", "3. O que comprar"), x(
    "Copy the search terms into any online store. Prices vary by country, and marketplace listings change, so always check the checklist under each item.",
    "Copie os termos de pesquisa em qualquer loja online. Preços variam por país e os anúncios mudam, então confira a lista de verificação de cada item."));
  items([
    [x("A: Microcontroller board with an RP2040 chip", "A: Placa com chip RP2040"),
     x("Best choice: Seeed Studio XIAO RP2040 with headers already soldered. The original author used it. Also confirmed by a community guide: RP2040-Zero. Wire GP0 or label 0 to D+ and GP1 or label 1 to D−.",
       "Melhor escolha: Seeed Studio XIAO RP2040 com pinos já soldados, usada pelo autor original. Também confirmada por um guia da comunidade: RP2040-Zero. Ligue GP0 ou rótulo 0 ao D+ e GP1 ou rótulo 1 ao D−."),
     ["Seeed Studio XIAO RP2040 pre-soldered", "XIAO RP2040 headers", "RP2040-Zero with pins", "Waveshare RP2040-Zero"]],
    [x("B: Cable that plugs into the FM-1’s USB-C port", "B: Cabo que encaixa na porta USB-C do FM-1"),
     x("It must be a USB-C male plug with 4 separate wires: red (VBUS), white (D−), green (D+) and black (GND). With a multimeter on continuity you can confirm which wire is which before connecting. Alternative: cut a spare USB-A to USB-C data cable and identify the same four colors. Avoid USB-C to USB-C cables.",
       "Precisa ser um plugue USB-C macho com 4 fios separados: vermelho (VBUS), branco (D−), verde (D+) e preto (GND). Com um multímetro em continuidade você confirma qual fio é qual antes de ligar. Alternativa: cortar um cabo de dados USB-A para USB-C que você não use e identificar as mesmas quatro cores. Evite cabos USB-C para USB-C."),
     ["USB-C male to 4 pin Dupont female cable", "USB type C male pigtail 4 wire", "USB-C male plug breakout cable 4 pin"]],
    [x("C: Cable from the board to your computer", "C: Cabo da placa até o computador"),
     x("A real USB data cable, not a charge-only one. Many cheap cables only charge.", "Um cabo USB de dados de verdade, não só de carga. Muitos cabos baratos só carregam."),
     ["USB-C data cable", "USB-A to USB-C data cable 480Mbps"]],
    [x("D: Small extras", "D: Pequenos extras"),
     x("Insulating tape for the unused red wire. Female Dupont jumper wires if your cable ends are bare or your board has pins. A multimeter is optional but helpful.",
       "Fita isolante para o fio vermelho que fica solto. Fios jumper Dupont fêmea se as pontas do seu cabo forem soltas ou a placa tiver pinos. Um multímetro é opcional, mas ajuda."),
     ["electrical insulating tape", "female to female dupont jumper wires", "multimeter continuity"]]
  ]);
  const warn = add(root, "p", x(
    "Do not buy RP2350 boards (Pico 2, XIAO RP2350). The original project reports that they break the Transporter. A plain Raspberry Pi Pico (RP2040) has not been confirmed with the file this app uses. The Debug Probe works too, but needs a different Transporter file that this app does not accept.",
    "Não compre placas RP2350 (Pico 2, XIAO RP2350). O projeto original informa que elas não funcionam com o Transporter. O Raspberry Pi Pico comum (RP2040) não foi confirmado com o arquivo que este app usa. O Debug Probe também funciona, mas precisa de outro arquivo do Transporter que este app não aceita."), "notice");
  link(add(warn, "span", " "), "transporter", x("Supported boards", "Placas compatíveis"));

  section(x("4. Files you need", "4. Arquivos necessários"));
  items([
    [x("Official V15 firmware", "Firmware V15 oficial"),
     x("Included in the standalone app, and the app still checks its hash. Otherwise use the verified copy below. M-VAVE’s own page may now offer only V16, which this recovery cannot write.",
       "Incluído no app standalone, e o app ainda confere o hash. Caso contrário, use a cópia verificada abaixo. A página da M-VAVE pode oferecer só o V16, que esta recuperação não consegue gravar.")],
    [x("Transporter file for the board (.uf2)", "Arquivo do Transporter para a placa (.uf2)"),
     x("Made by the original tool’s setup command. It downloads the loader and checks every hash. Step 1 of this app asks for it.",
       "Gerado pelo comando setup da ferramenta original. Ele baixa o loader e confere todos os hashes. A etapa 1 deste app pede esse arquivo.")]
  ]);
  row = add(root, "p", "", "inline-links");
  link(row, "official", x("Official M-VAVE download page", "Página oficial de download da M-VAVE"));
  link(row, "backups", x("Verified V15 copy (FM1Backups)", "Cópia verificada do V15 (FM1Backups)"));
  link(row, "upstream", x("Original recovery tool (setup)", "Ferramenta de recuperação original (setup)"));

  section(x("5. Before you connect anything", "5. Antes de conectar qualquer coisa"));
  items([
    [x("Charge the FM-1 fully", "Carregue o FM-1 por completo"), x("It runs on its own battery during recovery.", "Ele funciona com a própria bateria durante a recuperação.")],
    [x("Never connect VBUS (red)", "Nunca conecte o VBUS (vermelho)"), x("Tape it off. Only three wires are used: D+, D− and GND.", "Isole com fita. Só três fios são usados: D+, D− e GND.")],
    [x("Swapped D+ and D− is harmless", "Trocar D+ e D− não estraga nada"), x("The FM-1 is just not detected. Swap them and retry.", "O FM-1 só não é detectado. Inverta e tente de novo.")],
    [x("Take your time", "Sem pressa"), x("Nothing here is urgent. Retrying is safe until the write step.", "Nada aqui é urgente. Tentar de novo é seguro até a etapa de gravação.")]
  ]);

  section(x("6. The steps in this app", "6. As etapas neste app"));
  const sequence = add(root, "ol", "", "guide-list");
  const actions = x([
    "Prepare the XIAO in step 1. Keep the FM-1 off while wiring D6 → D+, D7 → D− and GND → GND. Leave VBUS insulated and disconnected. Follow pin labels because cable colors vary.",
    "Reconnect the XIAO. Turn on the FM-1 only when the assistant asks, after the console reader is running.",
    "Create the double-read backup, choose verified V15, review the write and type WRITE. Keep everything connected through verification.",
    "When recovery is verified, switch off the FM-1, remove the three wires and switch it on again. Install any later firmware through its regular installer with a full battery."
  ], [
    "Prepare a XIAO na etapa 1. Com o FM-1 desligado, ligue D6 → D+, D7 → D− e GND → GND. Deixe o VBUS isolado e desconectado. Siga os nomes dos pinos, pois as cores variam.",
    "Reconecte a XIAO. Ligue o FM-1 só quando o assistente pedir, depois de iniciar a leitura do console.",
    "Crie o backup de duas leituras, escolha o V15 verificado, confira o plano e digite WRITE. Mantenha tudo conectado até o fim da verificação.",
    "Após a recuperação ser verificada, desligue o FM-1, retire os três fios e ligue-o novamente. Instale outros firmwares pelo instalador normal com a bateria cheia."
  ]);
  for (const action of actions) add(sequence, "li", action);

  section(x("Stuck? You are not the first.", "Travou? Você não é o primeiro."));
  row = add(root, "p", "", "inline-links");
  link(row, "help", x("Ask on the original project’s issue page", "Pergunte na página de issues do projeto original"));
  link(row, "illustrated", x("Illustrated guide", "Guia ilustrado"));
  link(row, "video", x("Video", "Vídeo"));
  add(root, "p", x(
    "The double-click launcher starts a simulation so you can rehearse safely. Real recovery uses FM1-Rescue.command --live. Real-hardware validation of this interface is still pending.",
    "O launcher de duplo clique inicia uma simulação para você ensaiar com segurança. A recuperação real usa FM1-Rescue.command --live. A validação desta interface com equipamento real ainda está pendente."), "notice");
  button(add(root, "div", "", "actions"), t.resume, () => { view = ""; render(true); }, true);
}

document.addEventListener("click", async event => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const destinations = Object.fromEntries(Object.entries(LINKS).map(([key, url]) => [url, key]));
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
