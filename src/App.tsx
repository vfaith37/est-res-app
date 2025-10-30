import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import { NotificationProvider } from './contexts/NotificationContext';
import { useEffect } from 'react';
import { testEncryption } from './utils/encryption';

export function App() {
   useEffect(() => {
    // Test encryption on app start
    setTimeout(() => {
      testEncryption({
        email: 'test@example.com',
        password: 'test123456',
      });
    }, 2000);
   }, []);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NotificationProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </NotificationProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}