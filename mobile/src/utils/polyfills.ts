// Hermes has no WebCrypto `subtle`. react-native-quick-crypto provides a native implementation
// (PBKDF2, AES-GCM, SHA-*, getRandomValues, randomUUID) and install() exposes it as globalThis.crypto,
// which is exactly what the shared modules in ../lib expect.
import { install } from 'react-native-quick-crypto';

install();
