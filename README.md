# Lector de Códigos de Barras - App Móvil - Receptor PC

Una aplicación React Native para escanear códigos de barras (EAN-13) con la cámara del móvil y enviarlos automáticamente a un servidor local en el PC, donde se escriben como si se teclearan.

Ideal para entornos de almacén, recepción de mercancía o cualquier proceso donde se necesite introducir códigos rápidamente sin tocar el teclado del ordenador.

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

## Instalación

1. Descarga el APK `ReceptorCodigos.apk`.
2. En el móvil, activa "Instalar apps de fuentes desconocidas" para el explorador/archivo que uses.
3. Abre el APK e instálalo.
4. Abre la app → concede permiso de cámara.
5. Pulsa el icono de configuración (arriba derecha).
6. Introduce la URL del servidor (ej: `http://192.168.1.100:5000`).
7. Marca o desmarca "Enviar código al servidor" según necesites.
8. ¡Listo! Escanea códigos y verás cómo aparecen en el PC.

## Uso

- **Escaneo automático**: la app escanea continuamente en cuanto detecta un código válido de 13 dígitos.
- **Escaneo manual**: activa la opción en configuración → aparece un botón grande abajo → mantén pulsado para escanear.
- **Historial**: icono arriba izquierda → lista de códigos escaneados con opciones de copiar, reenviar o borrar.
- **Configuración**: icono arriba derecha → cambia IP/puerto y modo de escaneo.

## Servidor en PC

La app envía los códigos vía POST a `/barcode` en el servidor local (PC).

## Construido con

- React Native
- react-native-vision-camera
- react-native-permissions
- @react-native-async-storage/async-storage
- @react-native-clipboard/clipboard
- react-native-toast-message
- react-native-vector-icons

## Autor

Miquel Grau.

## Licencia

Libre