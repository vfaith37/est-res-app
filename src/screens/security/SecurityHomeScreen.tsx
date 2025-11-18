import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { SecurityHomeTabParamList } from '@/types/navigation';
import ManualTokenInputScreen from './ManualTokenInputScreen';
import QRTokenScannerScreen from './QRTokenScannerScreen';

const Tab = createMaterialTopTabNavigator<SecurityHomeTabParamList>();

export default function SecurityHomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarIndicatorStyle: {
            backgroundColor: '#007AFF',
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5EA',
          },
        }}
      >
        <Tab.Screen
          name="ManualInput"
          component={ManualTokenInputScreen}
          options={{ title: 'Manual Token Input' }}
        />
        <Tab.Screen
          name="QRScanner"
          component={QRTokenScannerScreen}
          options={{ title: 'QR Code Scan' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});
