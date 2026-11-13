// Prevent running multiple times
if (!window.hasXSSScannerLoaded) {
    window.hasXSSScannerLoaded = true;

    // --- 1. THE TRAP (Main World Injection) ---
    try {
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL('hook.js');
        s.onload = function() { this.remove(); };
        (document.head || document.documentElement).appendChild(s);
    } catch (e) {
        console.error("XSS Scanner: Failed to inject hook", e);
    }

    // --- 2. THE LISTENER ---
    window.addEventListener('XSS_TRIGGERED', (e) => {
        chrome.runtime.sendMessage({ action: "XSS_FOUND" });
    });

    // --- 3. THE INJECTOR ---
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "START_SCAN") {
            runFuzzer(request.payload);
        }
    });

    async function runFuzzer(payload) {
        const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, [contenteditable="true"]');
        
        chrome.runtime.sendMessage({ 
            action: "STATUS_UPDATE", 
            message: `Found ${inputs.length} inputs. Fuzzing...` 
        });

        for (let el of inputs) {
            try {
                // Highlight
                const originalBorder = el.style.border;
                el.style.border = "2px solid red";

                el.focus();
                
                // Smart Value Setter (React/Angular support)
                const nativeSetter = Object.getOwnPropertyDescriptor(
                    el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, 
                    "value"
                )?.set;
                
                if (nativeSetter) {
                    nativeSetter.call(el, payload);
                } else {
                    el.value = payload;
                    if(el.getAttribute('contenteditable')) el.innerText = payload;
                }

                // 1. Dispatch Input Events
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));

                // 2. Dispatch Keyboard Events (Enter)
                const enter = new KeyboardEvent('keydown', {
                    bubbles: true, cancelable: true, keyCode: 13, key: 'Enter'
                });
                el.dispatchEvent(enter);

                // 3. Dispatch Mouse Events (For onmouseover/onmouseenter payloads)
                // We simulate moving the mouse OVER the element to trigger those specific vectors
                const mouseEvent = new MouseEvent('mouseover', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                el.dispatchEvent(mouseEvent);

                // 4. Form Submission Attempt
                const form = el.closest('form');
                if (form) {
                    const btn = form.querySelector('button, input[type="submit"]');
                    if (btn) btn.click();
                }

                // Cleanup visual
                setTimeout(() => { el.style.border = originalBorder; }, 200);

                await new Promise(r => setTimeout(r, 150)); // Wait slightly between inputs
            } catch (e) {
                console.log("Skipping element", e);
            }
        }
        
        chrome.runtime.sendMessage({ 
            action: "STATUS_UPDATE", 
            message: "Scan complete. Check for alerts." 
        });
    }
}