import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import FamilyMembersListScreen from './FamilyMembersListScreen';
import DomesticStaffListScreen from './DomesticStaffListScreen';

const Tab = createMaterialTopTabNavigator();

export default function HouseholdMainScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
          tabBarLabelStyle: { fontWeight: '600', fontSize: 14 },
        }}
      >
        <Tab.Screen name="FamilyMembers" component={FamilyMembersListScreen} options={{ title: 'Family Members' }} />
        <Tab.Screen name="DomesticStaff" component={DomesticStaffListScreen} options={{ title: 'Domestic Staff' }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}