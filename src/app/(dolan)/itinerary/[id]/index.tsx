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
import { WebView } from "react-native-webview";
import { getToken } from "../../../../utils/secureStore";
import { Alert } from "../../../../components/ui/Alert";

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

export default function ItineraryResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [itinerary, setItinerary] = useState<ItineraryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

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
        setItinerary(data);
      } catch (err: any) {
        setError("Gagal memuat detail rute.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  const handleStart = async () => {
    if (!id || !itinerary) return;
    
    setIsStarting(true);
    setError("");

    try {
      const token = await getToken("access_token");
      await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/itineraries/${id}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update status lokal atau langsung redirect
      setItinerary({ ...itinerary, status: "in_progress" });
      
      // Redirect ke halaman progress
      router.push(`/(dolan)/itinerary/${id}/progress`);
      
    } catch (err: any) {
      setError("Gagal memulai perjalanan.");
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#22548C" />
        <Text className="font-sans text-navy-800 mt-4">Memuat rute...</Text>
      </View>
    );
  }

  if (error || !itinerary) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center p-6">
        <Alert message={error || "Data rute tidak ditemukan."} type="error" />
        <TouchableOpacity 
          className="mt-6 bg-navy-100 px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="font-sans-bold text-navy-800">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getMapHtml = () => {
    const waypointsStr = JSON.stringify(itinerary.waypoints);
    const geojsonStr = JSON.stringify(itinerary.route_geojson || null);

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
              body { padding: 0; margin: 0; }
              html, body, #map { height: 100%; width: 100%; }
              .custom-marker {
                  background-color: #ea580c;
                  color: white;
                  border-radius: 50%;
                  border: 2px solid white;
                  text-align: center;
                  font-weight: bold;
                  line-height: 24px;
                  font-size: 12px;
                  font-family: sans-serif;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
              var map = L.map('map', { zoomControl: false }).setView([-7.5666, 110.8166], 13);
              L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                  maxZoom: 19,
              }).addTo(map);

              var waypoints = ${waypointsStr};
              var geojson = ${geojsonStr};

              if (geojson) {
                  L.geoJSON(geojson, {
                      style: { color: '#22548C', weight: 4, opacity: 0.8 }
                  }).addTo(map);
              }

              var bounds = L.latLngBounds();
              waypoints.forEach(function(wp, i) {
                  var latLng = [wp.lat, wp.lon];
                  bounds.extend(latLng);

                  var icon = L.divIcon({
                      className: 'custom-marker',
                      html: '<div>' + (i + 1) + '</div>',
                      iconSize: [28, 28],
                      iconAnchor: [14, 14]
                  });

                  L.marker(latLng, { icon: icon }).addTo(map)
                      .bindPopup("<b>" + (i + 1) + ". " + wp.name + "</b><br>" + wp.category);
              });

              if (waypoints.length > 0) {
                  map.fitBounds(bounds, { padding: [30, 30] });
              }
          </script>
      </body>
      </html>
    `;
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 border-b border-slate-200 flex-row items-center gap-4 z-10">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-sans-bold text-navy-900 text-lg">
            Hasil Rute Dolan
          </Text>
          <Text className="font-sans text-ink-soft text-xs" numberOfLines={1}>
            {itinerary.raw_query}
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Map View */}
        <View className="w-full h-[250px] bg-slate-200">
          <WebView
            originWhitelist={['*']}
            source={{ html: getMapHtml() }}
            style={{ flex: 1 }}
            scrollEnabled={false}
          />
        </View>

        <View className="px-5 pt-6 pb-24">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="font-sans-bold text-navy-900 text-xl">Daftar Kunjungan</Text>
              <Text className="font-sans text-ink-soft text-sm mt-1">
                {itinerary.waypoints.length} lokasi tujuan
              </Text>
            </View>
            <View className="bg-orange-100 px-4 py-2 rounded-2xl items-center flex-row gap-1.5">
              <Ionicons name="time-outline" size={16} color="#BA5E12" />
              <Text className="font-sans-bold text-orange-800 text-sm">
                ~{itinerary.estimated_duration_minutes} mnt
              </Text>
            </View>
          </View>

          <Alert message={error} type="error" />

          {/* Waypoints List */}
          <View className="gap-4">
            {itinerary.waypoints.sort((a, b) => a.order - b.order).map((wp, index) => (
              <View key={wp.merchant_id + index} className="flex-row">
                <View className="items-center mr-4 mt-1 relative">
                  <View className="w-8 h-8 bg-navy-50 rounded-full items-center justify-center border border-navy-200 z-10">
                    <Text className="font-sans-bold text-navy-800">{index + 1}</Text>
                  </View>
                  {index < itinerary.waypoints.length - 1 && (
                    <View className="w-0.5 bg-slate-200 absolute top-8 bottom-[-24px]" />
                  )}
                </View>
                
                <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-sans-bold text-navy-900 text-lg flex-1 pr-2">
                      {wp.name}
                    </Text>
                    <View className="bg-slate-100 px-2 py-1 rounded-md">
                      <Text className="text-[10px] font-sans text-slate-600 uppercase tracking-wide">
                        {wp.category}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    className="flex-row items-center gap-1.5"
                    onPress={() => router.push(`/(dolan)/merchant/${wp.merchant_id}/catalog`)}
                  >
                    <Text className="font-sans-semibold text-navy-600 text-sm">Lihat Menu</Text>
                    <Ionicons name="chevron-forward" size={14} color="#22548C" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <TouchableOpacity 
          onPress={itinerary.status === "in_progress" ? () => router.push(`/(dolan)/itinerary/${id}/progress`) : handleStart}
          disabled={isStarting}
          activeOpacity={0.8}
          className={`w-full rounded-2xl py-4 items-center justify-center flex-row gap-2 ${
            itinerary.status === "in_progress" ? 'bg-orange-600' : 'bg-navy-900'
          }`}
        >
          {isStarting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name={itinerary.status === "in_progress" ? "map-outline" : "play"} size={20} color="white" />
              <Text className="font-sans-bold text-white text-[16px]">
                {itinerary.status === "in_progress" ? "Lanjutkan Dolan" : "Mulai Dolan"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
