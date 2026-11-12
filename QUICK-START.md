# FM-1 Rescue · Buying and recovery guide

## What to buy

| Item | What to look for |
| --- | --- |
| Seeed Studio XIAO RP2040 | Buy the pre-soldered version with header pins already fitted. The Transporter requires RP2040. RP2350 is incompatible. |
| USB-C male to 4-pin female Dupont cable | Separate D+, D−, GND and VBUS wires, with individual female sockets to fit the header pins. |
| USB data cable | USB-C at the XIAO end, with a computer-compatible connector at the other end. |
| Insulating tape | Cover the unused VBUS lead. A multimeter is helpful for checking wire identity. |

The manufacturer's pre-soldered board is linked below. The recovery project's parts list includes a cable example. Match the connector and signal specifications when buying locally. [RP2040 board](https://www.seeedstudio.com/Seeed-Studio-XIAO-RP2040-Pre-Soldered-p-6333.html) · [Parts list and cable example](https://github.com/Quixotic7/MvaveFM1Unbricker/blob/main/TRANSPORTER-GUIDE.md#parts)

## Get ready

This method is for an FM-1 that stays dark and never appears on USB. Fully charge it first. The Windows/Linux standalone includes Python and the recovery engine. Obtain the official V15 file and the prepared Transporter UF2 separately using the upstream instructions. The interface accepts these files and checks their hashes.

1. Open the desktop executable to rehearse in simulation. Real recovery starts with the executable’s `--live` option.
2. Prepare the XIAO in step 1. With the FM-1 **off**, connect **D6 → D+**, **D7 → D−**, **GND → GND**. Insulate VBUS and leave it disconnected. Follow labels because wire colors vary.
3. Reconnect the XIAO and turn on the FM-1 **only when the assistant asks**.
4. Create the double-read backup, choose verified V15, review the write and type **WRITE**. Keep power and cables connected until verification finishes.
5. After verification, switch off the FM-1, remove all three wires, then switch it on. Use the regular installer for later firmware, with a full battery and the computer kept awake.

The GUI's real-hardware validation is pending. The in-app **What you need** button opens this guide in both languages.

## Português · Compra e recuperação

Compre uma **Seeed Studio XIAO RP2040 com pinos soldados**, um **cabo USB-C macho para quatro conectores Dupont fêmea individuais** (D+, D−, GND e VBUS), um **cabo USB de dados** para a XIAO e **fita isolante**. Um multímetro ajuda a conferir os fios. A versão RP2350 é incompatível. Use os links acima como referência de peças.

Carregue o FM-1. O standalone de Windows/Linux inclui Python e o motor de recuperação. Forneça separadamente o V15 oficial e o UF2 preparado do Transporter. O duplo clique em **FM1-Rescue.command** abre a simulação. O modo real usa `./FM1-Rescue.command --live`.

Prepare a XIAO na primeira etapa. Com o FM-1 desligado, ligue **D6 → D+**, **D7 → D−** e **GND → GND**. Deixe o VBUS isolado e desconectado. As cores variam. Reconecte a XIAO e ligue o FM-1 só quando o assistente pedir. Crie o backup, escolha o V15, confira o plano e digite **WRITE**. Mantenha tudo conectado até a verificação terminar. Depois, desligue, retire os fios e ligue novamente. A validação da interface com equipamento real ainda está pendente.
