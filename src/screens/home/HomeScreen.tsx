import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useAppSelector } from "@/store/hooks";
import {
  useGetPendingPaymentsQuery,
  useGetPaymentsQuery,
} from "@/store/api/paymentsApi";
import { useGetVisitorsQuery } from "@/store/api/visitorsApi";
import { useGetMaintenanceRequestsQuery } from "@/store/api/maintenanceApi";
import { useGetNotificationsQuery } from "@/store/api/notificationsApi";
import { haptics } from "@/utils/haptics";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }: any) {
  const user = useAppSelector((state) => state.auth.user);

  console.log(user);

  const {
    data: pendingPayments,
    refetch: refetchPayments,
    isFetching: isFetchingPayments,
  } = useGetPendingPaymentsQuery();

  const { data: allPayments, refetch: refetchAllPayments } =
    useGetPaymentsQuery({ limit: 100 });

  const {
    data: allVisitors,
    refetch: refetchVisitors,
    isFetching: isFetchingVisitors,
  } = useGetVisitorsQuery(user?.residentId || "");

  const {
    data: maintenanceRequests,
    refetch: refetchMaintenance,
    isFetching: isFetchingMaintenance,
  } = useGetMaintenanceRequestsQuery({ status: "pending" });

  const { data: unreadCount } = useGetNotificationsQuery({ unreadOnly: true });

  // Filter upcoming visitors (Un-Used status and future dates)
  const upcomingVisitors = allVisitors
    ? allVisitors
        .filter((visitor) => {
          const visitDate = new Date(visitor.visitDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return visitor.status === "Un-Used" && visitDate >= today;
        })
        .slice(0, 5)
    : [];

  const handleRefresh = () => {
    haptics.light();
    refetchPayments();
    refetchAllPayments();
    refetchVisitors();
    refetchMaintenance();
  };

  const isRefreshing =
    isFetchingPayments || isFetchingVisitors || isFetchingMaintenance;
  console.log(allPayments);

  // Calculate payment trends for last 6 months
  const getPaymentTrends = () => {
    if (allPayments === undefined) return { labels: [], data: [] };

    const now = new Date();
    const monthlyData: { [key: string]: number } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });
      monthlyData[monthKey] = 0;
    }

    // Sum up payments by month
    allPayments.length > 1 &&
      allPayments.forEach((payment) => {
        if (payment.status === "paid" && payment.paidDate) {
          const paidDate = new Date(payment.paidDate);
          const monthKey = paidDate.toLocaleDateString("en-US", {
            month: "short",
          });
          if (monthlyData.hasOwnProperty(monthKey)) {
            monthlyData[monthKey] += payment.amount;
          }
        }
      });

    return {
      labels: Object.keys(monthlyData),
      data: Object.values(monthlyData),
    };
  };

  const paymentTrends = getPaymentTrends();

  // Get recent payments (last 3)
  const recentPayments = Array.isArray(allPayments)
    ? allPayments
        .filter((p) => p.status === "paid")
        .sort(
          (a, b) =>
            new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
        )
        .slice(0, 3)
    : [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name}!</Text>
            <Text style={styles.unit}>Unit {user?.unit}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
            {unreadCount && unreadCount.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#007AFF" />
            <Text style={styles.statNumber}>
              {upcomingVisitors?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Upcoming Visitors</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="build-outline" size={24} color="#FF9500" />
            <Text style={styles.statNumber}>
              {maintenanceRequests?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Pending Issues</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="card-outline" size={24} color="#FF3B30" />
            <Text style={styles.statNumber}>
              {pendingPayments?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Due Payments</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            {user?.role !== "security" && (
              <>
                <QuickActionCard
                  icon="person-add-outline"
                  title="New Visitor"
                  color="#007AFF"
                  onPress={() => {
                    haptics.medium();
                    navigation.navigate("Visitors", {
                      screen: "CreateVisitor",
                    });
                  }}
                />
                {user?.role === "home_head" && (
                  <>
                    <QuickActionCard
                      icon="build-outline"
                      title="Report Issue"
                      color="#FF9500"
                      onPress={() => {
                        haptics.medium();
                        navigation.navigate("Maintenance", {
                          screen: "ReportIssue",
                        });
                      }}
                    />
                    <QuickActionCard
                      icon="card-outline"
                      title="Pay Bills"
                      color="#34C759"
                      onPress={() => {
                        haptics.medium();
                        navigation.navigate("Payments");
                      }}
                    />
                  </>
                )}
                <QuickActionCard
                  icon="alert-circle-outline"
                  title="Emergency"
                  color="#FF3B30"
                  onPress={() => {
                    haptics.heavy();
                    navigation.navigate("Emergency", {
                      screen: "ReportEmergency",
                    });
                  }}
                />
              </>
            )}

            {user?.role === "security" && (
              <>
                <QuickActionCard
                  icon="qr-code-outline"
                  title="Scan QR"
                  color="#007AFF"
                  onPress={() => {
                    haptics.medium();
                    navigation.navigate("Visitors", {
                      screen: "QRScanner",
                    });
                  }}
                />
                <QuickActionCard
                  icon="keypad-outline"
                  title="Manual Entry"
                  color="#5856D6"
                  onPress={() => {
                    haptics.medium();
                    navigation.navigate("Visitors", {
                      screen: "QRScanner",
                    });
                  }}
                />
                <QuickActionCard
                  icon="alert-circle-outline"
                  title="Report Incident"
                  color="#FF3B30"
                  onPress={() => {
                    haptics.heavy();
                    navigation.navigate("Incidents", {
                      screen: "ReportEmergency",
                    });
                  }}
                />
              </>
            )}
          </View>
        </View>

        {/* Payment Trends Chart */}
        {user?.role !== "security" && paymentTrends.data.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Trends</Text>
              <Text style={styles.sectionSubtitle}>Last 6 months</Text>
            </View>

            <View style={styles.chartContainer}>
              {(() => {
                interface BarChartDataset {
                  data: number[];
                }
                interface BarChartData {
                  labels: string[];
                  datasets: BarChartDataset[];
                }
                interface ChartConfigType {
                  backgroundColor: string;
                  backgroundGradientFrom: string;
                  backgroundGradientTo: string;
                  decimalPlaces: number;
                  color: (opacity?: number) => string;
                  labelColor: (opacity?: number) => string;
                  style: { borderRadius: number };
                  barPercentage: number;
                  propsForBackgroundLines: {
                    strokeWidth: number;
                    stroke: string;
                    strokeDasharray: string;
                  };
                }

                const chartData: BarChartData = {
                  labels: paymentTrends.labels,
                  datasets: [{ data: paymentTrends.data }],
                };

                const chartConfig: ChartConfigType = {
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  barPercentage: 0.7,
                  propsForBackgroundLines: {
                    strokeWidth: 1,
                    stroke: "#E5E5EA",
                    strokeDasharray: "0",
                  },
                };

                return (
                  <BarChart
                    data={chartData}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel="₦"
                    yAxisSuffix="k"
                    fromZero
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars
                  />
                );
              })()}
            </View>
          </View>
        )}

        {/* Recent Payments */}
        {user?.role !== "security" && recentPayments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Payments</Text>
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  navigation.navigate("Payments");
                }}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {recentPayments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View
                  style={[
                    styles.paymentIcon,
                    { backgroundColor: getPaymentTypeColor(payment.type) },
                  ]}
                >
                  <Ionicons
                    name={getPaymentTypeIcon(payment.type)}
                    size={20}
                    color="#fff"
                  />
                </View>

                <View style={styles.paymentContent}>
                  <Text style={styles.paymentTitle}>{payment.description}</Text>
                  <Text style={styles.paymentDate}>
                    Paid on {new Date(payment.paidDate!).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>
                    ₦{payment.amount.toLocaleString()}
                  </Text>
                  <View style={styles.paidBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#34C759"
                    />
                    <Text style={styles.paidText}>Paid</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity - Only for non-security */}
        {user?.role !== "security" &&
          upcomingVisitors &&
          upcomingVisitors.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Visitors</Text>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    navigation.navigate("Visitors");
                  }}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {upcomingVisitors.slice(0, 3).map((visitor) => (
                <TouchableOpacity
                  key={visitor.id}
                  style={styles.activityCard}
                  onPress={() => {
                    haptics.light();
                    navigation.navigate("Visitors", {
                      screen: "VisitorQR",
                      params: { visitorId: visitor.id },
                    });
                  }}
                >
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={visitor.type === "guest" ? "person" : "people"}
                      size={20}
                      color="#007AFF"
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{visitor.name}</Text>
                    <Text style={styles.activitySubtitle}>
                      {new Date(visitor.visitDate).toLocaleDateString()}
                      {visitor.departureDate && ` - ${new Date(visitor.departureDate).toLocaleDateString()}`}
                    </Text>
                    <Text style={styles.activityType}>
                      {visitor.type === "guest" ? "Guest" : "Visitor"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>
              ))}
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickActionCard({ icon, title, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function getPaymentTypeIcon(type: string) {
  const icons: any = {
    service_charge: "home",
    utility: "flash",
    amenity: "fitness",
    fine: "warning",
    other: "card",
  };
  return icons[type] || "card";
}

function getPaymentTypeColor(type: string) {
  const colors: any = {
    service_charge: "#007AFF",
    utility: "#FF9500",
    amenity: "#34C759",
    fine: "#FF3B30",
    other: "#8E8E93",
  };
  return colors[type] || "#8E8E93";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 14,
    color: "#8E8E93",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  unit: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  chart: {
    borderRadius: 16,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  paymentRight: {
    alignItems: "flex-end",
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  paidText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  activitySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  activityType: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 2,
  },
});
