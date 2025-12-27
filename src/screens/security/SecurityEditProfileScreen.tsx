import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  ActionSheetIOS,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGetResidentQuery,
  useEditResidentMutation,
} from "@/store/api/residentApi";
import { haptics } from "@/utils/haptics";
import * as ImagePicker from "expo-image-picker";

export default function SecurityEditProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.user);
  const residentId = user?.residentId;

  // Fetch resident data
  const {
    data: resident,
    isLoading,
    isError,
  } = useGetResidentQuery(residentId!, {
    skip: !residentId,
  });

  // Edit mutation
  const [editResident, { isLoading: isSaving }] = useEditResidentMutation();

  // Form state - Personal Information
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappfone, setWhatsappfone] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [maritalStatus, setMaritalStatus] = useState<
    "Single" | "Married" | "Divorced" | "Widowed"
  >("Single");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Initialize form with resident data
  useEffect(() => {
    if (resident) {
      setFirstname(resident.firstname || "");
      setLastname(resident.lastname || "");
      setPhone(resident.phone || "");
      setEmail(resident.email || "");
      setWhatsappfone(resident.whatsappfone || "");

      // Parse date of birth
      if (resident.dob) {
        const date = new Date(resident.dob);
        setDobDay(String(date.getDate()).padStart(2, "0"));
        setDobMonth(String(date.getMonth() + 1).padStart(2, "0"));
        setDobYear(String(date.getFullYear()));
      }

      setGender(resident.gender || "Male");
      setMaritalStatus(resident.maritalstatus || "Single");
    }
  }, [resident]);

  const handleSave = async () => {
    if (!firstname || !lastname || !phone || !email) {
      haptics.error();
      Alert.alert(
        "Error",
        "Please fill in all required fields (First Name, Last Name, Phone, Email)"
      );
      return;
    }

    try {
      haptics.light();

      // Prepare update data
      const updateData: any = {
        firstname,
        lastname,
        phone,
        email,
        whatsappfone,
        gender,
        maritalstatus: maritalStatus,
      };

      // Construct date of birth if all parts are provided
      if (dobDay && dobMonth && dobYear) {
        const dob = new Date(
          parseInt(dobYear),
          parseInt(dobMonth) - 1,
          parseInt(dobDay)
        );
        updateData.dob = dob.toISOString();
      }

      // Include photo if a new one was selected
      if (selectedPhoto) {
        try {
          const filename = selectedPhoto.split("/").pop() || "photo.jpg";
          const mimeType = filename.endsWith(".png")
            ? "image/png"
            : "image/jpeg";

          updateData.photofilename = filename;
          updateData.photomimetype = mimeType;
        } catch (photoError) {
          console.error("Error processing photo:", photoError);
          Alert.alert(
            "Warning",
            "Photo upload may have failed, but other changes will be saved."
          );
        }
      }

      await editResident({
        residentId: residentId!,
        data: updateData,
      }).unwrap();

      haptics.success();
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      haptics.error();
      Alert.alert("Error", error?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePhoto = async () => {
    haptics.light();

    const showOptions = () => {
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Take Photo", "Choose from Library"],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              await openCamera();
            } else if (buttonIndex === 2) {
              await openImageLibrary();
            }
          }
        );
      } else {
        Alert.alert("Change Photo", "Choose an option", [
          { text: "Cancel", style: "cancel" },
          { text: "Take Photo", onPress: openCamera },
          { text: "Choose from Library", onPress: openImageLibrary },
        ]);
      }
    };

    showOptions();
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
      haptics.success();
    }
  };

  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library permission is required to select photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
      haptics.success();
    }
  };

  const showGenderPicker = () => {
    haptics.light();
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Male", "Female"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setGender("Male");
          } else if (buttonIndex === 2) {
            setGender("Female");
          }
        }
      );
    } else {
      Alert.alert("Select Gender", "", [
        { text: "Cancel", style: "cancel" },
        { text: "Male", onPress: () => setGender("Male") },
        { text: "Female", onPress: () => setGender("Female") },
      ]);
    }
  };

  const showMaritalStatusPicker = () => {
    haptics.light();
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Single", "Married", "Divorced", "Widowed"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          const statuses: Array<"Single" | "Married" | "Divorced" | "Widowed"> =
            ["Single", "Married", "Divorced", "Widowed"];
          if (buttonIndex > 0 && buttonIndex <= statuses.length) {
            setMaritalStatus(statuses[buttonIndex - 1]);
          }
        }
      );
    } else {
      Alert.alert("Select Marital Status", "", [
        { text: "Cancel", style: "cancel" },
        { text: "Single", onPress: () => setMaritalStatus("Single") },
        { text: "Married", onPress: () => setMaritalStatus("Married") },
        { text: "Divorced", onPress: () => setMaritalStatus("Divorced") },
        { text: "Widowed", onPress: () => setMaritalStatus("Widowed") },
      ]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !resident) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Failed to load profile data</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Photo */}
          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {selectedPhoto || resident.signedUrl ? (
                <Image
                  source={{ uri: selectedPhoto || resident.signedUrl }}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="shield-checkmark" size={60} color="#007AFF" />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleChangePhoto}
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information Section */}
          <View
            style={[
              styles.section,
              {
                borderBottomWidth: 1,
                borderBottomColor: "#E5E5EA",
                paddingBottom: 16,
              },
            ]}
          >
            <View style={styles.sectionContent}>
              {/* First Name and Last Name - Side by side */}
              <View style={styles.rowContainer}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter first name"
                    value={firstname}
                    onChangeText={setFirstname}
                    editable={!isSaving}
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter last name"
                    value={lastname}
                    onChangeText={setLastname}
                    editable={!isSaving}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>WhatsApp Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter WhatsApp number"
                  value={whatsappfone}
                  onChangeText={setWhatsappfone}
                  keyboardType="phone-pad"
                  editable={!isSaving}
                />
              </View>

              {/* Date of Birth - Day and Month side by side */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Date of Birth <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <TextInput
                      style={styles.input}
                      placeholder="09"
                      value={dobDay}
                      onChangeText={(text) => {
                        // Only allow numbers and max 2 digits
                        const cleaned = text.replace(/[^0-9]/g, "").slice(0, 2);
                        // Validate day (1-31)
                        const dayNum = parseInt(cleaned);
                        if (cleaned === "" || (dayNum >= 1 && dayNum <= 31)) {
                          setDobDay(cleaned);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                      editable={!isSaving}
                    />
                  </View>

                  <View style={styles.halfWidth}>
                    <TextInput
                      style={styles.input}
                      placeholder="07"
                      value={dobMonth}
                      onChangeText={(text) => {
                        // Only allow numbers and max 2 digits
                        const cleaned = text.replace(/[^0-9]/g, "").slice(0, 2);
                        // Validate month (1-12)
                        const monthNum = parseInt(cleaned);
                        if (
                          cleaned === "" ||
                          (monthNum >= 1 && monthNum <= 12)
                        ) {
                          setDobMonth(cleaned);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                      editable={!isSaving}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={showGenderPicker}
                  disabled={isSaving}
                >
                  <Text style={styles.pickerButtonText}>{gender}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Marital Status</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={showMaritalStatusPicker}
                  disabled={isSaving}
                >
                  <Text style={styles.pickerButtonText}>{maritalStatus}</Text>
                  <Ionicons name="chevron-down" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Additional Information Section (Read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADDITIONAL INFORMATION</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Security ID</Text>
              <Text style={styles.input}>{resident.residentid}</Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 12,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#007AFF15",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  changePhotoText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: "#000",
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: "#000",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#000",
  },
  readOnlyField: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  readOnlyLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  readOnlyValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
