document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const statusDiv = document.getElementById('status');
    const payloadSelect = document.getElementById('payloadSelect');
    const customPayload = document.getElementById('customPayload');

    // Update text box when dropdown changes
    payloadSelect.addEventListener('change', () => {
        if (payloadSelect.value !== 'custom') {
            customPayload.value = payloadSelect.value;
        }
    });

    scanBtn.addEventListener('click', async () => {
        const payload = customPayload.value;
        if (!payload) return;

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        // Reset UI
        statusDiv.style.display = 'block';
        statusDiv.className = 'info';
        statusDiv.innerText = "Scanning inputs...";

        try {
            // 1. Inject the scanner content script if not present
            // We use executeScript to ensure it runs even if the user didn't refresh
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            // 2. Send the Start Command
            chrome.tabs.sendMessage(tab.id, {
                action: "START_SCAN",
                payload: payload
            });

        } catch (err) {
            statusDiv.innerText = "Error: Refresh page and try again.";
        }
    });

    // Listen for results
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "XSS_FOUND") {
            statusDiv.style.display = 'block';
            statusDiv.className = 'success';
            statusDiv.innerHTML = `<strong>⚠️ VULNERABILITY FOUND!</strong><br>The alert function was triggered successfully.`;
        }
        else if (request.action === "STATUS_UPDATE") {
            if (statusDiv.className !== 'success') { // Don't overwrite success msg
                statusDiv.style.display = 'block';
                statusDiv.innerText = request.message;
            }
        }
    });
});