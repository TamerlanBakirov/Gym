import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'forge:accessToken';
const REFRESH_KEY = 'forge:refreshToken';

/** In-memory cache so requests don't hit AsyncStorage every call. */
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenStore = {
  async load(): Promise<void> {
    const [a, r] = await AsyncStorage.multiGet([ACCESS_KEY, REFRESH_KEY]);
    accessToken = a[1];
    refreshToken = r[1];
  },

  async set(access: string, refresh: string): Promise<void> {
    accessToken = access;
    refreshToken = refresh;
    await AsyncStorage.multiSet([
      [ACCESS_KEY, access],
      [REFRESH_KEY, refresh],
    ]);
  },

  async setAccess(access: string): Promise<void> {
    accessToken = access;
    await AsyncStorage.setItem(ACCESS_KEY, access);
  },

  async clear(): Promise<void> {
    accessToken = null;
    refreshToken = null;
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  },

  getAccess: () => accessToken,
  getRefresh: () => refreshToken,
  hasSession: () => !!accessToken && !!refreshToken,
};
