import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { getToken } from "../../../../utils/secureStore";
import { Alert } from "../../../../components/ui/Alert";
import MapView, { Marker, Geojson, PROVIDER_DEFAULT } from "react-native-maps";

type Waypoint = {
  merchant_id: string;
  name: string;
  lat: number;
  lon: number;
  score: number;
  order: number;
  category: string;
  predicted_stock: number;
};

type ItineraryDetail = {
  id: string;
  user_id: string;
  raw_query: string;
  waypoints: Waypoint[];
  route_geojson: any;
  estimated_duration_minutes: number;
  status: string;
};

export default function ItineraryProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [itinerary, setItinerary] = useState<ItineraryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Local state untuk tracking kunjungan
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchItinerary = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const token = await getToken("access_token");
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/itineraries/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Urutkan waypoint
        data.waypoints.sort((a: Waypoint, b: Waypoint) => a.order - b.order);
        setItinerary(data);
      } catch (err: any) {
        setError("Gagal memuat rute perjalanan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  const handleNextWaypoint = () => {
    if (!itinerary) return;
    if (currentIndex < itinerary.waypoints.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Selesai
      router.replace(`/(dolan)/itinerary`);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="font-sans text-white mt-4">Memuat navigasi...</Text>
      </View>
    );
  }

  if (error || !itinerary) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center p-6">
        <Alert message={error || "Data rute tidak ditemukan."} type="error" />
        <TouchableOpacity 
          className="mt-6 bg-white px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="font-sans-bold text-slate-900">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentWaypoint = itinerary.waypoints[currentIndex];
  const isFinished = currentIndex >= itinerary.waypoints.length;

  if (isFinished || !currentWaypoint) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center p-6">
        <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
        <Text className="font-sans-bold text-white text-2xl mt-4">Dolan Selesai!</Text>
        <Text className="font-sans text-slate-300 mt-2 text-center">
          Semoga jalan-jalanmu menyenangkan!
        </Text>
        <TouchableOpacity 
          className="mt-8 bg-orange-600 px-8 py-3.5 rounded-full"
          onPress={() => router.replace(`/(dolan)/itinerary`)}
        >
          <Text className="font-sans-bold text-white text-[16px]">Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      {/* Peta Background */}
      <View className="absolute top-0 left-0 right-0 bottom-[240px]">
        <MapView 
          provider={PROVIDER_DEFAULT}
          style={{ width: '100%', height: '100%' }}
          initialRegion={{
            latitude: currentWaypoint.lat,
            longitude: currentWaypoint.lon,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          region={{
            latitude: currentWaypoint.lat,
            longitude: currentWaypoint.lon,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {itinerary.route_geojson && (
            <Geojson 
              geojson={itinerary.route_geojson} 
              strokeColor="#22548C" 
              strokeWidth={5} 
            />
          )}
          
          <Marker
            coordinate={{ latitude: currentWaypoint.lat, longitude: currentWaypoint.lon }}
            title={`Tujuan: ${currentWaypoint.name}`}
          >
            <View className="bg-orange-600 p-2 rounded-full border-2 border-white shadow-md">
              <Ionicons name="location" size={24} color="white" />
            </View>
          </Marker>
        </MapView>
      </View>

      {/* Header Overlay */}
      <View className="absolute top-12 left-5 right-5 flex-row justify-between items-center z-10">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="close" size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <View className="bg-navy-900/90 px-4 py-2 rounded-full border border-navy-700 shadow-sm">
          <Text className="font-sans-bold text-white text-sm">
            Tujuan {currentIndex + 1} dari {itinerary.waypoints.length}
          </Text>
        </View>
      </View>

      {/* Bottom Sheet Modal-like View */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] px-6 pt-6 pb-10 shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.15)] h-[260px] justify-between">
        <View>
          <View className="flex-row items-center gap-2 mb-2">
            <View className="bg-orange-100 px-2.5 py-1 rounded-md">
              <Text className="text-[10px] font-sans-bold text-orange-800 uppercase tracking-wide">
                LOKASI SAAT INI
              </Text>
            </View>
            <Text className="text-xs font-sans text-slate-500">
              {currentWaypoint.category}
            </Text>
          </View>
          
          <Text className="font-sans-bold text-navy-900 text-2xl" numberOfLines={2}>
            {currentWaypoint.name}
          </Text>

          <TouchableOpacity 
            className="flex-row items-center gap-1.5 mt-3 self-start bg-slate-100 px-3 py-1.5 rounded-full"
            onPress={() => router.push(`/(dolan)/merchant/${currentWaypoint.merchant_id}/catalog`)}
          >
            <Ionicons name="restaurant-outline" size={14} color="#22548C" />
            <Text className="font-sans-semibold text-navy-700 text-sm">Lihat Katalog Menu</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleNextWaypoint}
          activeOpacity={0.8}
          className="w-full bg-navy-900 rounded-2xl py-4 items-center justify-center flex-row gap-2 mt-auto"
        >
          <Ionicons name={currentIndex < itinerary.waypoints.length - 1 ? "checkmark-done-circle" : "flag"} size={20} color="white" />
          <Text className="font-sans-bold text-white text-[16px]">
            {currentIndex < itinerary.waypoints.length - 1 ? "Sudah Sampai, Lanjut Rute!" : "Selesaikan Dolan"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
