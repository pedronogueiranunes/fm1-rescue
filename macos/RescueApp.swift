import AppKit
import WebKit

final class RescueApp: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate, WKUIDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!
    private var backend: Process?
    private var outputPipe: Pipe?
    private var outputBuffer = Data()
    private var sessionURL: URL?
    private var closing = false
    private var checkingClose = false
    private var pendingTermination = false
    private var logHandle: FileHandle?
    private var projectRoot: URL!

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        buildMenu()
        buildWindow()
        startBackend()
    }

    private func buildMenu() {
        let bar = NSMenu()
        let appItem = NSMenuItem()
        let menu = NSMenu()
        menu.addItem(withTitle: "About FM-1 Rescue", action: #selector(showAbout), keyEquivalent: "")
        menu.addItem(NSMenuItem.separator())
        menu.addItem(withTitle: "Quit FM-1 Rescue", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = menu
        bar.addItem(appItem)
        let editItem = NSMenuItem()
        let edit = NSMenu(title: "Edit")
        edit.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        edit.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        edit.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        edit.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editItem.submenu = edit
        bar.addItem(editItem)
        NSApp.mainMenu = bar
    }

    @objc private func showAbout() {
        NSApp.orderFrontStandardAboutPanel(options: [
            .applicationName: "FM-1 Rescue",
            .credits: NSAttributedString(string: "Interface by Pedro Nogueira · pedronogueira.dev\nRecovery engine by Quixotic7 · Transporter by Leo Kuroshita")
        ])
    }

    private func buildWindow() {
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1240, height: 920),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.title = "FM-1 Rescue"
        window.minSize = NSSize(width: 760, height: 620)
        window.isReleasedWhenClosed = false
        window.delegate = self
        webView = WKWebView(frame: window.contentView!.bounds)
        webView.autoresizingMask = [.width, .height]
        webView.navigationDelegate = self
        webView.uiDelegate = self
        window.contentView = webView
        webView.loadHTMLString("""
        <!doctype html><html><body style="font:18px system-ui;background:#f5f1ea;color:#232625;padding:48px">
        <h1>FM-1 Rescue</h1><p>Starting the local recovery assistant…</p></body></html>
        """, baseURL: nil)
        window.center()
        showWindow()
    }

    private func showWindow() {
        window.deminiaturize(nil)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        showWindow()
        return true
    }

    private func locateProject() -> URL? {
        let besideApp = Bundle.main.bundleURL.deletingLastPathComponent()
        let configured = Bundle.main.object(forInfoDictionaryKey: "FM1ProjectRoot") as? String
        var candidates = [besideApp]
        if let path = configured { candidates.append(URL(fileURLWithPath: path)) }
        for directory in candidates {
            if FileManager.default.fileExists(atPath: directory.appendingPathComponent("rescue.py").path) {
                return directory
            }
        }
        let chooser = NSOpenPanel()
        chooser.title = "Locate the fm1-rescue-ui folder"
        chooser.message = "Choose the folder containing rescue.py and the recovery interface."
        chooser.canChooseDirectories = true
        chooser.canChooseFiles = false
        if chooser.runModal() == .OK, let directory = chooser.url,
           FileManager.default.fileExists(atPath: directory.appendingPathComponent("rescue.py").path) {
            return directory
        }
        return nil
    }

    private func startBackend() {
        // Standalone build: the recovery backend is bundled inside the app.
        let bundled = Bundle.main.resourceURL?.appendingPathComponent("backend/FM1-Rescue-backend")
        let standalone = bundled.map { FileManager.default.isExecutableFile(atPath: $0.path) } ?? false
        guard let root = standalone ? Bundle.main.resourceURL : locateProject() else {
            showError("The fm1-rescue-ui folder could not be found.")
            return
        }
        projectRoot = root
        let python = standalone ? bundled! : root.deletingLastPathComponent().appendingPathComponent("venv/bin/python")
        guard FileManager.default.isExecutableFile(atPath: python.path) else {
            showError("The prepared Python environment is missing. Keep the venv folder beside fm1-rescue-ui.")
            return
        }
        let dataFolder = standalone
            ? FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Application Support/FM1Rescue/desktop-data")
            : root.appendingPathComponent("desktop-data")
        do {
            try FileManager.default.createDirectory(at: dataFolder, withIntermediateDirectories: true)
            let logURL = dataFolder.appendingPathComponent("macos.log")
            if !FileManager.default.fileExists(atPath: logURL.path) {
                FileManager.default.createFile(atPath: logURL.path, contents: nil)
            }
            logHandle = try FileHandle(forWritingTo: logURL)
            try logHandle?.seekToEnd()
            let process = Process()
            process.executableURL = python
            process.currentDirectoryURL = standalone ? dataFolder : root
            let live = CommandLine.arguments.contains("--live")
            process.arguments = (standalone ? [] : ["-B", root.appendingPathComponent("rescue.py").path])
                + [live ? "--live" : "--dry-run", "--no-browser"]
            window.title = live ? "FM-1 Rescue" : "FM-1 Rescue — Simulation"
            let pipe = Pipe()
            outputPipe = pipe
            process.standardOutput = pipe
            process.standardError = logHandle
            pipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
                let data = handle.availableData
                if data.isEmpty {
                    handle.readabilityHandler = nil
                    return
                }
                DispatchQueue.main.async { self?.receive(data) }
            }
            process.terminationHandler = { [weak self] process in
                DispatchQueue.main.async {
                    guard let self = self else { return }
                    self.outputPipe?.fileHandleForReading.readabilityHandler = nil
                    if self.closing { return }
                    if process.terminationStatus == 0 {
                        self.finishClosing()
                    } else {
                        self.showError("The local recovery process stopped. Keep the FM-1 connected if recovery was in progress. Details are in desktop-data/macos.log.")
                    }
                }
            }
            backend = process
            try process.run()
        } catch {
            backend = nil
            showError("Could not start the local recovery assistant.\n\n" + error.localizedDescription)
        }
    }

    private func receive(_ data: Data) {
        logHandle?.write(data)
        // Only the first output line contains the session address.
        guard sessionURL == nil else { return }
        outputBuffer.append(data)
        guard let newline = outputBuffer.firstIndex(of: 10) else { return }
        let firstLine = String(decoding: outputBuffer[..<newline], as: UTF8.self)
        guard let url = URL(string: firstLine), url.scheme == "http",
              url.host == "127.0.0.1", url.port != nil, url.fragment != nil else {
            showError("The local recovery assistant did not provide a valid startup address.")
            return
        }
        sessionURL = url
        outputBuffer.removeAll()
        webView.load(URLRequest(url: url))
    }

    private func request(_ path: String, post: Bool = false,
                         completion: @escaping (Data?, HTTPURLResponse?, Error?) -> Void) {
        guard let sessionURL = sessionURL,
              var components = URLComponents(url: sessionURL, resolvingAgainstBaseURL: false) else {
            completion(nil, nil, NSError(domain: "FM1Rescue", code: 1,
                                        userInfo: [NSLocalizedDescriptionKey: "The local session is still starting."]))
            return
        }
        components.fragment = nil
        components.path = "/api/" + path
        let url = components.url!
        var request = URLRequest(url: url)
        request.timeoutInterval = 4
        request.setValue(sessionURL.fragment!, forHTTPHeaderField: "X-Rescue-Token")
        if post {
            request.httpMethod = "POST"
            request.httpBody = Data()
            request.setValue("http://127.0.0.1:\(sessionURL.port!)", forHTTPHeaderField: "Origin")
        }
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async { completion(data, response as? HTTPURLResponse, error) }
        }.resume()
    }

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        if closing { return true }
        checkAndClose()
        return false
    }

    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        if closing { return .terminateNow }
        pendingTermination = true
        DispatchQueue.main.async { self.checkAndClose() }
        return .terminateLater
    }

    private func checkAndClose() {
        guard !checkingClose else { return }
        if backend == nil || backend?.isRunning == false {
            finishClosing()
            return
        }
        checkingClose = true
        request("state") { [weak self] data, response, error in
            guard let self = self else { return }
            self.checkingClose = false
            guard error == nil, response?.statusCode == 200, let data = data,
                  let state = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                self.refuseClosing("The recovery state could not be checked. Keep this window open while the local process is running.")
                return
            }
            if state["busy"] as? Bool == true || state["protect"] as? Bool == true {
                self.refuseClosing("Recovery is still active. Keep the FM-1 powered on and all cables connected until verification finishes.")
                return
            }
            self.checkingClose = true
            self.request("close", post: true) { [weak self] _, response, error in
                guard let self = self else { return }
                self.checkingClose = false
                if response?.statusCode == 200 {
                    self.finishClosing()
                } else {
                    self.refuseClosing("The local process could not close safely. Please try Close assistant again.")
                }
            }
        }
    }

    private func refuseClosing(_ message: String) {
        if pendingTermination {
            pendingTermination = false
            NSApp.reply(toApplicationShouldTerminate: false)
        }
        showError(message)
    }

    private func finishClosing() {
        closing = true
        if pendingTermination {
            pendingTermination = false
            NSApp.reply(toApplicationShouldTerminate: true)
        } else {
            NSApp.terminate(nil)
        }
    }

    private func showError(_ message: String) {
        showWindow()
        let alert = NSAlert()
        alert.messageText = "FM-1 Rescue"
        alert.informativeText = message
        alert.alertStyle = .warning
        alert.beginSheetModal(for: window)
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        if url.scheme == "about" || url.scheme == "data" {
            decisionHandler(.allow)
            return
        }
        if let sessionURL = sessionURL, url.scheme == "http",
           url.host == "127.0.0.1", url.port == sessionURL.port {
            decisionHandler(.allow)
        } else {
            if navigationAction.navigationType == .linkActivated,
               ["https", "http"].contains(url.scheme ?? "") {
                NSWorkspace.shared.open(url)
            }
            decisionHandler(.cancel)
        }
    }

    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping ([URL]?) -> Void) {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = parameters.allowsMultipleSelection
        panel.beginSheetModal(for: window) { result in
            completionHandler(result == .OK ? panel.urls : nil)
        }
    }
}

let application = NSApplication.shared
let delegate = RescueApp()
application.delegate = delegate
application.run()
