# Third-party software and attribution

## Recovery engine

Unmodified files from Quixotic7/MvaveFM1Unbricker, commit 0edc5add5e1412e7e68eefe2f84f2805e4b780fa, are included under vendor/MvaveFM1Unbricker. Copyright 2026 Michael P Jones. MIT license included in that directory. The wrapper calls the upstream API and preserves its device protocol and write checks.

## Transporter and loader

FM-1 Transporter is by Leo Kuroshita / Hügelton Instruments, MIT. jl-uboot-tool is by kagaimiq, MIT. These projects are credited in the README. Generated Transporter firmware containing the separately obtained JieLi loader is supplied by the user and excluded from the repository and standalone packages.

## Python and serial support

Standalone builds include Python, under its PSF license, and pyserial 3.5, under its BSD license. PyInstaller builds the executable under its GPL license with the PyInstaller bootloader exception. The upstream distributions' license notices remain in the packaged runtime.

## Browser runtime

Windows/Linux standalone releases include Chrome for Testing 157.0.8103.78 from Google's official Chrome for Testing distribution. The complete extracted distribution, including its license and third-party notices, is retained beside the executable. See https://developer.chrome.com/blog/chrome-for-testing and https://www.google.com/chrome/terms/.

## Fonts and brand

Manrope, Hanken Grotesk and Silkscreen are supplied locally under the SIL Open Font License 1.1. Their notices are in assets/fonts/. Interface brand elements are used at the request of Pedro Nogueira, https://pedronogueira.dev.

## Device firmware

FM-1 firmware belongs to M-VAVE. V15/V16 are excluded from the source repository and downloadable application bundles. CI downloads public test inputs solely to verify their known hashes and run simulation.
