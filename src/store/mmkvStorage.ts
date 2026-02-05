import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({
  id: "estate-manager-storage",
  encryptionKey: "your-encryption-key-here", // Use a secure key in production
});

export const saveState = (key: string, state: any) => {
  try {
    storage.set(key, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state:", error);
  }
};

export const loadState = (key: string) => {
  try {
    const state = storage.getString(key);
    return state ? JSON.parse(state) : undefined;
  } catch (error) {
    console.error("Failed to load state:", error);
    return undefined;
  }
};

export const clearState = (key: string) => {
  try {
    storage.remove(key);
  } catch (error) {
    console.error("Failed to clear state:", error);
  }
};

export const clearAllStates = () => {
  try {
    storage.clearAll();
  } catch (error) {
    console.error("Failed to clear all states:", error);
  }
};

