import Constants from 'expo-constants';

/**
 * Base URL of the Forge backend.
 *
 * Resolution order:
 *  1. EXPO_PUBLIC_API_URL env var (set in your shell / EAS secrets)
 *  2. `extra.apiUrl` in app.json
 *  3. localhost fallback
 *
 * NOTE: on a physical device, `localhost` points at the phone, not your computer.
 * Set EXPO_PUBLIC_API_URL to your machine's LAN IP, e.g. http://192.168.1.20:4000
 */
const fromExtra =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? fromExtra ?? 'http://localhost:4000';

export const API_BASE = `${API_URL.replace(/\/$/, '')}/api`;
