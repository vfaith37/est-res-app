import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { Ionicons } from '@expo/vector-icons';

interface SuccessModalProps {
    visible: boolean;
    title: string;
    message: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryPress: () => void;
    onSecondaryPress?: () => void;
}

export default function SuccessModal({
    visible,
    title,
    message,
    primaryButtonText = 'Done',
    secondaryButtonText,
    onPrimaryPress,
    onSecondaryPress,
}: SuccessModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-sharp" size={40} color="#fff" />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {secondaryButtonText && (
                            <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryPress}>
                                <Ionicons name="add" size={20} color="#0044C0" />
                                <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
                            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        alignItems: 'center',
        paddingBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#22C55E', // Green-500
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        // Dashed border effect simulation using a library or SVG is better, but simple view for now
        borderWidth: 4,
        borderColor: '#DCFCE7', // Light green
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 16,
        lineHeight: 20,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#0044C0', // Blue
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    secondaryButtonText: {
        color: '#0044C0',
        fontSize: 16,
        fontWeight: '600',
    },
});
