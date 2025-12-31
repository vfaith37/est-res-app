import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Pressable,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    visible: boolean;
    onClose: () => void;
    onContinue: (category: 'Casual' | 'Event') => void;
};

export default function GuestCategoryModal({ visible, onClose, onContinue }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<'Casual' | 'Event'>('Casual');
    const [isDropdownExpanded, setIsDropdownExpanded] = useState(false);

    const handleContinue = () => {
        onContinue(selectedCategory);
    };

    // Reset state when modal opens/closes if needed? 
    // For simplicity, we keep state. If we want to reset to Casual every open, we can use useEffect or just let it persist.
    // Persisting is fine for now.

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={onClose}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Type of Guest?</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.categoryContainer}>
                        <Text style={[styles.label, { marginBottom: 8 }]}>
                            Type of Guest <Text style={{ color: 'red' }}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setIsDropdownExpanded(!isDropdownExpanded)}
                        >
                            <Text style={styles.dropdownText}>
                                {selectedCategory === 'Casual'
                                    ? 'Casual Guests (for friends, family e.t.c.)'
                                    : 'Events Guests (for gatherings and events)'}
                            </Text>
                            <Ionicons name={isDropdownExpanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                        </TouchableOpacity>

                        {isDropdownExpanded && (
                            <View style={styles.dropdownList}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setSelectedCategory('Casual');
                                        setIsDropdownExpanded(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>Casual Guests (for friends, family e.t.c.)</Text>
                                    {selectedCategory === 'Casual' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setSelectedCategory('Event');
                                        setIsDropdownExpanded(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>Events Guests (for gatherings and events)</Text>
                                    {selectedCategory === 'Event' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.button} onPress={handleContinue}>
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        paddingTop: 30,
        paddingBottom: 50,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    label: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2,
        fontWeight: '500',
    },
    categoryContainer: {
        marginBottom: 20,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 8,
        padding: 14,
    },
    dropdownText: {
        fontSize: 16,
        color: '#000',
        flex: 1,
    },
    dropdownList: {
        marginTop: 4,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        overflow: 'hidden',
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#000',
    },
    modalFooter: {
        paddingTop: 16,
    },
    button: {
        backgroundColor: '#002EE5',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
