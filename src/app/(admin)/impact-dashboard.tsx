import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "@/utils/secureStore";
import { FontAwesome6 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

type ActionLog = {
  id: string;
  name: string;
  category: string;
  status: string;
  priority: string;
  time: string;
};

export default function ImpactDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [period, setPeriod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [period, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
      
      const metricsRes = await axios.get(`${baseUrl}/api/admin/impact/metrics`, { headers });
      setMetrics(metricsRes.data);
      
      let logsUrl = `${baseUrl}/api/admin/impact/action-logs?period=${period}`;
      if (statusFilter !== "all") {
        logsUrl += `&status=${statusFilter}`;
      }
      const logsRes = await axios.get(logsUrl, { headers });
      setLogs(logsRes.data.items);
      
    } catch (err) {
      console.error("Failed to fetch impact data", err);
    } finally {
      setLoading(false);
    }
  };

  const renderConditionAlert = () => {
    if (!metrics) return null;
    const isWarning = metrics.condition === "Perlu Perhatian";
    return (
      <View className={`p-4 rounded-xl mb-4 border ${isWarning ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <View className="flex-row items-center mb-1">
          <FontAwesome6 name={isWarning ? "triangle-exclamation" : "circle-check"} size={16} color={isWarning ? "#d97706" : "#059669"} />
          <Text className={`ml-2 font-sans-bold ${isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
            Kondisi: {metrics.condition}
          </Text>
        </View>
        <Text className={`text-sm ${isWarning ? 'text-amber-800' : 'text-emerald-800'}`}>
          {metrics.recommendation}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-sans-bold text-navy-800 mb-4">Smart Impact Dashboard</Text>
      
      {renderConditionAlert()}

      <View className="flex-row flex-wrap justify-between mb-4">
        {metrics?.metrics?.map((m: any, i: number) => (
          <View key={i} className="w-[48%] bg-white p-4 rounded-xl border border-line mb-3">
            <Text className="text-ink-lighter text-xs font-sans-semibold mb-1" numberOfLines={1}>{m.label}</Text>
            <Text className="text-xl font-sans-bold text-navy-800">{m.value}</Text>
          </View>
        ))}
      </View>

      <View className="bg-white rounded-xl border border-line p-4 mb-6">
        <View className="flex-row justify-between items-center border-b border-line pb-2 mb-2">
          <Text className="font-sans-bold text-navy-800">Action Logs</Text>
        </View>

        {/* Filters */}
        <View className="flex-row gap-2 mb-4 z-10">
          <View className="flex-1 border border-line rounded-lg overflow-hidden bg-surface">
            <Picker
              selectedValue={period}
              onValueChange={(val) => setPeriod(val)}
              style={{ height: 40 }}
            >
              <Picker.Item label="Semua Waktu" value="all" />
              <Picker.Item label="Hari Ini" value="today" />
              <Picker.Item label="Minggu Ini" value="week" />
              <Picker.Item label="Bulan Ini" value="month" />
            </Picker>
          </View>
          <View className="flex-1 border border-line rounded-lg overflow-hidden bg-surface">
            <Picker
              selectedValue={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
              style={{ height: 40 }}
            >
              <Picker.Item label="Semua Status" value="all" />
              <Picker.Item label="Pending" value="pending_review" />
              <Picker.Item label="Approved" value="approved" />
              <Picker.Item label="Rejected" value="rejected" />
            </Picker>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#14335A" className="my-4" />
        ) : (
          <View>
            {logs.map((log) => (
              <View key={log.id} className="border-b border-line py-3 last:border-0 flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                  <Text className="font-sans-bold text-navy-800 text-sm">{log.name}</Text>
                  <Text className="text-xs text-ink-base mt-1">Kategori: {log.category}</Text>
                  <View className="flex-row items-center mt-1">
                    <View className={`px-2 py-0.5 rounded-full ${log.status === 'pending_review' ? 'bg-amber-100' : log.status === 'approved' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      <Text className={`text-[10px] font-sans-bold capitalize ${log.status === 'pending_review' ? 'text-amber-700' : log.status === 'approved' ? 'text-emerald-700' : 'text-red-700'}`}>{log.status}</Text>
                    </View>
                    <Text className="text-[10px] text-ink-lighter ml-2">{new Date(log.time).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View>
                   <Pressable className="bg-navy-800 px-3 py-1.5 rounded-lg">
                     <Text className="text-white text-xs font-sans-semibold">Aksi</Text>
                   </Pressable>
                </View>
              </View>
            ))}
            {logs.length === 0 && (
              <Text className="text-center text-ink-lighter font-sans-medium py-4">Tidak ada data ditemukan</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
