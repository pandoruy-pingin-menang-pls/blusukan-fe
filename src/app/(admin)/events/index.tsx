import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, RefreshControl, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    <ImageBackground
      source={require("../../../../assets/batik-solo-overlay.png")}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.2 }}
      resizeMode="repeat"
    >
      <View className="flex-1 bg-surface/60">
        <View className="bg-white px-4 pt-4 shadow-sm z-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-navy-900 font-playfair font-semibold text-2xl">Daftar Event</Text>
            <Pressable 
              className="w-10 h-10 rounded-full bg-white items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => router.push("/(admin)/events/create")}
            >
              <FontAwesome6 name="plus" size={20} color="#22548C" />
            </Pressable>
          </View>

          <View className="flex-row gap-1">
            {tabs.map((tab) => {
              const isActive = filter === tab.value;
              
              let activeBgColor = "";
              if (isActive) {
                 if (tab.value === 'pending_review') activeBgColor = "#BA5E12";
                 if (tab.value === 'approved') activeBgColor = "#0F2A4A";
                 if (tab.value === 'rejected') activeBgColor = "#800000";
              }
              
              const TabContent = (
                <View 
                  className={`items-center justify-center rounded-t-xl ${isActive ? 'pt-3 pb-3' : 'pt-2 pb-2 mt-2'} ${!isActive ? 'bg-slate-100' : ''}`} 
                  style={isActive && tab.value !== 'all' ? { backgroundColor: activeBgColor } : {}}
                >
                  <Text className={`text-[11px] ${isActive ? "font-sans-bold text-white" : "font-sans-medium text-slate-500"}`}>
                    {tab.label}
                  </Text>
                </View>
              );

              return (
                <Pressable
                  key={tab.value}
                  onPress={() => setFilter(tab.value)}
                  className="flex-1"
                >
                  {isActive && tab.value === 'all' ? (
                    <LinearGradient
                      colors={["#0F2A4A", "#BA5E12"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="rounded-t-xl overflow-hidden"
                      style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                    >
                      {TabContent}
                    </LinearGradient>
                  ) : (
                    TabContent
                  )}
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
    </ImageBackground>
  );
}
