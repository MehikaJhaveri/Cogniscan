import * as SecureStore from 'expo-secure-store';

const KEYS = {
  TOKEN: '@cogniscan_token',
  USER: '@cogniscan_user',
  OFFLINE_QUEUE: '@cogniscan_offline_queue',
  GAME_RESULTS: '@cogniscan_game_cache',
  ASSESSMENTS: '@cogniscan_assessments_cache',
};

export const storage = {
  async setToken(token) {
    try {
      await SecureStore.setItemAsync(KEYS.TOKEN, token);
    } catch (e) {
      console.log('Error saving token', e);
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync(KEYS.TOKEN);
    } catch (e) {
      return null;
    }
  },

  async removeToken() {
    try {
      await SecureStore.deleteItemAsync(KEYS.TOKEN);
    } catch (e) {}
  },

  async setUser(user) {
    try {
      await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.log('Error saving user', e);
    }
  },

  async getUser() {
    try {
      const val = await SecureStore.getItemAsync(KEYS.USER);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      return null;
    }
  },

  async removeUser() {
    try {
      await SecureStore.deleteItemAsync(KEYS.USER);
    } catch (e) {}
  },

  async addToOfflineQueue(action) {
    try {
      const queue = await this.getOfflineQueue();
      queue.push({ ...action, timestamp: Date.now() });
      await SecureStore.setItemAsync(KEYS.OFFLINE_QUEUE, JSON.stringify(queue.slice(-20))); // Keep last 20
    } catch (e) {}
  },

  async getOfflineQueue() {
    try {
      const val = await SecureStore.getItemAsync(KEYS.OFFLINE_QUEUE);
      return val ? JSON.parse(val) : [];
    } catch (e) {
      return [];
    }
  },

  async clearOfflineQueue() {
    try {
      await SecureStore.deleteItemAsync(KEYS.OFFLINE_QUEUE);
    } catch (e) {}
  },

  async cacheGameResults(results) {
    try {
      await SecureStore.setItemAsync(KEYS.GAME_RESULTS, JSON.stringify(results));
    } catch (e) {}
  },

  async getCachedGameResults() {
    try {
      const val = await SecureStore.getItemAsync(KEYS.GAME_RESULTS);
      return val ? JSON.parse(val) : [];
    } catch (e) {
      return [];
    }
  },

  async clearAll() {
    try {
      const allKeys = Object.values(KEYS);
      for (const key of allKeys) {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {}
  },
};

export default storage;
