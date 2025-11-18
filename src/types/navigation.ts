import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type {
  CompositeNavigationProp,
  RouteProp,
} from "@react-navigation/native";
import type { Visitor } from "@/store/api/visitorsApi";
import type { Notification } from "@/store/api/notificationsApi";

// Root Stack (from AppNavigator)
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Auth Stack (from AuthNavigator)
export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  OTP: { email: string };
  ResetPassword: { email: string; otp: string };
};

// Main Tab - Different for each user role
export type SecurityTabParamList = {
  Home: undefined;
  ActiveTokens: undefined;
  Emergencies: undefined;
  Settings: undefined;
};

// Security Home Top Tab
export type SecurityHomeTabParamList = {
  ManualInput: undefined;
  QRScanner: undefined;
};

export type HomeHeadTabParamList = {
  Home: undefined;
  Visitors: undefined;
  Payments: undefined;
  Amenities: undefined;
  Profile: undefined;
};

export type FamilyMemberTabParamList = {
  Home: undefined;
  Tokens: undefined;
  Vendors: undefined;
  Emergencies: undefined;
  Settings: undefined;
};

// Family Member Settings Stack
export type FamilyMemberSettingsStackParamList = {
  FamilyMemberSettings: undefined;
  FamilyMemberEditProfile: undefined;
  Notifications: undefined;
  NotificationDetails: { notification: Notification };
  EstateDrivers: undefined;
  Complaints: undefined;
  ComplaintDetails: { complaint: any };
  SubmitComplaint: undefined;
  Terms: undefined;
  Privacy: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeMain: undefined;
};

// Visitors Stack
export type VisitorsStackParamList = {
  VisitorsList: undefined;
  CreateVisitor: undefined;
  VisitorQR: { visitor: Visitor };
};

// Maintenance Stack
export type MaintenanceStackParamList = {
  MaintenanceList: undefined;
  ReportIssue: undefined;
};

// Payments Stack
export type PaymentsStackParamList = {
  PaymentsList: undefined;
  PaymentDetails: { paymentId: string };
};

// Amenities Stack
export type AmenitiesStackParamList = {
  AmenitiesList: undefined;
  BookAmenity: { amenityId: string };
  MyBookings: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  NotificationDetails: { notification: Notification };
  // Household & Vendors
  FamilyMembersList: undefined;
  AddFamilyMember: undefined;
  EditFamilyMember: { memberId: string };
  DomesticStaffList: undefined;
  AddDomesticStaff: undefined;
  EditDomesticStaff: { staffId: string };
  EstateVendors: undefined;
  EstateDrivers: undefined;
  // Estate Services
  EmergencyList: undefined;
  ReportEmergency: undefined;
  EmergencyDetails: { emergencyId: string };
  MaintenanceList: undefined;
  ReportIssue: undefined;
  Complaints: undefined;
  ComplaintDetails: { complaint: any };
  SubmitComplaint: undefined;
  // Reports
  GenerateReport: undefined;
  // About
  Terms: undefined;
  Privacy: undefined;
};

// Security Settings Stack
export type SecuritySettingsStackParamList = {
  SecuritySettings: undefined;
  SecurityEditProfile: undefined;
  Notifications: undefined;
  NotificationDetails: { notification: Notification };
  EstateVendors: undefined;
  Complaints: undefined;
  ComplaintDetails: { complaint: any };
  SubmitComplaint: undefined;
  Terms: undefined;
  Privacy: undefined;
};

// Incidents Stack (Security only)
export type IncidentsStackParamList = {
  IncidentsList: undefined;
  ReportIncident: undefined;
};

// Household Stack (Home Head only)
export type HouseholdStackParamList = {
  HouseholdMain: undefined;
  FamilyMembersList: undefined;
  AddFamilyMember: undefined;
  EditFamilyMember: { memberId: string };
  DomesticStaffList: undefined;
  AddDomesticStaff: undefined;
  EditDomesticStaff: { staffId: string };
};

// Emergency Stack (All users)
export type EmergencyStackParamList = {
  EmergencyList: undefined;
  ReportEmergency: undefined;
  EmergencyDetails: { emergencyId: string };
};

// Security Check-in Stack
export type SecurityCheckInStackParamList = {
  ScanQR: undefined;
  ManualEntry: undefined;
  VisitorDetails: { visitorId: string };
};

// Navigation Props
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export type VisitorsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<VisitorsStackParamList>,
  BottomTabNavigationProp<HomeHeadTabParamList>
>;

export type MaintenanceNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MaintenanceStackParamList>,
  BottomTabNavigationProp<HomeHeadTabParamList>
>;

export type PaymentsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PaymentsStackParamList>,
  BottomTabNavigationProp<HomeHeadTabParamList>
>;

// Route Props
export type VisitorQRRouteProp = RouteProp<VisitorsStackParamList, "VisitorQR">;
export type PaymentDetailsRouteProp = RouteProp<
  PaymentsStackParamList,
  "PaymentDetails"
>;
