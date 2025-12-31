import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface StatItem {
    label: string;
    value: string | number;
}

interface ScreenHeaderWithStatsProps {
    title: string;
    onBack?: () => void;
    onAdd?: () => void;
    addButtonLabel?: string;
    stats: StatItem[];
    searchQuery: string;
    onSearchChange: (text: string) => void;
    onFilterPress?: () => void;
    buttonStyle?: object;
}

export default function ScreenHeaderWithStats({
    title,
    onBack,
    onAdd,
    addButtonLabel = 'Add',
    stats,
    searchQuery,
    onSearchChange,
    onFilterPress,
    buttonStyle,
}: ScreenHeaderWithStatsProps) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.headerTitle}>{title}</Text>
                {onAdd ? (
                    <TouchableOpacity onPress={onAdd} style={[styles.headerButton, buttonStyle]}>
                        <Text style={styles.headerButtonText}>{addButtonLabel}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerRightPlaceholder} />
                )}
            </View>

            <View style={styles.content}>
                {/* Stats Cards */}
                {stats.length > 0 && (
                    <View style={styles.statsContainer}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statsCard}>
                                <Text style={styles.statsLabel}>{stat.label}</Text>
                                <Text style={styles.statsValue}>{stat.value}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Search Bar */}
                <View style={[styles.searchContainer, { marginTop: stats.length === 0 ? 16 : 0 }]}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor="#8E8E93"
                            value={searchQuery}
                            onChangeText={onSearchChange}
                        />
                    </View>
                    {onFilterPress && (
                        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
                            <Ionicons name="funnel-outline" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerLeft: {
        width: 40,
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    headerButton: {
        minWidth: 60,
        height: 32,
        backgroundColor: '#0044C0',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    headerRightPlaceholder: {
        width: 40,
        // No background color
    },
    headerButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        paddingHorizontal: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 16,
    },
    statsCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        minHeight: 100,
        justifyContent: 'space-between',
    },
    statsLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
        lineHeight: 18,
    },
    statsValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginTop: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
});
