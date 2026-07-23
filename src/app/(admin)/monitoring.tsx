import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppStore } from "@/store/useAppStore";
import { getToken } from "@/utils/secureStore";
import { FontAwesome6 } from "@expo/vector-icons";

type Activity = {
  id: string;
  user_id: string | null;
  role: string | null;
  action: string;
  endpoint: string;
  method: string;
  created_at: string;
};

export default function MonitoringDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const token = await getToken("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
      
      const [statsRes, actRes] = await Promise.all([
        axios.get(`${baseUrl}/api/admin/monitoring/stats`, { headers }),
        axios.get(`${baseUrl}/api/admin/monitoring/activities?limit=10`, { headers })
      ]);
      
      setStats(statsRes.data);
      setActivities(actRes.data.activities);
    } catch (err) {
      console.error("Failed to fetch monitoring data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#14335A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-sans-bold text-navy-800 mb-4">Activity Monitoring</Text>
      
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1 bg-white p-4 rounded-xl border border-line">
          <Text className="text-ink-lighter text-xs font-sans-semibold mb-1">Active Users Today</Text>
          <Text className="text-2xl font-sans-bold text-navy-800">{stats?.active_users_today || 0}</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-xl border border-line">
          <Text className="text-ink-lighter text-xs font-sans-semibold mb-1">Total Activities</Text>
          <Text className="text-2xl font-sans-bold text-navy-800">{stats?.total_activities_today || 0}</Text>
        </View>
      </View>
      
      <Text className="text-sm font-sans-bold text-navy-800 mb-2 mt-2">Distribution by Role</Text>
      <View className="bg-white p-4 rounded-xl border border-line mb-6 flex-row justify-around">
        {Object.entries(stats?.distribution_by_role || {}).map(([role, count]) => (
          <View key={role} className="items-center">
             <View className="bg-blue-100 p-2 rounded-full mb-1">
                <FontAwesome6 name={role === 'admin' ? 'user-shield' : role === 'pedagang' ? 'store' : 'user'} size={16} color="#1e40af" />
             </View>
             <Text className="text-xs font-sans-semibold text-ink-base capitalize">{role}</Text>
             <Text className="text-lg font-sans-bold text-navy-800">{String(count)}</Text>
          </View>
        ))}
        {Object.keys(stats?.distribution_by_role || {}).length === 0 && (
          <Text className="text-ink-lighter">No activity today</Text>
        )}
      </View>

      <Text className="text-sm font-sans-bold text-navy-800 mb-2">Recent Activities</Text>
      <View className="bg-white rounded-xl border border-line p-2 mb-6">
        {activities.map((act) => (
          <View key={act.id} className="flex-row items-center border-b border-line p-2 last:border-b-0">
            <View className="bg-gray-100 p-2 rounded-full mr-3">
              <FontAwesome6 name="bolt" size={12} color="#64748b" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-semibold text-navy-800">{act.action}</Text>
              <Text className="text-xs text-ink-faint">{act.endpoint} • {act.role || 'unknown'}</Text>
            </View>
            <Text className="text-[10px] text-ink-lighter">
              {new Date(act.created_at).toLocaleTimeString()}
            </Text>
          </View>
        ))}
        {activities.length === 0 && (
          <Text className="p-4 text-center text-ink-lighter font-sans-medium">No recent activities</Text>
        )}
      </View>
    </ScrollView>
  );
}
