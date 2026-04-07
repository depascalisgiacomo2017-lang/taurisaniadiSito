
// === PROTEZIONE ATTIVA ===
(function() {
    var cryptedData = 'Ly8gPT09IENvbmZpZ3VyYXppb25lIFN1cGFiYXNlID09PQovLyBVdGlsaXp6aWFtbyB1biBhcHByb2NjaW8gYmFzYXRvIHN1IGNhcmljYW1lbnRvIHVuaXZlcnNhbGUgKHNjcmlwdCBDRE4pCi8vIHBlciBnYXJhbnRpcmUgbGEgY29tcGF0aWJpbGl0w6AgY29uIGwnYXJjaGl0ZXR0dXJhIGF0dHVhbGUuCgpjb25zdCBTVVBBQkFTRV9VUkwgPSAiaHR0cHM6Ly9obmtld2p5dmlnc2xiZWhidWV2ZS5zdXBhYmFzZS5jbyI7CmNvbnN0IFNVUEFCQVNFX0tFWSA9ICJzYl9wdWJsaXNoYWJsZV9CQmhZRnNfRGcxREtTd1lvNjhhcUV3X0dGb084TDZPIjsKCi8vIEluaXppYWxpenphemlvbmUgQ2xpZW50Ci8vIE5vdGE6IEFzc2ljdXJhdGkgZGkgaW5jbHVkZXJlIDxzY3JpcHQgc3JjPSJodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL0BzdXBhYmFzZS9zdXBhYmFzZS1qc0AyIj48L3NjcmlwdD4gbmVsbCdIVE1MCmNvbnN0IHN1cGFiYXNlID0gd2luZG93LnN1cGFiYXNlID8gd2luZG93LnN1cGFiYXNlLmNyZWF0ZUNsaWVudChTVVBBQkFTRV9VUkwsIFNVUEFCQVNFX0tFWSkgOiBudWxsOwoKaWYgKCFzdXBhYmFzZSkgewogICAgY29uc29sZS5lcnJvcigiU3VwYWJhc2Ugbm9uIGNhcmljYXRvLiBWZXJpZmljYSBsYSBjb25uZXNzaW9uZSBvIGwnaW5jbHVzaW9uZSBkZWxsbyBzY3JpcHQgQ0ROLiIpOwp9CgovLyBFc3BvcnRhemlvbmUgZ2xvYmFsZSBwZXIgZ2VzdG9yZV9naW9jaGkuanMKd2luZG93LnN1cGFiYXNlQ2xpZW50ID0gc3VwYWJhc2U7Cg==';
    try {
        var decoded = decodeURIComponent(escape(window.atob(cryptedData)));
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.text = decoded;
        document.head.appendChild(script);
    } catch(e) {
        console.error("Errore di decrittazione.");
    }
})();
