import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { ThemedText as Text } from "@/components/ThemedText";
import { Ionicons } from '@expo/vector-icons';

export interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (status: string | null, dateRange: any) => void;
    onReset: () => void;
    currentStatus: string | null;
    filterType?: 'status' | 'category';
}

export default function FilterModal({
    visible,
    onClose,
    onApply,
    onReset,
    currentStatus,
    filterType = 'status'
}: FilterModalProps) {
    // Mock data/state for now since complex date picker wasn't strictly requested to be fully functional vs UI
    const [selectedFilter, setSelectedFilter] = React.useState<string | null>(currentStatus);
    const [openDropdown, setOpenDropdown] = React.useState(false);

    React.useEffect(() => {
        setSelectedFilter(currentStatus);
    }, [currentStatus]);

    const handleApply = () => {
        onApply(selectedFilter, null);
        onClose();
    };

    const handleReset = () => {
        setSelectedFilter(null);
        onReset();
        onClose();
    };

    const getOptions = () => {
        if (filterType === 'category') {
            return ['All Categories', 'Mini', 'Medium', 'Large'];
        }
        return ['All Status', 'Active', 'Archived'];
    };

    const getDisplayValue = () => {
        if (!selectedFilter) return filterType === 'category' ? 'All Categories' : 'All Status';

        if (filterType === 'category') {
            return selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1);
        }

        return selectedFilter === 'active' ? 'Active' : 'Archived';
    };

    const handleSelectOption = (opt: string) => {
        if (opt === 'All Status' || opt === 'All Categories') {
            setSelectedFilter(null);
        } else {
            // Map display to value
            const val = opt.toLowerCase();
            setSelectedFilter(val);
        }
        setOpenDropdown(false);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ width: 40 }} />
                        <Text style={styles.title}>Filters</Text>
                        <TouchableOpacity onPress={handleReset}>
                            <Text style={styles.resetText}>Reset</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Filter Field */}
                    <View style={styles.fieldContainer}>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setOpenDropdown(!openDropdown)}
                        >
                            <Text style={styles.dropdownText}>
                                {getDisplayValue()}
                            </Text>
                            <Ionicons name={openDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                        </TouchableOpacity>

                        {openDropdown && (
                            <View style={styles.dropdownList}>
                                {getOptions().map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={styles.dropdownItem}
                                        onPress={() => handleSelectOption(opt)}
                                    >
                                        <Text style={styles.itemText}>{opt}</Text>
                                        {/* Checkmark Logic */}
                                        {((!selectedFilter && (opt === 'All Status' || opt === 'All Categories')) ||
                                            (selectedFilter && opt.toLowerCase() === selectedFilter.toLowerCase())) && (
                                                <Ionicons name="checkmark" size={16} color="#007AFF" />
                                            )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Date Range Row */}
                    {/* Visual only for now as requested UI match */}
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.dateButton, { flex: 2 }]}>
                            <Ionicons name="calendar-outline" size={18} color="#666" style={{ marginRight: 8 }} />
                            <Text style={styles.dateText}>Oct 18-Nov 18</Text>
                        </TouchableOpacity>

                        <View style={{ width: 12 }} />

                        <TouchableOpacity style={[styles.dateButton, { flex: 1, justifyContent: 'space-between' }]}>
                            <Text style={styles.dateText}>Monthly</Text>
                            <Ionicons name="chevron-down" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Apply Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>

                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        minHeight: 350,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#D1D5DB', // Gray-300
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    resetText: {
        fontSize: 16,
        color: '#007AFF', // Blue
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 20,
    },
    fieldContainer: {
        marginBottom: 16,
        zIndex: 10,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 14,
    },
    dropdownText: {
        fontSize: 16,
        color: '#374151',
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        marginTop: 4,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemText: {
        fontSize: 14,
        color: '#374151',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dateText: {
        fontSize: 14,
        color: '#374151',
    },
    footer: {
        marginTop: 'auto',
    },
    applyButton: {
        backgroundColor: '#111827', // Black/Dark
        paddingVertical: 16,
        borderRadius: 30, // Pill shape
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
