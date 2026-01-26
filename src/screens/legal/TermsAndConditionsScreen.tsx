import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TermsAndConditionsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={48} color="#007AFF" />
          </View>
          <Text style={styles.title}>Terms & Conditions</Text>
          <Text style={styles.subtitle}>Last updated: January 2025</Text>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using the Estate Management Application, you acknowledge that you
            have read, understood, and agree to be bound by these Terms and Conditions. If you
            do not agree to these terms, please do not use the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account. You agree to notify us
            immediately of any unauthorized use of your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Use of Services</Text>
          <Text style={styles.paragraph}>
            The application provides estate management services including but not limited to:
          </Text>
          <Text style={styles.bulletPoint}>• Visitor management and pass generation</Text>
          <Text style={styles.bulletPoint}>• Maintenance request submissions</Text>
          <Text style={styles.bulletPoint}>• Payment tracking and history</Text>
          <Text style={styles.bulletPoint}>• Emergency reporting</Text>
          <Text style={styles.bulletPoint}>• Household member management</Text>
          <Text style={styles.paragraph}>
            You agree to use these services only for their intended purposes and in compliance
            with all applicable laws and regulations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            Users must:
          </Text>
          <Text style={styles.bulletPoint}>• Provide accurate and up-to-date information</Text>
          <Text style={styles.bulletPoint}>• Maintain the security of their login credentials</Text>
          <Text style={styles.bulletPoint}>• Use the application responsibly and lawfully</Text>
          <Text style={styles.bulletPoint}>• Report any security concerns immediately</Text>
          <Text style={styles.bulletPoint}>• Respect the privacy of other residents</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Collection and Usage</Text>
          <Text style={styles.paragraph}>
            We collect and process personal data as outlined in our Privacy Policy. By using
            this application, you consent to such collection and processing in accordance with
            applicable data protection laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Visitor Management</Text>
          <Text style={styles.paragraph}>
            Resident users are responsible for the accuracy of visitor information they
            provide. The estate management reserves the right to deny entry to any visitor at
            its discretion for security purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Payment Terms</Text>
          <Text style={styles.paragraph}>
            All payments for estate services are due as specified in your resident agreement.
            Late payments may incur additional charges as per estate policy. Payment
            information displayed in the application is for informational purposes and should
            be verified with the estate management office.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            The application is provided "as is" without warranties of any kind. We shall not be
            liable for any direct, indirect, incidental, or consequential damages arising from
            your use of or inability to use the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Modifications to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Users will be notified of
            significant changes through the application. Continued use of the application after
            such modifications constitutes acceptance of the updated terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend access to the application for any
            user who violates these terms or engages in conduct that we deem inappropriate or
            harmful to other users or the estate community.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Governing Law</Text>
          <Text style={styles.paragraph}>
            These terms shall be governed by and construed in accordance with the laws of the
            jurisdiction in which the estate is located, without regard to its conflict of law
            provisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact the
            estate management office or reach out through the application's support features.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing to use this application, you acknowledge that you have read and
            understood these Terms and Conditions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#000',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    color: '#000',
    marginLeft: 16,
    marginBottom: 8,
  },
  footer: {
    backgroundColor: '#007AFF15',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
});
