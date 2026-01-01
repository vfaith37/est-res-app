import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/store/hooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Screens
import HomeScreen from "@/screens/home/HomeScreen";
import VisitorsListScreen from "@/screens/visitors/VisitorsListScreen";
import CreateVisitorScreen from "@/screens/visitors/CreateVisitorScreen";
import VisitorQRScreen from "@/screens/visitors/VisitorQRScreen";
import MaintenanceListScreen from "@/screens/maintenance/MaintenanceListScreen";
import ReportIssueScreen from "@/screens/maintenance/ReportIssueScreen";
import PaymentsListScreen from "@/screens/payments/PaymentsListScreen";
import PaymentDetailsScreen from "@/screens/payments/PaymentDetailsScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import EditProfileScreen from "@/screens/profile/EditProfileScreen";
import HouseholdMainScreen from "@/screens/household/HouseholdMainScreen";
import QRScannerScreen from "@/screens/security/QRScannerScreen";
import CheckedInVisitorsScreen from "@/screens/security/CheckedInVisitorsScreen";
import SecurityHomeScreen from "@/screens/security/SecurityHomeScreen";
import ActiveTokensScreen from "@/screens/security/ActiveTokensScreen";
import SecurityEmergenciesScreen from "@/screens/security/SecurityEmergenciesScreen";
import SecuritySettingsScreen from "@/screens/security/SecuritySettingsScreen";
import SecurityEditProfileScreen from "@/screens/security/SecurityEditProfileScreen";
import EmergencyListScreen from "@/screens/emergency/EmergencyListScreen";
import ReportEmergencyScreen from "@/screens/emergency/ReportEmergencyScreen";
import FamilyMembersListScreen from "@/screens/household/FamilyMembersListScreen";
import AddFamilyMemberScreen from "@/screens/household/AddFamilyMemberScreen";
import EditFamilyMemberScreen from "@/screens/household/EditFamilyMemberScreen";
import DomesticStaffListScreen from "@/screens/household/DomesticStaffListScreen";
import AddDomesticStaffScreen from "@/screens/household/AddDomesticStaffScreen";
import NotificationsScreen from "@/screens/notifications/NotificationsScreen";
import NotificationDetailsScreen from "@/screens/notifications/NotificationDetailsScreen";
import EnhancedNotificationsScreen from "@/screens/notifications/EnhancedNotificationsScreen";
import EstateVendorsScreen from "@/screens/estate/EstateVendorsScreen";
import EstateDriversScreen from "@/screens/estate/EstateDriversScreen";
import ComplaintsScreen from "@/screens/complaints/ComplaintsScreen";
import TermsAndConditionsScreen from "@/screens/legal/TermsAndConditionsScreen";
import PrivacyPolicyScreen from "@/screens/legal/PrivacyPolicyScreen";
import FamilyMemberSettingsScreen from "@/screens/family/FamilyMemberSettingsScreen";
import FamilyMemberEditProfileScreen from "@/screens/family/FamilyMemberEditProfileScreen";
// import HouseholdMainScreen from '@/screens/household/HouseholdMainScreen';

import type {
  SecurityTabParamList,
  HomeHeadTabParamList,
  FamilyMemberTabParamList,
  HomeStackParamList,
  VisitorsStackParamList,
  MaintenanceStackParamList,
  PaymentsStackParamList,
  ProfileStackParamList,
  SecuritySettingsStackParamList,
  FamilyMemberSettingsStackParamList,
} from "@/types/navigation";
import { Platform } from "react-native";

const SecurityTab = createBottomTabNavigator<SecurityTabParamList>();
const HomeHeadTab = createBottomTabNavigator<HomeHeadTabParamList>();
const FamilyMemberTab = createBottomTabNavigator<FamilyMemberTabParamList>();

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const VisitorsStack = createNativeStackNavigator<VisitorsStackParamList>();
const MaintenanceStack =
  createNativeStackNavigator<MaintenanceStackParamList>();
const PaymentsStack = createNativeStackNavigator<PaymentsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const SecurityCheckInStack = createNativeStackNavigator();
const SecuritySettingsStack =
  createNativeStackNavigator<SecuritySettingsStackParamList>();
const FamilyMemberSettingsStack =
  createNativeStackNavigator<FamilyMemberSettingsStackParamList>();
const HouseholdStack = createNativeStackNavigator();
const EmergencyStack = createNativeStackNavigator();

// Stack Navigators
function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: "Dashboard" }}
      />
    </HomeStack.Navigator>
  );
}

function VisitorsNavigator() {
  return (
    <VisitorsStack.Navigator screenOptions={{ headerShown: false }}>
      <VisitorsStack.Screen
        name="VisitorsList"
        component={VisitorsListScreen}
        options={{ title: "Visitors" }}
      />
      <VisitorsStack.Screen
        name="CreateVisitor"
        component={CreateVisitorScreen}
        options={{ title: "New Visitor Pass", presentation: "modal" }}
      />
      <VisitorsStack.Screen
        name="VisitorQR"
        component={VisitorQRScreen}
        options={{ title: "Visitor Pass", presentation: "modal" }}
      />
    </VisitorsStack.Navigator>
  );
}

function MaintenanceNavigator() {
  return (
    <MaintenanceStack.Navigator>
      <MaintenanceStack.Screen
        name="MaintenanceList"
        component={MaintenanceListScreen}
        options={{ title: "Maintenance" }}
      />
      <MaintenanceStack.Screen
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{ title: "Report Issue" }}
      />
    </MaintenanceStack.Navigator>
  );
}

function PaymentsNavigator() {
  return (
    <PaymentsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <PaymentsStack.Screen
        name="PaymentsList"
        component={PaymentsListScreen}
        options={{ title: "Payments" }}
      />
      <PaymentsStack.Screen
        name="PaymentDetails"
        component={PaymentDetailsScreen}
        options={{ title: "Payment Details", headerShown: true }}
      />
    </PaymentsStack.Navigator>
  );
}

function HouseholdNavigator() {
  return (
    <HouseholdStack.Navigator>
      <HouseholdStack.Screen
        name="HouseholdMain"
        component={HouseholdMainScreen}
        options={{ title: "Household" }}
      />
      <HouseholdStack.Screen
        name="AddFamilyMember"
        component={AddFamilyMemberScreen}
        options={{ title: "Add Family Member" }}
      />
      <HouseholdStack.Screen
        name="EditFamilyMember"
        component={EditFamilyMemberScreen}
        options={{ title: "Edit Family Member" }}
      />
      <HouseholdStack.Screen
        name="AddDomesticStaff"
        component={AddDomesticStaffScreen}
        options={{ title: "Add Staff Member" }}
      />
    </HouseholdStack.Navigator>
  );
}
function EmergencyNavigator() {
  return (
    <EmergencyStack.Navigator>
      <EmergencyStack.Screen
        name="EmergencyList"
        component={EmergencyListScreen}
        options={{ title: "Emergency" }}
      />
      <EmergencyStack.Screen
        name="ReportEmergency"
        component={ReportEmergencyScreen}
        options={{ title: "Report Emergency" }}
      />
    </EmergencyStack.Navigator>
  );
}

function SecurityCheckInNavigator() {
  return (
    <SecurityCheckInStack.Navigator>
      <SecurityCheckInStack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ headerShown: false }}
      />
      <SecurityCheckInStack.Screen
        name="CheckedInList"
        component={CheckedInVisitorsScreen}
        options={{ title: "Checked-In Visitors" }}
      />
    </SecurityCheckInStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
      <ProfileStack.Screen
        name="NotificationDetails"
        component={NotificationDetailsScreen}
        options={{ title: "Notification Details" }}
      />
      {/* Household & Vendors */}
      <ProfileStack.Screen
        name="FamilyMembersList"
        component={FamilyMembersListScreen}
        options={{ title: "Family Members" }}
      />
      <ProfileStack.Screen
        name="AddFamilyMember"
        component={AddFamilyMemberScreen}
        options={{ title: "Add Family Member", presentation: "modal" }}
      />
      <ProfileStack.Screen
        name="EditFamilyMember"
        component={EditFamilyMemberScreen}
        options={{ title: "Edit Family Member", presentation: "modal" }}
      />
      <ProfileStack.Screen
        name="DomesticStaffList"
        component={DomesticStaffListScreen}
        options={{ title: "Domestic Staff" }}
      />
      <ProfileStack.Screen
        name="AddDomesticStaff"
        component={AddDomesticStaffScreen}
        options={{ title: "Add Staff Member", presentation: "modal" }}
      />
      <ProfileStack.Screen
        name="EstateVendors"
        component={EstateVendorsScreen}
        options={{ title: "Estate Vendors" }}
      />
      {/* Estate Services */}
      <ProfileStack.Screen
        name="EmergencyList"
        component={EmergencyListScreen}
        options={{ title: "Emergencies" }}
      />
      <ProfileStack.Screen
        name="ReportEmergency"
        component={ReportEmergencyScreen}
        options={{ title: "Report Emergency" }}
      />
      <ProfileStack.Screen
        name="MaintenanceList"
        component={MaintenanceListScreen}
        options={{ title: "Maintenance" }}
      />
      <ProfileStack.Screen
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{ title: "Report Issue" }}
      />
      <ProfileStack.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{ title: "Complaints" }}
      />
      {/* About */}
      <ProfileStack.Screen
        name="Terms"
        component={TermsAndConditionsScreen}
        options={{ title: "Terms & Conditions" }}
      />
      <ProfileStack.Screen
        name="Privacy"
        component={PrivacyPolicyScreen}
        options={{ title: "Privacy Policy" }}
      />
    </ProfileStack.Navigator>
  );
}

// Security Settings Stack Navigator
function SecuritySettingsNavigator() {
  return (
    <SecuritySettingsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SecuritySettingsStack.Screen
        name="SecuritySettings"
        component={SecuritySettingsScreen}
        options={{ title: "Settings" }}
      />
      <SecuritySettingsStack.Screen
        name="SecurityEditProfile"
        component={SecurityEditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <SecuritySettingsStack.Screen
        name="Notifications"
        component={EnhancedNotificationsScreen}
        options={{ title: "Notifications" }}
      />
      <SecuritySettingsStack.Screen
        name="NotificationDetails"
        component={NotificationDetailsScreen}
        options={{ title: "Notification Details" }}
      />
      <SecuritySettingsStack.Screen
        name="EstateVendors"
        component={EstateVendorsScreen}
        options={{ title: "Estate Vendors" }}
      />
      <SecuritySettingsStack.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{ title: "Complaints" }}
      />
      <SecuritySettingsStack.Screen
        name="Terms"
        component={TermsAndConditionsScreen}
        options={{ title: "Terms & Conditions" }}
      />
      <SecuritySettingsStack.Screen
        name="Privacy"
        component={PrivacyPolicyScreen}
        options={{ title: "Privacy Policy" }}
      />
    </SecuritySettingsStack.Navigator>
  );
}

// Family Member Settings Stack Navigator
function FamilyMemberSettingsNavigator() {
  return (
    <FamilyMemberSettingsStack.Navigator>
      <FamilyMemberSettingsStack.Screen
        name="FamilyMemberSettings"
        component={FamilyMemberSettingsScreen}
        options={{ title: "Settings" }}
      />
      <FamilyMemberSettingsStack.Screen
        name="FamilyMemberEditProfile"
        component={FamilyMemberEditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <FamilyMemberSettingsStack.Screen
        name="Notifications"
        component={EnhancedNotificationsScreen}
        options={{ title: "Notifications" }}
      />
      <FamilyMemberSettingsStack.Screen
        name="NotificationDetails"
        component={NotificationDetailsScreen}
        options={{ title: "Notification Details" }}
      />
      <FamilyMemberSettingsStack.Screen
        name="EstateDrivers"
        component={EstateDriversScreen}
        options={{ title: "Estate Drivers" }}
      />
      <FamilyMemberSettingsStack.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{ title: "Complaints" }}
      />
      <FamilyMemberSettingsStack.Screen
        name="Terms"
        component={TermsAndConditionsScreen}
        options={{ title: "Terms & Conditions" }}
      />
      <FamilyMemberSettingsStack.Screen
        name="Privacy"
        component={PrivacyPolicyScreen}
        options={{ title: "Privacy Policy" }}
      />
    </FamilyMemberSettingsStack.Navigator>
  );
}

// Security Tab Navigator
function SecurityTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <SecurityTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom
        },
      }}
    >
      <SecurityTab.Screen
        name="Home"
        component={SecurityHomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <SecurityTab.Screen
        name="ActiveTokens"
        component={ActiveTokensScreen}
        options={{
          title: "Active Tokens",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done-outline" size={size} color={color} />
          ),
        }}
      />
      <SecurityTab.Screen
        name="Emergencies"
        component={SecurityEmergenciesScreen}
        options={{
          title: "Emergencies",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <SecurityTab.Screen
        name="Settings"
        component={SecuritySettingsNavigator}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </SecurityTab.Navigator>
  );
}

// Home Head Tab Navigator
function HomeHeadTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <HomeHeadTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: Platform.OS !== "ios" ? 60 + insets.bottom : insets.bottom + 30,
          paddingBottom: Platform.OS !== "ios" ? 8 + insets.bottom : insets.bottom + 3
        },
      }}
    >
      <HomeHeadTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <HomeHeadTab.Screen
        name="Token/Guest"
        component={VisitorsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <HomeHeadTab.Screen
        name="Dues/Pays"
        component={PaymentsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
      {/* <HomeHeadTab.Screen
        name="Amenities"
        component={AmenitiesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness-outline" size={size} color={color} />
          ),
        }}
      /> */}
      <HomeHeadTab.Screen
        name="Settings"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </HomeHeadTab.Navigator>
  );
}

// Family Member Tab Navigator
function FamilyMemberTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <FamilyMemberTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom
        },
      }}
    >
      <FamilyMemberTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <FamilyMemberTab.Screen
        name="Tokens"
        component={VisitorsNavigator}
        options={{
          title: "Tokens",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />
      <FamilyMemberTab.Screen
        name="Vendors"
        component={EstateVendorsScreen}
        options={{
          title: "Vendors",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
      <FamilyMemberTab.Screen
        name="Emergencies"
        component={EmergencyNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <FamilyMemberTab.Screen
        name="Settings"
        component={FamilyMemberSettingsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </FamilyMemberTab.Navigator>
  );
}

// Main Tab Navigator - Routes based on user role
export default function MainTabNavigator() {
  const user = useAppSelector((state) => state.auth.user);

  if (user?.role === "security") {
    return <SecurityTabNavigator />;
  }

  if (user?.role === "home_head") {
    return <HomeHeadTabNavigator />;
  }

  if (user?.role === "family_member") {
    return <FamilyMemberTabNavigator />;
  }

  // Default fallback
  return <HomeHeadTabNavigator />;
}
