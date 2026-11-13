🛡️ XSS Hunter - Automated Browser Extension Scanner

XSS Hunter is a lightweight, powerful DAST (Dynamic Application Security Testing) browser extension designed to automate the detection of Cross-Site Scripting (XSS) vulnerabilities.

Unlike basic scanners, XSS Hunter uses a smart Event Hooking system to detect payload execution without blocking the browser UI, and includes specific logic to trigger input changes in modern frameworks like React, Vue, and Angular.

✨ Features

⚡ Automated Fuzzing: Crawls the current page for input, textarea, and contenteditable elements.

🧠 Modern Framework Support: Uses native prototype setters to force state changes in React/Angular/Vue apps where standard value = x fails.

🪤 Execution Detection (Hooking): Injects a hook into the page context to intercept window.alert, window.confirm, and window.prompt. It detects if a payload executed without freezing the browser with a popup.

🖱️ Event Simulation: Simulates input, change, keydown (Enter), and mouseover events to trigger complex DOM-based XSS vectors.

📦 Advanced Payloads: Includes a curated list of:

Standard vectors (<script>)

Polyglots (Context breakers)

Attribute injections (" onmouseover...)

Framework-specific payloads (Angular Sandbox escapes)

🚀 Installation

Since this is a security tool, it is loaded as an Unpacked Extension:

Clone or Download this repository.

Open your browser (Chrome, Brave, Edge).

Navigate to chrome://extensions.

Toggle Developer Mode (top right corner).

Click Load Unpacked.

Select the folder containing these files.

🛠️ Usage

Navigate to the target website you have permission to test (e.g., a local instance of OWASP Juice Shop or DVWA).

Click the XSS Hunter icon in your toolbar.

Select an Attack Vector from the dropdown (or enter a custom payload).

Click INJECT & SCAN.

Watch the status:

Blue: Scanning and injecting.

Green: Scan complete (no triggers yet).

RED: ⚠️ VULNERABILITY FOUND! (The payload successfully executed).

🧩 How It Works

1. The Injector (content.js)

The extension identifies all interactive elements on the page. It iterates through them and injects the selected payload. Crucially, it uses Object.getOwnPropertyDescriptor to bypass React's shadow DOM event suppression, ensuring the application "sees" the typed text.

2. The Trap (hook.js)

To bypass Content Security Policy (CSP) restrictions on inline scripts, the extension injects hook.js as a web-accessible resource.
This script overwrites the native browser functions:

window.alert = function(msg) { ... }


When your XSS payload executes (e.g., <script>alert(1)</script>), instead of showing a popup, the hook dispatches a custom event XSS_TRIGGERED back to the extension, confirming the vulnerability immediately.

📂 Project Structure

manifest.json: Configuration, permissions, and security policy.

popup.html: The UI for selecting payloads.

popup.js: Logic to communicate between UI and the page.

content.js: The scanner that runs on the webpage.

hook.js: The interceptor that runs in the page's main world context.

icon.jpg: Extension icon.

⚠️ Disclaimer

This tool is for educational purposes and authorized security testing only.

By using this software, you agree that you will not use it to scan, attack, or compromise targets without explicit, written permission from the owner. The author assumes no liability for misuse of this tool or any damage caused by it.

Always scan responsibly.

🤝
