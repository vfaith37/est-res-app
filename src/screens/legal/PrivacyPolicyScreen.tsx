import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={48} color="#34C759" />
          </View>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.subtitle}>Last updated: January 2025</Text>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            This Privacy Policy describes how we collect, use, and protect your personal
            information when you use the Estate Management Application. We are committed to
            ensuring that your privacy is protected and your data is handled responsibly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect the following types of information:
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Personal Information:</Text> Name, email address, phone
            number, residential address
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Account Information:</Text> Username, password, user
            role, unit number
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Visitor Information:</Text> Visitor names, contact
            details, visit dates and purposes
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Household Information:</Text> Family member and
            domestic staff details
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Usage Data:</Text> App usage patterns, feature
            interactions, device information
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Payment Information:</Text> Payment history and status
            (payment processing is handled securely)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use your information to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide and maintain the application services</Text>
          <Text style={styles.bulletPoint}>• Manage visitor access and security</Text>
          <Text style={styles.bulletPoint}>• Process maintenance requests and emergencies</Text>
          <Text style={styles.bulletPoint}>• Send important notifications and announcements</Text>
          <Text style={styles.bulletPoint}>• Track payments and generate reports</Text>
          <Text style={styles.bulletPoint}>• Improve application functionality and user experience</Text>
          <Text style={styles.bulletPoint}>• Comply with legal and regulatory requirements</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your data with:
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Estate Management:</Text> To fulfill estate management
            and security purposes
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Security Personnel:</Text> For visitor verification and
            emergency response
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Service Providers:</Text> Third-party services that help
            us operate the application
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Legal Authorities:</Text> When required by law or to
            protect rights and safety
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information:
          </Text>
          <Text style={styles.bulletPoint}>• Encrypted data transmission (HTTPS/SSL)</Text>
          <Text style={styles.bulletPoint}>• Secure password storage with hashing</Text>
          <Text style={styles.bulletPoint}>• Regular security audits and updates</Text>
          <Text style={styles.bulletPoint}>• Access controls and authentication</Text>
          <Text style={styles.bulletPoint}>• Secure server infrastructure</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as necessary to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide services to you</Text>
          <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
          <Text style={styles.bulletPoint}>• Resolve disputes and enforce agreements</Text>
          <Text style={styles.paragraph}>
            When data is no longer needed, it is securely deleted or anonymized.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your personal data</Text>
          <Text style={styles.bulletPoint}>• Correct inaccurate information</Text>
          <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
          <Text style={styles.bulletPoint}>• Object to data processing</Text>
          <Text style={styles.bulletPoint}>• Withdraw consent at any time</Text>
          <Text style={styles.bulletPoint}>• Export your data in a portable format</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Cookies and Tracking</Text>
          <Text style={styles.paragraph}>
            We may use cookies and similar technologies to enhance your experience, analyze
            usage patterns, and maintain session information. You can control cookie settings
            through your device preferences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our application is not intended for children under 13 years of age. We do not
            knowingly collect personal information from children. If you believe we have
            collected information from a child, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Third-Party Links</Text>
          <Text style={styles.paragraph}>
            The application may contain links to third-party websites or services. We are not
            responsible for the privacy practices of these third parties. We encourage you to
            review their privacy policies.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Changes to Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of
            significant changes through the application or via email. Your continued use of the
            application after such changes constitutes acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or how we handle your data, please
            contact:
          </Text>
          <Text style={styles.bulletPoint}>• Estate Management Office</Text>
          <Text style={styles.bulletPoint}>• Email: privacy@estatemanagement.com</Text>
          <Text style={styles.bulletPoint}>• In-app support features</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            We are committed to protecting your privacy and handling your data with care and
            transparency.
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
    backgroundColor: '#34C75915',
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
  bold: {
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#34C75915',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#34C759',
    textAlign: 'center',
    fontWeight: '500',
  },
});
