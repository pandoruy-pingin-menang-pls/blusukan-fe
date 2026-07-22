import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { adminService, AdminEvent } from "@/services/admin";
import { EventCardAdmin } from "@/components/admin/EventCardAdmin";
import { FontAwesome6 } from "@expo/vector-icons";

type FilterStatus = 'pending_review' | 'approved' | 'rejected' | 'all';

export default function AdminEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('pending_review');

  const fetchEvents = async () => {
    try {
      const data = await adminService.getEvents(filter === 'all' ? undefined : filter);
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch admin events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const tabs: { value: FilterStatus; label: string }[] = [
    { value: 'pending_review', label: 'Pending' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'rejected', label: 'Ditolak' },
    { value: 'all', label: 'Semua' },
  ];

  return (
    <View className="flex-1 bg-transparent">
      <View className="bg-white px-4 pt-4 pb-2 shadow-sm z-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-navy-900 font-display-semibold text-xl">Daftar Event</Text>
          <Pressable 
            className="bg-navy-900 w-8 h-8 rounded-full items-center justify-center"
            onPress={() => router.push("/(admin)/events/create")}
          >
            <FontAwesome6 name="plus" size={14} color="white" />
          </Pressable>
        </View>

        <View className="flex-row">
          {tabs.map((tab) => {
            const isActive = filter === tab.value;
            return (
              <Pressable
                key={tab.value}
                onPress={() => setFilter(tab.value)}
                className={`flex-1 items-center pb-3 border-b-2 ${
                  isActive ? "border-navy-900" : "border-transparent"
                }`}
              >
                <Text
                  className={`font-sans-medium text-sm ${
                    isActive ? "text-navy-900 font-sans-bold" : "text-ink-soft"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0F2A4A" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <EventCardAdmin 
              event={item} 
              onPress={() => router.push(`/(admin)/events/${item.id}/review` as any)} 
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0F2A4A" />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center pt-20">
              <FontAwesome6 name="calendar-xmark" size={48} color="#C7CFDA" />
              <Text className="text-ink-soft font-sans text-center mt-4 px-8">
                Tidak ada event dengan status ini.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
