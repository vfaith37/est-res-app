import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText as Text } from "@/components/ThemedText";
import { SecurityHomeTabParamList } from "@/types/navigation";
import ManualTokenInputScreen from "./ManualTokenInputScreen";
import QRTokenScannerScreen from "./QRTokenScannerScreen";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/store/hooks";
import { useGetNotificationsQuery } from "@/store/api/notificationsApi";

const Tab = createMaterialTopTabNavigator<SecurityHomeTabParamList>();

export default function SecurityHomeScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: unreadCount } = useGetNotificationsQuery({ unreadOnly: true });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}!</Text>
          <Text style={styles.unit}>Unit {user?.unit}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
          {unreadCount && unreadCount.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#000",
          tabBarIndicatorStyle: {
            backgroundColor: "#000",
            height: "100%",
            borderRadius: 30,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "600",
            textTransform: "none",
          },
          tabBarStyle: {
            backgroundColor: "#fff",
            borderRadius: 30,
            marginTop: 16,
            marginBottom: 10,
          },
          tabBarItemStyle: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
          },
        }}
      >
        <Tab.Screen
          name="ManualInput"
          component={ManualTokenInputScreen}
          options={{
            title: "Manual Input",
            tabBarIcon: ({ color }) => (
              <Ionicons name="create-outline" size={18} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="QRScanner"
          component={QRTokenScannerScreen}
          options={{
            title: "Scan Code",
            tabBarIcon: ({ color }) => (
              <Ionicons name="qr-code-outline" size={18} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 14,
    color: "#8E8E93",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  unit: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});

