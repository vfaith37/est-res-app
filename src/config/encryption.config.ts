import { PUBLIC_KEY } from "./publicKey";

export const ENCRYPTION_CONFIG = {
  ENABLED: true,
  SECRET:
    process.env.EXPO_PUBLIC_ENCRYPTION_SECRET || "NoBeTheKeybeDizNah@3_18",
  PUBLIC_KEY_PEM: PUBLIC_KEY,
};
