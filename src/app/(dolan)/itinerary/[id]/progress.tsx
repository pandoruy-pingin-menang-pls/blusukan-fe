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
import { WebView } from "react-native-webview";
import { useRef } from "react";

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
  const webviewRef = useRef<WebView>(null);

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
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      const nextWp = itinerary.waypoints[nextIndex];
      if (webviewRef.current && nextWp) {
        // Pindahkan peta ke lokasi waypoint berikutnya
        const js = `map.flyTo([${nextWp.lat}, ${nextWp.lon}], 16); true;`;
        webviewRef.current.injectJavaScript(js);
      }
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

  const getMapHtml = () => {
    const geojsonStr = JSON.stringify(itinerary.route_geojson || null);
    
    // Bikin marker statis (semua wp abu-abu kecil, wp saat ini oranye besar)
    const waypointsStr = JSON.stringify(itinerary.waypoints);
    
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
              .marker-active {
                  background-color: #ea580c;
                  color: white;
                  border-radius: 50%;
                  border: 3px solid white;
                  text-align: center;
                  font-weight: bold;
                  line-height: 32px;
                  font-size: 14px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              }
              .marker-inactive {
                  background-color: #94a3b8;
                  color: white;
                  border-radius: 50%;
                  border: 2px solid white;
                  text-align: center;
                  font-weight: bold;
                  line-height: 20px;
                  font-size: 10px;
              }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
              var map = L.map('map', { zoomControl: false }).setView([${currentWaypoint.lat}, ${currentWaypoint.lon}], 16);
              L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                  maxZoom: 19,
              }).addTo(map);

              var geojson = ${geojsonStr};
              if (geojson) {
                  L.geoJSON(geojson, {
                      style: { color: '#22548C', weight: 4, opacity: 0.8 }
                  }).addTo(map);
              }

              var waypoints = ${waypointsStr};
              var markers = [];

              function renderMarkers(activeIndex) {
                  // Hapus marker lama
                  markers.forEach(m => map.removeLayer(m));
                  markers = [];

                  waypoints.forEach(function(wp, i) {
                      var isActive = (i === activeIndex);
                      var className = isActive ? 'marker-active' : 'marker-inactive';
                      var size = isActive ? 36 : 24;
                      var anchor = size / 2;

                      var icon = L.divIcon({
                          className: className,
                          html: '<div>' + (i + 1) + '</div>',
                          iconSize: [size, size],
                          iconAnchor: [anchor, anchor]
                      });

                      var marker = L.marker([wp.lat, wp.lon], { icon: icon }).addTo(map);
                      if (isActive) {
                          marker.bindPopup("<b>Tujuan Saat Ini</b><br>" + wp.name).openPopup();
                      }
                      markers.push(marker);
                  });
              }

              renderMarkers(${currentIndex});
              
              // Expose function for injection
              window.updateActiveMarker = function(newIndex) {
                  renderMarkers(newIndex);
              };
          </script>
      </body>
      </html>
    `;
  };

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
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: getMapHtml() }}
          style={{ flex: 1 }}
          scrollEnabled={false}
          injectedJavaScript={`if(window.updateActiveMarker) { window.updateActiveMarker(${currentIndex}); }; true;`}
        />
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
