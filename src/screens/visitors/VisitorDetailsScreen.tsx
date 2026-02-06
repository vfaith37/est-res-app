import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { VisitorsStackParamList } from '@/types/navigation';
import { useGetVisitorByIdQuery, useRevokeVisitorMutation } from '@/store/api/visitorsApi';
import { haptics } from '@/utils/haptics';
import { format, parseISO } from 'date-fns';
import RevokeVisitorModal from '@/components/RevokeVisitorModal';

type VisitorDetailsScreenNavigationProp = NativeStackNavigationProp<
    VisitorsStackParamList,
    'VisitorDetails'
>;

type VisitorDetailsScreenRouteProp = RouteProp<
    VisitorsStackParamList,
    'VisitorDetails'
>;

type Props = {
    navigation: VisitorDetailsScreenNavigationProp;
};

export default function VisitorDetailsScreen({ navigation }: Props) {
    const route = useRoute<VisitorDetailsScreenRouteProp>();
    const { visitorId } = route.params;

    const { data: visitor, isLoading, refetch } = useGetVisitorByIdQuery(visitorId);
    const [revokeVisitor, { isLoading: isRevoking }] = useRevokeVisitorMutation();

    const [showRevokeModal, setShowRevokeModal] = useState(false);

    const handleEdit = () => {
        if (!visitor) return;
        haptics.medium();
        navigation.navigate('CreateVisitor', {
            mode: 'edit',
            initialType: visitor.type,
            visitor
        });
    };

    const handleRevoke = () => {
        if (!visitor) return;
        haptics.warning();
        setShowRevokeModal(true);
    };

    const handleShare = () => {
        if (!visitor) return;
        haptics.light();
        navigation.navigate('VisitorQR', { visitor });
    };

    const onConfirmRevoke = async () => {
        if (!visitor) return;
        try {
            await revokeVisitor({ tokenId: visitor.id }).unwrap();
            haptics.success();
            setShowRevokeModal(false);
            refetch();
        } catch (error) {
            haptics.error();
            // Optional: Show error toast or alert if needed, effectively handled by global error handler usually
            Alert.alert("Error", "Failed to revoke token");
        }
    };

    const getStatusStyle = (status: string = '') => {
        switch (status.toLowerCase()) {
            case 'un-used':
            case 'unused':
            case 'active':
                return { bg: '#DBEAFE', text: '#2563EB' }; // Blueish
            case 'pending':
                return { bg: '#FEF9C3', text: '#CA8A04' }; // Yellowish
            case 'in-use':
            case 'in use':
                return { bg: '#DBEAFE', text: '#2563EB' }; // Blueish
            case 'used':
            case 'completed':
                return { bg: '#DCFCE7', text: '#16A34A' }; // Greenish
            case 'revoked':
                return { bg: '#FEE2E2', text: '#DC2626' }; // Reddish
            case 'expired':
                return { bg: '#F3F4F6', text: '#4B5563' }; // Greyish
            default:
                return { bg: '#F3F4F6', text: '#4B5563' };
        }
    };

    const InfoItem = ({ label, value, isStatus }: { label: string; value: string | undefined, isStatus?: boolean }) => {
        if (isStatus && value) {
            const style = getStatusStyle(value);
            return (
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                        <Text style={[styles.statusText, { color: style.text }]}>{value}</Text>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'N/A'}</Text>
            </View>
        );
    };

    // Hide default header
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const Header = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>View Details</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </SafeAreaView>
        );
    }

    if (!visitor) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Header />
                <Text>Visitor details not found.</Text>
            </SafeAreaView>
        );
    }

    const isActionable = visitor.status !== 'Revoked' && visitor.status !== 'Expired' && visitor.status !== 'Used';

    // Dummy data for Resident Guest Status if assignedDays is empty/not formatted
    // The instructions say "strictly following image", so I will map assignedDays if present, 
    // or if the user wants the UI structure to be present I'll render the section.
    // Assuming assignedDays contains objects with gateIn, gateOut, timeIn, timeOut.
    const activityLog = visitor.assignedDays && visitor.assignedDays.length > 0
        ? visitor.assignedDays
        : [];

    // If we have single sign in/out data but no list, we could potentially show one card?
    // For now, I'll trust the component to render whatever is in activityLog.

    const isRevoked = visitor.status === 'Revoked';

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right', 'top']}>
            <Header />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Top Actions: Hide completely if Revoked per image (no buttons shown at top right either, though image cuts off header right) 
                   Actually image shows header "View Details" and back arrow. 
                   The "Actions" row with Share/Edit/Revoke is NOT in the image.
                   The user said "follow strictly".
                   If Revoked, I should probably hide the action row?
                   The image starts with "GUEST INFORMATION".
                   I will hide the action row if Revoked. Use `isActionable` logic which already exists but I'll make sure Share is also considered? 
                   The specific image shows NO actionable buttons.
                */}
                {!isRevoked && isActionable && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                            <Ionicons name="share-social" size={20} color="#374151" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.revokeBtn}
                            onPress={handleRevoke}
                            disabled={isRevoking}
                        >
                            <Text style={styles.revokeBtnText}>{isRevoking ? "..." : "Revoke"}</Text>
                        </TouchableOpacity>
                    </View>
                )}


                {/* GUEST INFORMATION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>GUEST INFORMATION</Text>

                    <View style={styles.grid}>
                        <InfoItem label="Status" value={visitor.status} isStatus />
                        <InfoItem label="Guest ID" value={visitor.id} />
                        <InfoItem label="Guest Name" value={visitor.name} />
                        <InfoItem label="Email Address" value={visitor.email} />
                        <InfoItem label="Phone Number" value={visitor.phone} />
                        <InfoItem label="Relationship" value={visitor.relationship || visitor.mainCategory} />
                        <InfoItem label="Gender" value={visitor.gender} />

                        <InfoItem
                            label="Duration Start"
                            value={visitor.durationStartDate ? format(parseISO(visitor.durationStartDate), 'dd/MM/yyyy hh:mm a') : undefined}
                        />
                        <InfoItem
                            label="Duration End"
                            value={visitor.durationEndDate ? format(parseISO(visitor.durationEndDate), 'dd/MM/yyyy hh:mm a') : undefined}
                        />
                        <InfoItem
                            label="Generated"
                            value={visitor.createdAt ? format(parseISO(visitor.createdAt), 'dd/MM/yyyy hh:mm a') : undefined}
                        />

                        {/* Date Revoked - Only if Revoked */}
                        {isRevoked && (
                            <View style={styles.infoItem}>
                                <Text style={[styles.infoLabel, { color: '#DC2626' }]}>Date Revoked</Text>
                                <Text style={[styles.infoValue, { color: '#DC2626' }]}>
                                    {visitor.revokedAt ? format(parseISO(visitor.revokedAt), 'dd/MM/yyyy hh:mm a') : '---'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* USAGE INFORMATION - Hide if Revoked */}
                {!isRevoked && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>USAGE INFORMATION</Text>
                        <View style={styles.grid}>
                            <InfoItem
                                label="Signed In"
                                value={visitor.signInTime ? format(parseISO(visitor.signInTime), 'dd/MM/yyyy hh:mm a') : '---'}
                            />
                            <InfoItem
                                label="Signed Out"
                                value={visitor.signOutTime ? format(parseISO(visitor.signOutTime), 'dd/MM/yyyy hh:mm a') : '---'}
                            />
                            <InfoItem label="Signed In By" value={visitor.signInBy || '---'} />
                            <InfoItem label="Signed Out By" value={visitor.signOutBy || '---'} />
                            <InfoItem label="Gate Signed In" value={visitor.signInGate || '---'} />
                            <InfoItem label="Gate Signed Out" value={visitor.signOutGate || '---'} />
                        </View>
                    </View>
                )}

                {/* Resident Guest Status (Log) - Hide if Revoked */}
                {!isRevoked && visitor.tokenType !== 'One-Off' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle2}>Resident Guest Status</Text>
                        {activityLog.map((log: any, index: number) => (
                            <View key={index} style={styles.logCard}>
                                <Text style={styles.logName}>{visitor.name}</Text>
                                <View style={styles.logRow}>
                                    <View>
                                        <Text style={styles.logLabel}>Gate In</Text>
                                        <Text style={styles.logValue}>{log.gateIn || 'Gate 1'}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.logLabel}>Time In</Text>
                                        <Text style={styles.logValue}>
                                            {log.timeIn ? format(parseISO(log.timeIn), 'dd/MM/yyyy hh:mm a') : '---'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.logRow, { marginTop: 12 }]}>
                                    <View>
                                        <Text style={styles.logLabel}>Gate Out</Text>
                                        <Text style={styles.logValue}>{log.gateOut || 'Gate 3'}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.logLabel}>Time Out</Text>
                                        <Text style={styles.logValue}>
                                            {log.timeOut ? format(parseISO(log.timeOut), 'dd/MM/yyyy hh:mm a') : '---'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                        {activityLog.length === 0 && (
                            <Text style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' }}>No activity history available.</Text>
                        )}
                    </View>
                )}

            </ScrollView>

            {/* Floating Action Button - Show for Revoked/Actionable? 
                Image shows it for Revoked. 
                Keep it.
            */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="alert-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <RevokeVisitorModal
                visible={showRevokeModal}
                onClose={() => setShowRevokeModal(false)}
                onConfirm={onConfirmRevoke}
                visitorName={visitor.name}
                isRevoking={isRevoking}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Or #F9FAFB based on image analysis, usually light gray background for cards to pop
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16, // Matches "View Details" usually smaller/standard in center
        fontWeight: '600',
        color: '#111827',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 80, // Space for FAB
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    shareBtn: {
        width: 48,
        height: 36,
        borderRadius: 20,
        // backgroundColor: '#F3F4F6',
        borderColor: '#E8E8EB',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // marginRight: 'auto', // Pushes other buttons to right? No, image has them all tight right? 
        // Image: Share (circle), Edit (Pill), Revoke (Pill). 
        // Let's keep them grouped.
        // marginRight: 0,
    },
    editBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderColor: '#E8E8EB',
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    editBtnText: {
        color: '#002EE5',
        fontWeight: '600',
        fontSize: 14,
    },
    revokeBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderColor: '#E8E8EB',
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    revokeBtnText: {
        color: '#DA3434',
        fontWeight: '600',
        fontSize: 14,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4B5563',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    sectionTitle2: {
        fontSize: 16, // Larger title for "Resident Guest Status"
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoItem: {
        width: '50%',
        marginBottom: 20,
        paddingRight: 10,
    },
    infoLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 6,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    logCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    logName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    logRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    logLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2,
    },
    logValue: {
        fontSize: 13,
        fontWeight: '400',
        color: '#374151',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    }
});
