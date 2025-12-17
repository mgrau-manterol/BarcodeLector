import React, { useEffect, useRef, useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Modal,
    TextInput,
    Dimensions,
    FlatList,
    Switch
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

const HISTORIAL_KEY = 'historial_codigos';
const SERVER_URL_KEY = 'server_url';
const MODO_ESCANEO_KEY = 'modo_escaneo';
const ENVIAR_AL_SERVIDOR_KEY = 'enviar_al_servidor';

export default function App() {
    const dispositivo = useCameraDevice('back');
    const cameraRef = useRef<Camera>(null);

    const [tienePermiso, setTienePermiso] = useState(false);
    const [ultimoCodigo, setUltimoCodigo] = useState<string | null>(null);

    const [serverUrl, setServerUrl] = useState<string | null>(null);
    const [modalConfigVisible, setModalConfigVisible] = useState(false);
    const [tempUrl, setTempUrl] = useState<string | null>(null);

    const [enviarAlServidor, setEnviarAlServidor] = useState(true);
    const [tempEnviarAlServidor, setTempEnviarAlServidor] = useState(enviarAlServidor);

    const [historial, setHistorial] = useState<string[]>([]);
    const [modalHistorialVisible, setModalHistorialVisible] = useState(false);

    const [modoManual, setModoManual] = useState(false);
    const [tempModoManual, setTempModoManual] = useState(modoManual);
    const [escaneandoAhora, setEscaneandoAhora] = useState(false);

    const codeScanner = useCodeScanner({
        codeTypes: ['ean-13'],
        onCodeScanned: (codes) => {
            if (modoManual && !escaneandoAhora) return;

            if (codes.length > 0) {
                const value = codes[0].value;
                if (value && value !== ultimoCodigo && value.length === 13) {
                    setUltimoCodigo(value);
                    sendToApi(value);
                    setHistorial((prev) => [value, ...prev]);
                }
            }
        },
    });

    useEffect(() => {
        const guardarHistorial = async () => {
            try {
                await AsyncStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
            } catch (error) {
                console.error('Error guardando historial', error);
            }
        };
        if (historial.length > 0) {
            guardarHistorial();
        }
    }, [historial]);

    useEffect(() => {
        const requestCameraPermission = async () => {
            try {
                let status = await check(PERMISSIONS.ANDROID.CAMERA);
                if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
                    status = await request(PERMISSIONS.ANDROID.CAMERA);
                }
                setTienePermiso(status === RESULTS.GRANTED);
            } catch (error) {
                console.error(error);
                setTienePermiso(false);
            }
        };
        requestCameraPermission();

        const cargarConfig = async () => {
            try {
                const hist = await AsyncStorage.getItem(HISTORIAL_KEY);
                if (hist) {
                    setHistorial(JSON.parse(hist));
                }

                const url = await AsyncStorage.getItem(SERVER_URL_KEY);
                if (url !== null) {
                    setServerUrl(url);
                    setTempUrl(url);
                }

                const modo = await AsyncStorage.getItem(MODO_ESCANEO_KEY);
                if (modo !== null) {
                    const esManual = modo === 'manual';
                    setModoManual(esManual);
                    setTempModoManual(esManual);
                }

                const enviarServ = await AsyncStorage.getItem(ENVIAR_AL_SERVIDOR_KEY);
                if (enviarServ !== null) {
                    const enviar = enviarServ === 'true';
                    setEnviarAlServidor(enviar);
                    setTempEnviarAlServidor(enviar);
                }
            } catch (error) {
                console.error('Error cargando configuración', error);
            }
        };

        cargarConfig();
    }, []);

    useEffect(() => {
        if (ultimoCodigo) {
            const timer = setTimeout(() => setUltimoCodigo(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [ultimoCodigo]);

    useEffect(() => {
        if (tienePermiso && dispositivo && cameraRef.current) {
            const { width, height } = Dimensions.get('window');
            cameraRef.current.focus({ x: width / 2, y: height / 2 });
        }
    }, [tienePermiso, dispositivo]);

    const sendToApi = async (code: string) => {
        if (enviarAlServidor) {
            try {
                if (serverUrl) {
                    await fetch(`${serverUrl}/barcode`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code }),
                    });
                    Toast.show({
                        type: 'success',
                        text1: 'Código enviado',
                        visibilityTime: 2000,
                    });
                }
            } catch (error) {
                Alert.alert('Error', 'No se pudo enviar el código. Revisa la URL');
            }
        } else {
            Alert.alert('Código guardado', code);
        }
    };

    const saveConfiguration = async () => {
        if (tempUrl?.trim()) {
            const urlToSave = tempUrl.trim();
            setServerUrl(urlToSave);
            await AsyncStorage.setItem(SERVER_URL_KEY, urlToSave);
        }

        setModoManual(tempModoManual);
        await AsyncStorage.setItem(MODO_ESCANEO_KEY, tempModoManual ? 'manual' : 'auto');

        setEnviarAlServidor(tempEnviarAlServidor);
        await AsyncStorage.setItem(ENVIAR_AL_SERVIDOR_KEY, tempEnviarAlServidor ? 'true' : 'false');

        setModalConfigVisible(false);
    };

    const modalConfig = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalConfigVisible}
                onRequestClose={() => setModalConfigVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Configuración</Text>
                        <View style={styles.ipRow}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setTempEnviarAlServidor(!tempEnviarAlServidor)}
                            >
                                <MaterialIcons
                                    name={tempEnviarAlServidor ? 'check-box' : 'check-box-outline-blank'}
                                    size={28}
                                    color="#007AFF"
                                />
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.modalInput, !tempEnviarAlServidor && styles.modalInputDisabled]}
                                placeholder="http://IP:PUERTO"
                                value={tempUrl || 'http://0.0.0.0:5000'}
                                onChangeText={setTempUrl}
                                autoFocus={false}
                                keyboardType="url"
                                editable={tempEnviarAlServidor}
                            />
                        </View>
                        <View style={styles.opcionRow}>
                            <Text style={styles.opcionTexto}>Escaneo manual</Text>
                            <Switch
                                value={tempModoManual}
                                onValueChange={setTempModoManual}
                                trackColor={{ false: '#767577', true: '#007AFF' }}
                                thumbColor={tempModoManual ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                                onPress={() => setModalConfigVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
                                onPress={saveConfiguration}
                            >
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const borrarCodigo = (index: number) => {
        Alert.alert(
            '¿Borrar esta entrada?',
            'Se eliminará este código del historial',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Borrar',
                    style: 'destructive',
                    onPress: () => {
                        setHistorial((prev) => {
                            const nuevo = [...prev];
                            nuevo.splice(index, 1);
                            return nuevo;
                        });
                    },
                },
            ],
            { cancelable: true }
        );
    }

    const modalHistorial = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalHistorialVisible}
                onRequestClose={() => setModalHistorialVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '80%', width: '90%' }]}>
                        <Text style={styles.modalTitle}>Historial de códigos escaneados</Text>

                        {historial.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 20, height: '80%', color: '#666' }}>
                                Aún no has escaneado ningún código
                            </Text>
                        ) : (
                            <FlatList
                                data={historial}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <View style={styles.historialItem}>
                                        <TouchableOpacity onPress={() => borrarCodigo(index)}>
                                            <MaterialIcons name="highlight-remove" size={30} color="#000000ff" />
                                        </TouchableOpacity>
                                        <Text style={styles.historialText}>
                                            {item}
                                        </Text>
                                        <View style={styles.historialFunciones}>
                                            <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => {
                                                Clipboard.setString(item);
                                                Toast.show({
                                                    type: 'success',
                                                    text1: '¡Copiado al portapapeles!',
                                                    text2: item,
                                                    visibilityTime: 2000,
                                                });
                                            }}>
                                                <MaterialIcons name="content-copy" size={30} color="#000000ff" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => {
                                                if (enviarAlServidor)
                                                    sendToApi(item)
                                            }}>
                                                <MaterialIcons name="send" size={30} color="#000000ff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                                style={{ marginTop: 10 }}
                            />
                        )}

                        <View style={styles.historialFooterButtons}>
                            {historial.length > 0 && (
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.historialButtonLimpiar]}
                                    onPress={() => {
                                        Alert.alert(
                                            '¿Limpiar historial?',
                                            'Se borrarán todos los códigos escaneados. Esta acción no se puede deshacer.',
                                            [
                                                {
                                                    text: 'Cancelar',
                                                    style: 'cancel',
                                                },
                                                {
                                                    text: 'Limpiar',
                                                    style: 'destructive',
                                                    onPress: () => {
                                                        setHistorial([]);
                                                        AsyncStorage.removeItem(HISTORIAL_KEY);
                                                    },
                                                },
                                            ],
                                            { cancelable: true }
                                        );
                                    }}
                                >
                                    <Text style={[styles.modalButtonText, { color: '#fff' }]}>Limpiar</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.modalButton, styles.historialButtonCerrar]}
                                onPress={() => setModalHistorialVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Toast
                    config={{
                        success: ({ text1, text2 }) => (
                            <View style={{
                                backgroundColor: '#333',
                                padding: 16,
                                borderRadius: 12,
                                minWidth: '80%',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 10
                            }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>
                                {text2 && <Text style={{ color: '#ddd', fontSize: 14, marginTop: 4 }}>{text2}</Text>}
                            </View>
                        )
                    }}
                    position="bottom"
                    bottomOffset={100}
                    visibilityTime={2000}
                />
            </Modal>
        );
    }

    if (!dispositivo) {
        return <View style={styles.center}><Text>No hay cámara disponible</Text></View>;
    }

    if (!tienePermiso) {
        return <View style={styles.center}><Text>Solicitando permiso de cámara...</Text></View>;
    }

    return (
        <>

            <View style={StyleSheet.absoluteFill}>
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={dispositivo}
                    isActive={true}
                    codeScanner={codeScanner}
                    torch="off"
                    zoom={1}
                />

                {modoManual && (
                    <TouchableOpacity
                        style={styles.botonEscaneoManual}
                        onPressIn={() => setEscaneandoAhora(true)}
                        onPressOut={() => setEscaneandoAhora(false)}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="qr-code-scanner" size={50} color="#fff" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => {
                        setModalHistorialVisible(true);
                    }}
                >
                    <MaterialIcons name="history" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => {
                        setTempUrl(serverUrl);
                        setModalConfigVisible(true);
                    }}
                >
                    <MaterialIcons name="settings" size={30} color="#fff" />
                </TouchableOpacity>

                {modalConfig()}
                {modalHistorial()}

            </View>

            {!modalHistorialVisible && (
                <Toast
                    config={{
                        success: ({ text1, text2 }) => (
                            <View style={{
                                backgroundColor: '#333',
                                padding: 16,
                                borderRadius: 12,
                                minWidth: '80%',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 10
                            }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>
                                {text2 && <Text style={{ color: '#ddd', fontSize: 14, marginTop: 4 }}>{text2}</Text>}
                            </View>
                        )
                    }}
                    position="top"
                    topOffset={60}
                    visibilityTime={2000}
                />
            )}

        </>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 10,
        borderRadius: 30,
    },
    historyButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 10,
        borderRadius: 30,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '85%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    modalButtonText: {
        fontSize: 16,
    },
    historialItem: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    historialText: {
        fontSize: 16,
        fontFamily: 'monospace',
    },
    historialFunciones: {
        flexDirection: 'row',
    },
    historialFooterButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginTop: 20,
    },
    historialButtonLimpiar: {
        backgroundColor: '#FF3B30',
    },
    historialButtonCerrar: {
        backgroundColor: '#007AFF',
    },
    opcionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    opcionTexto: {
        fontSize: 16,
        flex: 1,
    },
    botonEscaneoManual: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 122, 255, 0.9)',
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    checkboxContainer: {
        paddingRight: 12,
        justifyContent: 'center',
    },
    ipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        height: 48,
    },
    modalInputDisabled: {
        backgroundColor: '#f0f0f0',
        color: '#888',
        borderColor: '#ddd',
    },
});