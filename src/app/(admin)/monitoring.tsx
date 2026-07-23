import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

type EventLog = {
  id: string;
  name: string;
  category: string;
  status: string;
  priority: string;
  time: string;
};

const PERIODS = [
  { label: "Semua Waktu", value: "all" },
  { label: "Hari Ini", value: "today" },
  { label: "Minggu Ini", value: "week" },
  { label: "Bulan Ini", value: "month" }
];

const STATUSES = [
  { label: "Semua Status", value: "all" },
  { label: "Pending", value: "pending_review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" }
];

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
  const [impactMetrics, setImpactMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [period, setPeriod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  useEffect(() => {
    fetchEventLogs();
  }, [period, statusFilter]);

  const fetchEventLogs = async () => {
    try {
      setLoadingEvents(true);
      const token = await getToken("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
      
      let logsUrl = `${baseUrl}/api/admin/impact/action-logs?period=${period}`;
      if (statusFilter !== "all") {
        logsUrl += `&status=${statusFilter}`;
      }
      const logsRes = await axios.get(logsUrl, { headers });
      setEventLogs(logsRes.data.items || []);
    } catch (err) {
      console.error("Failed to fetch event logs", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleAction = (eventId: string, currentStatus: string) => {
    if (currentStatus !== 'pending_review') {
      Alert.alert("Info", "Event ini sudah selesai direview.");
      return;
    }

    Alert.alert(
      "Review Event",
      "Apakah Anda menyetujui atau menolak event ini?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Tolak", style: "destructive", onPress: () => submitReview(eventId, "rejected") },
        { text: "Setujui", style: "default", onPress: () => submitReview(eventId, "approved") }
      ]
    );
  };

  const submitReview = async (eventId: string, newStatus: string) => {
    try {
      const token = await getToken("access_token");
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
      await axios.patch(`${baseUrl}/api/admin/events/${eventId}/review`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Sukses", `Event berhasil di-${newStatus}`);
      fetchEventLogs();
      fetchMonitoringData();
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan review.");
    }
  };

  const fetchMonitoringData = async () => {
    try {
      const token = await getToken("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
      
      const [statsRes, actRes, impactRes] = await Promise.all([
        axios.get(`${baseUrl}/api/admin/monitoring/stats`, { headers }),
        axios.get(`${baseUrl}/api/admin/monitoring/activities?limit=15`, { headers }),
        axios.get(`${baseUrl}/api/admin/impact/metrics`, { headers })
      ]);
      
      setStats(statsRes.data);
      setActivities(actRes.data.activities);
      setImpactMetrics(impactRes.data);
    } catch (err) {
      console.error("Failed to fetch monitoring data", err);
    } finally {
      setLoading(false);
    }
  };

  const renderConditionAlert = () => {
    if (!impactMetrics) return null;
    const isWarning = impactMetrics.condition === "Perlu Perhatian";
    return (
      <View className={`p-5 rounded-2xl shadow-sm border mb-6 ${isWarning ? 'bg-orange-50 border-orange-100' : 'bg-navy-50 border-navy-100'}`}>
        <View className="flex-row items-center mb-2">
          <FontAwesome6 name={isWarning ? "triangle-exclamation" : "circle-check"} size={16} color={isWarning ? "#BA5E12" : "#14335A"} />
          <Text className={`ml-2 font-sans-bold text-base ${isWarning ? 'text-[#BA5E12]' : 'text-navy-900'}`}>
            Kondisi: {impactMetrics.condition}
          </Text>
        </View>
        <Text className={`text-sm font-sans leading-5 ${isWarning ? 'text-orange-900/80' : 'text-navy-800'}`}>
          {impactMetrics.recommendation}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#14335A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <LinearGradient
        colors={['#1E3A8A', '#0F2A4A']}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 180,
          zIndex: 0,
          overflow: "hidden"
        }}
      >
        <ImageBackground 
          source={require("../../../assets/edit-profile-wave.png")}
          style={{ width: '100%', height: '100%' }}
          imageStyle={{ opacity: 0.3 }}
          resizeMode="cover"
        />
      </LinearGradient>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100, paddingTop: 120 }}>
        <Text className="text-[32px] font-playfair font-semibold tracking-wide text-white mb-6">Smart Monitoring Dashboard</Text>
      
      {/* Smart Impact Alert */}
      {renderConditionAlert()}

      {/* Smart Impact Metrics */}
      <View className="flex-row flex-wrap justify-between mb-2">
        {impactMetrics?.metrics?.map((m: any, i: number) => (
          <View key={i} className="w-[48%] bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <Text className="text-slate-500 text-xs font-sans-medium mb-1.5" numberOfLines={2}>{m.label}</Text>
            <Text className="text-2xl font-sans-bold text-navy-900">{m.value}</Text>
          </View>
        ))}
      </View>
      
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <View className="mb-3">
            <Ionicons name="people" size={24} color="#BA5E12" />
          </View>
          <Text className="text-slate-500 text-xs font-sans-medium mb-1">Active Users Today</Text>
          <Text className="text-3xl font-sans-bold text-navy-900">{stats?.active_users_today || 0}</Text>
        </View>
        <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <View className="mb-3">
            <Ionicons name="pulse" size={24} color="#14335A" />
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

      {/* Action Logs (Event Logs) */}
      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
        <View className="flex-row items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <Text className="text-base font-sans-bold text-navy-900">Event Action Logs</Text>
          <Ionicons name="list-outline" size={18} color="#94a3b8" />
        </View>

        {/* Filters */}
        <View className="mb-6 space-y-3">
          <View className="flex-row flex-wrap gap-2">
            {PERIODS.map(p => (
              <Pressable 
                key={p.value}
                onPress={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-full border ${period === p.value ? 'bg-navy-900 border-navy-900' : 'bg-white border-slate-200'}`}
              >
                <Text className={`text-[11px] font-sans-medium ${period === p.value ? 'text-white' : 'text-slate-600'}`}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-row flex-wrap gap-2">
            {STATUSES.map(s => (
              <Pressable 
                key={s.value}
                onPress={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 rounded-full border ${statusFilter === s.value ? 'bg-navy-900 border-navy-900' : 'bg-white border-slate-200'}`}
              >
                <Text className={`text-[11px] font-sans-medium ${statusFilter === s.value ? 'text-white' : 'text-slate-600'}`}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {loadingEvents ? (
          <View className="py-8">
             <ActivityIndicator size="small" color="#14335A" />
          </View>
        ) : (
          <View className="mt-2">
            {eventLogs.map((log) => (
              <View key={log.id} className="border-b border-slate-50 py-4 last:border-0 flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-start justify-between mb-1">
                    <Text className="font-sans-bold text-navy-900 text-sm flex-1 pr-2" numberOfLines={1}>{log.name}</Text>
                    <View className={`px-2 py-0.5 rounded-md ${log.status === 'pending_review' ? 'bg-orange-50' : log.status === 'approved' ? 'bg-sky-50' : 'bg-slate-100'}`}>
                      <Text className={`text-[9px] font-sans-bold tracking-wider capitalize ${log.status === 'pending_review' ? 'text-[#BA5E12]' : log.status === 'approved' ? 'text-sky-700' : 'text-slate-600'}`}>
                        {log.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mb-1.5 gap-2">
                    <Text className="text-[11px] font-sans text-slate-500">Kategori: <Text className="font-sans-medium text-slate-700 capitalize">{log.category}</Text></Text>
                    <View className={`px-1.5 py-0.5 rounded ${log.priority === 'High' ? 'bg-orange-50' : 'bg-slate-100'}`}>
                       <Text className={`text-[9px] font-sans-semibold ${log.priority === 'High' ? 'text-[#BA5E12]' : 'text-slate-500'}`}>Prioritas: {log.priority}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={12} color="#94a3b8" />
                    <Text className="text-[10px] font-sans-medium text-slate-400 ml-1">{new Date(log.time).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                  </View>
                </View>
                <View>
                   <Pressable 
                     onPress={() => handleAction(log.id, log.status)}
                     className={`px-3 py-2 rounded-lg ${log.status === 'pending_review' ? 'bg-navy-900' : 'bg-slate-100'}`}
                   >
                     <Text className={`text-xs font-sans-semibold ${log.status === 'pending_review' ? 'text-white' : 'text-slate-400'}`}>Aksi</Text>
                   </Pressable>
                </View>
              </View>
            ))}
            {eventLogs.length === 0 && (
              <Text className="text-center text-slate-400 font-sans py-8">Tidak ada data ditemukan</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
    </View>
  );
}
