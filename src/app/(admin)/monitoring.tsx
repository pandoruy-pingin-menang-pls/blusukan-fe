import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppStore } from "@/store/useAppStore";
import { getToken } from "@/utils/secureStore";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

type Activity = {
  id: string;
  user_id: string | null;
  role: string | null;
  action: string;
  endpoint: string;
  method: string;
  created_at: string;
};

const CustomBarChart = ({ data }: { data: Record<string, number> }) => {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <Text className="text-slate-500 font-sans text-center py-6">Belum ada aktivitas hari ini.</Text>;
  }
  
  const maxCount = Math.max(...entries.map(([, count]) => count), 1);
  const CHART_HEIGHT = 120;

  return (
    <View className="flex-row items-end justify-around h-[160px] pt-4">
      {entries.map(([role, count]) => {
        const heightPercent = (count / maxCount) * 100;
        return (
          <View key={role} className="items-center flex-1">
            <View className="w-full items-center justify-end" style={{ height: CHART_HEIGHT }}>
              <Text className="text-navy-900 font-sans-bold text-[10px] mb-1.5">{count}</Text>
              <View 
                className="w-10 bg-navy-800 rounded-t-lg" 
                style={{ height: `${heightPercent}%`, minHeight: 4 }} 
              />
            </View>
            <View className="flex-row items-center mt-3 mb-1">
              <FontAwesome6 name={role === 'admin' ? 'user-shield' : role === 'pedagang' ? 'store' : 'user'} size={10} color="#64748b" />
            </View>
            <Text className="text-slate-600 font-sans-semibold text-[10px] capitalize">{role}</Text>
          </View>
        );
      })}
    </View>
  );
};

const MethodBadge = ({ method }: { method: string }) => {
  let bgColor = "bg-slate-100";
  let textColor = "text-slate-600";
  
  switch(method.toUpperCase()) {
    case 'GET':
      bgColor = "bg-sky-50";
      textColor = "text-sky-700";
      break;
    case 'POST':
      bgColor = "bg-orange-50";
      textColor = "text-[#BA5E12]";
      break;
    case 'PUT':
    case 'PATCH':
      bgColor = "bg-indigo-50";
      textColor = "text-indigo-700";
      break;
    case 'DELETE':
      bgColor = "bg-navy-900";
      textColor = "text-white";
      break;
  }

  return (
    <View className={`${bgColor} px-2 py-0.5 rounded-md`}>
      <Text className={`${textColor} text-[9px] font-sans-bold tracking-wider`}>{method}</Text>
    </View>
  );
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
        axios.get(`${baseUrl}/api/admin/monitoring/activities?limit=15`, { headers })
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
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#14335A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
      <Text className="text-2xl font-sans-bold text-navy-900 mb-6">Activity Monitoring</Text>
      
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mb-3">
            <Ionicons name="people" size={16} color="#BA5E12" />
          </View>
          <Text className="text-slate-500 text-xs font-sans-medium mb-1">Active Users Today</Text>
          <Text className="text-3xl font-sans-bold text-navy-900">{stats?.active_users_today || 0}</Text>
        </View>
        <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <View className="w-8 h-8 rounded-full bg-navy-50 items-center justify-center mb-3">
            <Ionicons name="pulse" size={16} color="#14335A" />
          </View>
          <Text className="text-slate-500 text-xs font-sans-medium mb-1">Total Activities</Text>
          <Text className="text-3xl font-sans-bold text-navy-900">{stats?.total_activities_today || 0}</Text>
        </View>
      </View>
      
      <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-sans-bold text-navy-900">Distribution by Role</Text>
          <Ionicons name="bar-chart" size={18} color="#94a3b8" />
        </View>
        <CustomBarChart data={stats?.distribution_by_role || {}} />
      </View>

      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-sans-bold text-navy-900">Recent Activities</Text>
          <Ionicons name="time-outline" size={18} color="#94a3b8" />
        </View>
        <View className="space-y-4">
          {activities.map((act) => (
            <View key={act.id} className="flex-row items-start border-b border-slate-50 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
              <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center mr-3 mt-1">
                <FontAwesome6 name="bolt" size={12} color="#94a3b8" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-sans-bold text-navy-900 flex-1 pr-2" numberOfLines={1}>{act.action}</Text>
                  <MethodBadge method={act.method} />
                </View>
                <View className="flex-row items-center justify-between mt-1">
                  <Text className="text-[11px] font-sans text-slate-500 flex-1 pr-2" numberOfLines={1}>{act.endpoint}</Text>
                  <Text className="text-[10px] font-sans-medium text-slate-400">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {act.role && (
                  <View className="flex-row items-center mt-1.5">
                    <Text className="text-[10px] font-sans-semibold text-slate-400 uppercase tracking-wider">{act.role}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
          {activities.length === 0 && (
            <Text className="py-6 text-center text-slate-400 font-sans">Belum ada aktivitas terekam.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
