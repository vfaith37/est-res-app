import React from 'react';
import { View, StyleSheet, Modal, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    visitorName: string;
    isRevoking: boolean;
};

export default function RevokeVisitorModal({ visible, onClose, onConfirm, visitorName, isRevoking }: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalRoot}>
                {/* Backdrop */}
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={onClose}
                />

                {/* Bottom Sheet */}
                <View style={styles.modalSheet}>
                    <View style={styles.sheetHandle} />

                    <Text style={styles.modalTitle}>
                        Are you sure you want to revoke this Guest ID for{' '}
                        <Text style={{ fontWeight: '700' }}>{visitorName}</Text>?
                    </Text>

                    <Text style={styles.modalSubText}>
                        They will no longer be able to use it to enter the estate, even if it's within the validity period.
                    </Text>

                    <Text style={styles.modalQuestion}>
                        Do you want to Revoke this Guest ID?
                    </Text>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.modalRevoke}
                            onPress={onConfirm}
                            disabled={isRevoking}
                        >
                            {isRevoking ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.modalRevokeText}>
                                    Yes, revoke
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={onClose}
                            disabled={isRevoking}
                        >
                            <Text style={styles.modalCancelText}>
                                No, cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalSheet: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 32,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D1D6',
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 12,
        color: '#1F2937',
        lineHeight: 26,
    },
    modalSubText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalQuestion: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 24,
        color: '#111827',
    },
    modalActions: {
        gap: 12,
    },
    modalRevoke: {
        height: 50,
        borderRadius: 25,
        backgroundColor: '#DC2626',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalRevokeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalCancel: {
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2563EB',
    },
});
