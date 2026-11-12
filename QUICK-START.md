# FM-1 Rescue · Start here

**Don't panic.** A failed update usually breaks the software inside the FM-1, not the hardware. Nothing in this app writes to your FM-1 until a verified backup is saved and you type `WRITE`.

## 1. Do you need hardware at all?

- **The FM-1 shows up on your computer in any way** (USB drive, MIDI device, "WL82 UBOOT"): you may not need anything. Try the free routes first: the [Rescue box](https://thefirmwarehub.com/tools/rescue/) or the [illustrated guide with a "find my fix" wizard](https://quixotic7.github.io/MvaveFM1Unbricker/).
- **Black screen and nothing on USB, on any cable or computer:** this app is for you. Continue below.

## 2. Watch it done first

- [Video by the creator of the recovery script: MVave FM-1 unbricking with an RP2040 and the FM-1 Transporter](https://www.youtube.com/watch?v=-zk3BxrubBM)
- [Community step-by-step guide with photos (RP2040-Zero, Windows)](https://github.com/GoodPerson42/FM1-Unbricking-For-Dummies)

## 3. What to buy

Copy the search terms into any online store and check the checklist for each item.

| Part | What to check | Search for |
| --- | --- | --- |
| **A. RP2040 board** | Best: **Seeed XIAO RP2040** with headers soldered (used by the original author). Also confirmed by a community guide: **RP2040-Zero**. Wire GP0 (label 0) to D+ and GP1 (label 1) to D−. | `Seeed Studio XIAO RP2040 pre-soldered` · `XIAO RP2040 headers` · `RP2040-Zero with pins` · `Waveshare RP2040-Zero` |
| **B. Cable into the FM-1** | USB-C **male** plug with **4 separate wires**: red VBUS, white D−, green D+, black GND. Confirm with a multimeter on continuity. Alternative: cut a spare USB-A to USB-C data cable and identify the same colors. Avoid USB-C to USB-C cables. | `USB-C male to 4 pin Dupont female cable` · `USB type C male pigtail 4 wire` · `USB-C male plug breakout cable 4 pin` |
| **C. Cable to your computer** | A real data cable, not charge-only. | `USB-C data cable` · `USB-A to USB-C data cable 480Mbps` |
| **D. Extras** | Insulating tape for the unused red wire; female Dupont jumper wires if your cable ends are bare; a multimeter (optional). | `electrical insulating tape` · `female to female dupont jumper wires` · `multimeter continuity` |

**Do not buy RP2350 boards** (Pico 2, XIAO RP2350): the original project reports that they break the Transporter. A plain Raspberry Pi Pico (RP2040) is not confirmed with the file this app uses, and the Debug Probe needs a different Transporter file that this app does not accept. See the [supported boards table](https://github.com/kurogedelic/FM-1-transporter#hardware).

## 4. Files

- **Official V15 firmware:** included in the macOS standalone app (the app still checks its SHA-256). Otherwise use the [verified copy](https://github.com/Quixotic7/FM1Backups). The [official M-VAVE download page](https://www.m-vave.com/download) may now offer only V16, which this recovery cannot write.
- **Transporter file (.uf2):** made by the `setup` command of the [original recovery tool](https://github.com/Quixotic7/MvaveFM1Unbricker). Step 1 of this app asks for it.

## 5. Before connecting anything

- Charge the FM-1 fully. It runs on its own battery.
- **Never connect VBUS (red).** Tape it off. Use only D+, D− and GND.
- Swapped D+ and D− is harmless; the FM-1 just isn't detected.
- Nothing is urgent. Retrying is safe until the write step.

## 6. The app's steps

1. Prepare the XIAO. With the FM-1 **off**, connect **D6 → D+**, **D7 → D−**, **GND → GND**.
2. Reconnect the XIAO and turn on the FM-1 **only when the assistant asks**.
3. Create the double-read backup, choose V15, review the plan and type **WRITE**. Keep everything powered and connected until verification ends.
4. Switch off the FM-1, remove the three wires, switch it on. Use the regular installer for later firmware, with a full battery.

Stuck? Ask on the [original project's issue page](https://github.com/Quixotic7/MvaveFM1Unbricker/issues). Real-hardware validation of this interface is still pending. The launcher starts in simulation; real recovery uses `--live`.

---

## Português

**Calma.** Uma atualização que falha normalmente estraga o software do FM-1, não o equipamento. Nada é gravado antes de existir um backup verificado e de você digitar `WRITE`.

**1. Precisa de hardware?** Se o FM-1 aparece no computador de qualquer forma (disco USB, MIDI, "WL82 UBOOT"), tente antes o [Rescue box](https://thefirmwarehub.com/tools/rescue/) ou o [guia ilustrado](https://quixotic7.github.io/MvaveFM1Unbricker/). Se a tela está preta e nada aparece no USB, siga adiante.

**2. Veja feito:** [vídeo do criador do script](https://www.youtube.com/watch?v=-zk3BxrubBM) e [guia da comunidade com fotos](https://github.com/GoodPerson42/FM1-Unbricking-For-Dummies).

**3. Compras** (copie os termos na loja):
- **Placa RP2040:** `Seeed Studio XIAO RP2040 pre-soldered` ou `RP2040-Zero with pins`. Nunca RP2350 (Pico 2, XIAO RP2350).
- **Cabo para o FM-1:** plugue USB-C macho com 4 fios separados (vermelho VBUS, branco D−, verde D+, preto GND): `USB-C male to 4 pin Dupont female cable`, `USB type C male pigtail 4 wire`. Ou corte um cabo USB-A para USB-C de dados e identifique as cores. Confirme com multímetro.
- **Cabo para o computador:** `USB-C data cable` (de dados, não só carga).
- **Extras:** `electrical insulating tape`, `female to female dupont jumper wires`, `multimeter continuity`.

**4. Arquivos:** o V15 oficial vai dentro do app standalone para Mac (o hash é conferido). Senão use a [cópia verificada](https://github.com/Quixotic7/FM1Backups). A [página oficial da M-VAVE](https://www.m-vave.com/download) pode oferecer só o V16, que não pode ser gravado por este método. O arquivo .uf2 do Transporter é gerado pelo comando `setup` da [ferramenta original](https://github.com/Quixotic7/MvaveFM1Unbricker).

**5. Antes de conectar:** carregue o FM-1; nunca ligue o VBUS (vermelho); trocar D+ e D− não estraga nada; sem pressa, tentar de novo é seguro até a gravação.

**6. Etapas:** com o FM-1 desligado ligue D6 → D+, D7 → D−, GND → GND; ligue o FM-1 só quando o assistente pedir; faça o backup de duas leituras, confira o plano e digite **WRITE**; ao final desligue, tire os fios e ligue de novo. Dúvidas: [issues do projeto original](https://github.com/Quixotic7/MvaveFM1Unbricker/issues). A validação com equipamento real ainda está pendente.
