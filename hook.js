(function() {
    // This script runs in the "Main World" of the page.
    // It overrides alert/confirm/prompt to detect XSS without freezing the browser.

    console.log("%c [XSS Scanner] Hook loaded.", "color: green;");

    function notifyScanner(type) {
        // Dispatch event so the isolated content script can hear it
        window.dispatchEvent(new CustomEvent('XSS_TRIGGERED', { detail: type }));
        console.log("%c [XSS Scanner] Payload Executed via " + type, "color: red; font-weight: bold; font-size: 14px;");
        return true; // Suppress the actual UI popup
    }

    // Override the native functions
    window.alert = function(msg) { notifyScanner('alert'); };
    window.confirm = function(msg) { notifyScanner('confirm'); return true; };
    window.prompt = function(msg) { notifyScanner('prompt'); return "XSS"; };

})();