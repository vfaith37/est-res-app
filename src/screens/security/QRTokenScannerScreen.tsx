import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ThemedText as Text } from "@/components/ThemedText";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useValidateVisitorTokenMutation } from "@/store/api/visitorsApi";
import { Visitor } from "@/store/api/visitorsApi";
import ValidatedVisitorBottomSheet from "@/components/ValidatedVisitorBottomSheet";
import { haptics } from "@/utils/haptics";

export default function QRTokenScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [validatedVisitor, setValidatedVisitor] = useState<Visitor | null>(
    null
  );
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [validateToken, { isLoading }] = useValidateVisitorTokenMutation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isLoading) return;

    setScanned(true);
    haptics.medium();

    try {
      // Extract token from QR code data
      // QR code might contain just the token or a JSON string with token
      let token = data;
      try {
        const parsed = JSON.parse(data);
        if (parsed.token || parsed.tok) {
          token = parsed.token || parsed.tok;
        }
      } catch {
        // data is already the token
      }

      const visitor = await validateToken({ token }).unwrap();
      haptics.success();
      setValidatedVisitor(visitor);
      setShowBottomSheet(true);
    } catch (error: any) {
      haptics.error();
      Alert.alert(
        "Validation Failed",
        error?.data?.message || "Invalid QR code or token has expired",
        [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );
    }
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setScanned(false);
    setValidatedVisitor(null);
  };

  const handleSuccess = () => {
    Alert.alert(
      "Success",
      `Visitor ${validatedVisitor?.status === "In-Use" ? "checked out" : "checked in"} successfully`,
      [
        {
          text: "OK",
          onPress: handleCloseBottomSheet,
        },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={64} color="#8E8E93" />
        <Text style={styles.messageText}>No access to camera</Text>
        <Text style={styles.subMessageText}>
          Please enable camera permission in settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan Visitor QR Code</Text>
        <Text style={styles.subtitle}>
          Position the QR code within the frame to scan
        </Text>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <View style={styles.overlay}>
            {/* Scan Frame */}
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            {/* Scan Status */}
            {scanned && (
              <View style={styles.scanStatus}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.scanStatusText}>QR Code Detected!</Text>
              </View>
            )}
          </View>
        </CameraView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {scanned && !showBottomSheet && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => {
              haptics.light();
              setScanned(false);
            }}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.rescanButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}

        {!scanned && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="qr-code-outline" size={32} color="#8E8E93" />
            <Text style={styles.instructionsText}>
              Align the QR code within the frame to scan
            </Text>
          </View>
        )}
      </View>

      {/* Validated Visitor Bottom Sheet */}
      <ValidatedVisitorBottomSheet
        visible={showBottomSheet}
        visitor={validatedVisitor}
        onClose={handleCloseBottomSheet}
        onSuccess={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 20,
    backgroundColor: "#F2F2F7",
  },
  header: {
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#007AFF",
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanStatus: {
    position: "absolute",
    bottom: -60,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(52, 199, 89, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  scanStatusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
  },
  rescanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
  },
  rescanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  instructionsContainer: {
    alignItems: "center",
    gap: 12,
  },
  instructionsText: {
    color: "#8E8E93",
    fontSize: 14,
    textAlign: "center",
  },
  messageText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  subMessageText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
});
