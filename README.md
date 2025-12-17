# Lector de Códigos de Barras - App Móvil + Receptor PC

Una aplicación React Native para escanear códigos de barras (EAN-13) con la cámara del móvil y enviarlos automáticamente a un servidor local en el PC, donde se escriben como si se teclearan.

Ideal para entornos de almacén, recepción de mercancía o cualquier proceso donde se necesite introducir códigos rápidamente sin tocar el teclado del ordenador.

[![Descargar APK para Android](https://img.shields.io/badge/Download-APK-brightgreen?style=for-the-badge&logo=android)](https://github.com/mgrau-manterol/BarcodeLector/releases/latest/download/lector.apk)
[![Descargar Instalador Windows (.msi)](https://img.shields.io/badge/Download-MSI-blue?style=for-the-badge&logo=windows)](https://github.com/mgrau-manterol/BarcodeLector/releases/latest/download/ReceptorCodigos.msi)

> **Versión actual: 1.0.0**  
> Descargas directas de la última versión estable.

## Características principales

- Escaneo en tiempo real con `react-native-vision-camera`.
- Modo automático (escanea continuamente) o manual (mantener pulsado un botón para escanear).
- Enfoque fijo para mayor estabilidad al leer códigos a distancia fija.
- Configuración de la URL del servidor (IP + puerto).
- Opción para activar/desactivar el envío automático al servidor.
- Historial de códigos escaneados (persistente aunque se cierre la app).
- Copiar código al portapapeles con un toque.
- Reenviar código individual al servidor.
- Borrar entrada individual o limpiar todo el historial.
- Mensajes tipo toast para feedback (copiado, etc.).
- Totalmente funcional en versión release (APK instalable).

## Requisitos

- Android 6.0 o superior (probado hasta Android 14).
- El móvil y el PC deben estar en la **misma red WiFi**.
- En el PC debe ejecutarse el servidor Python.

## Instalación y Uso

1. **App Móvil (Android)**: Descarga e instala el APK desde arriba.
2. **Receptor en PC (Windows)**: Descarga e instala el .msi desde arriba (crea accesos directos y se instala en Program Files).
3. Ejecuta el receptor en el PC (se inicia automáticamente o desde el menú).
4. En la app móvil: Configuración → pon la IP del PC (la muestra el receptor al iniciarse).
5. ¡Escanea y los códigos se escribirán solos en el PC!

## Servidor en PC

Incluido en el instalador .msi. Usa Flask + Waitress + pyautogui.

## Construido con

- React Native
- react-native-vision-camera
- react-native-permissions
- @react-native-async-storage/async-storage
- @react-native-clipboard/clipboard
- react-native-toast-message
- react-native-vector-icons
- Python (Flask, Waitress, pyautogui)

## Autor

Miquel Grau.

## Licencia

Libre para uso interno.