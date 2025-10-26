import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class HapticsManager {
  private isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
  public enabled = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  light() {
    if (this.isAvailable && this.enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  medium() {
    if (this.isAvailable && this.enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  heavy() {
    if (this.isAvailable && this.enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  success() {
    if (this.isAvailable && this.enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  warning() {
    if (this.isAvailable && this.enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  error() {
    if (this.isAvailable && this.enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  selection() {
    if (this.isAvailable && this.enabled) {
      Haptics.selectionAsync();
    }
  }
}

export const haptics = new HapticsManager();