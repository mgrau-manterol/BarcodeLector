from flask import Flask, request
import socket

app = Flask(__name__)

@app.route('/barcode', methods=['POST'])
def barcode():
    data = request.get_json()
    code = data.get('code')
    print(f'Código recibido: {code}')
    import pyautogui
    pyautogui.typewrite(code)
    pyautogui.press('enter')
    return {'status': 'ok'}

if __name__ == '__main__':
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip_local = s.getsockname()[0]
        s.close()
    except Exception:
        ip_local = "127.0.0.1"

    port = 5000
    url_local = f"http://{ip_local}:{port}"
    url_loopback = f"http://127.0.0.1:{port}"

    print("========================================")
    print(" SERVIDOR RECEPTOR DE CÓDIGOS DE BARRAS")
    print("========================================")
    print(f"IP del ordenador: {ip_local}")
    print(f"URL para la app móvil:")
    print(f"   {url_local}")
    print("")
    print("========================================")
    print("Presiona CTRL+C para detener el servidor\n")

    from waitress import serve
    serve(app, host='0.0.0.0', port=port)