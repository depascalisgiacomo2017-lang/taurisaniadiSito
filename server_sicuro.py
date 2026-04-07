import os
import base64
import http.server
import socketserver
import threading
import shutil

# Impostazioni
PORT = 80
TARGET_DIR = "sito_protetto"

def protect_and_encrypt_site():
    """
    Genera una versione protetta del sito nella cartella sito_protetto.
    Copia gli asset (immagini, stili) e offusca il codice JS.
    """
    if os.path.exists(TARGET_DIR):
        shutil.rmtree(TARGET_DIR)
    os.makedirs(TARGET_DIR)
        
    print("Inizio protezione files e copia asset...")

    # 1. Gestione Immagini (da ../immagini)
    source_img_dir = os.path.abspath(os.path.join(os.getcwd(), "..", "immagini"))
    target_img_dir = os.path.join(TARGET_DIR, "immagini")
    
    if os.path.exists(source_img_dir):
        shutil.copytree(source_img_dir, target_img_dir)
        print(f" [OK] Cartella immagini copiata in {TARGET_DIR}/immagini")
    else:
        print(f" [AVVISO] Cartella immagini non trovata in {source_img_dir}")

    # 2. Processo Files in execution/
    for filename in os.listdir("."):
        if filename.endswith(".html"):
            with open(filename, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Correzione percorsi: da ../immagini/ a ./immagini/
            # poiché ora la cartella immagini è all'interno di sito_protetto
            new_content = content.replace("../immagini/", "./immagini/")
            
            with open(os.path.join(TARGET_DIR, filename), "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f" - {filename} -> Copiato e percorsi corretti.")
                
        elif filename.endswith(".js"):
            with open(filename, "r", encoding="utf-8") as f:
                js_code = f.read()
                
            encoded = base64.b64encode(js_code.encode('utf-8')).decode('utf-8')
            
            protected_js = f"""
// === PROTEZIONE ATTIVA ===
(function() {{
    var cryptedData = '{encoded}';
    try {{
        var decoded = decodeURIComponent(escape(window.atob(cryptedData)));
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.text = decoded;
        document.head.appendChild(script);
    }} catch(e) {{
        console.error("Errore di decrittazione.");
    }}
}})();
"""
            with open(os.path.join(TARGET_DIR, filename), "w", encoding="utf-8") as f:
                f.write(protected_js)
            print(f" - {filename} -> CRIPTATO E PROTETTO.")

        # Copia di altri asset locali (.css, .png, .jpg, .webp, .ico)
        elif filename.lower().endswith(('.css', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.pdf')):
            shutil.copy2(filename, os.path.join(TARGET_DIR, filename))
            print(f" - {filename} -> Asset copiato.")

class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=TARGET_DIR, **kwargs)

    def end_headers(self):
        # Aggiunta di intestazioni di sicurezza per bloccare attacchi (XSS, Clickjacking, MIME sniff)
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

def run_server():
    protect_and_encrypt_site()
    
    with socketserver.TCPServer(("", PORT), SecureHTTPRequestHandler) as httpd:
        print("\n=======================================================")
        print(f" SITE PROTECTED ACTIVE ON: http://127.0.0.1:{PORT}")
        print(" Press CTRL+C to stop the server safely.")
        print(" Original files have NOT been modified.")
        print("=======================================================\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nChiusura del server protetto.")

if __name__ == "__main__":
    run_server()
