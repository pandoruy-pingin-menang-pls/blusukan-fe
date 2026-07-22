import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { adminService } from "@/services/admin";
import { FontAwesome6 } from "@expo/vector-icons";
import dayjs from "dayjs";
import { WebView } from "react-native-webview";

export default function CreateEventScreen() {
  const router = useRouter();
  
  const EVENT_GENRES = ["cultural", "sports", "convention", "concert", "festival"];
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("festival");
  const [showDropdown, setShowDropdown] = useState(false);
  const [venue, setVenue] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [attendees, setAttendees] = useState("");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().add(1, 'day').format("YYYY-MM-DD"));
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !genre || !venue || !attendees || !startDate || !endDate) {
      Alert.alert("Error", "Mohon isi semua field");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createEvent({
        name,
        genre,
        venue_name: venue,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        estimated_attendee_count: parseInt(attendees, 10),
        start_datetime: `${startDate}T00:00:00Z`,
        end_datetime: `${endDate}T23:59:59Z`,
      });
      Alert.alert("Sukses", "Event berhasil dibuat");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Gagal membuat event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-transparent p-4">
      <Pressable onPress={() => router.back()} className="flex-row items-center mb-6">
        <FontAwesome6 name="chevron-left" size={16} color="#0F2A4A" />
        <Text className="text-navy-900 font-sans-semibold ml-2">Kembali</Text>
      </Pressable>

      <Text className="text-navy-900 font-display-semibold text-xl mb-4">Buat Event Manual</Text>
      
      <View className="bg-white rounded-card p-4 border border-line mb-6 shadow-sm">
        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Nama Event</Text>
        <TextInput
          className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
          value={name}
          onChangeText={setName}
          placeholder="Misal: Solo Batik Carnival"
        />
        <Text className="text-ink-soft font-sans-medium text-xs mb-1 mt-4">Kategori / Genre</Text>
        <View className="mb-4">
          <Pressable 
            onPress={() => setShowDropdown(!showDropdown)}
            className="bg-surface rounded-btn px-4 py-3 border border-line flex-row justify-between items-center"
          >
            <Text className="font-sans text-ink capitalize">{genre}</Text>
            <FontAwesome6 name={showDropdown ? "chevron-up" : "chevron-down"} size={14} color="#64748B" />
          </Pressable>
          
          {showDropdown && (
            <View className="bg-white border border-line rounded-xl mt-2 overflow-hidden">
              {EVENT_GENRES.map((g, idx) => (
                <Pressable
                  key={g}
                  onPress={() => {
                    setGenre(g);
                    setShowDropdown(false);
                  }}
                  className={`px-4 py-3 ${idx !== EVENT_GENRES.length - 1 ? 'border-b border-line' : ''} ${genre === g ? 'bg-navy-50' : ''}`}
                >
                  <Text className={`font-sans capitalize ${genre === g ? 'text-navy-900 font-sans-medium' : 'text-ink-soft'}`}>
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Nama Venue / Lokasi</Text>
        <TextInput
          className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
          value={venue}
          onChangeText={setVenue}
          placeholder="Jl. Slamet Riyadi, Surakarta"
        />

        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Pilih Lokasi di Peta (Bisa Cari Nama Jalan)</Text>
        <View className="h-64 w-full rounded-2xl overflow-hidden mb-4 border border-line">
          <WebView
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                  <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
                  <link rel="stylesheet" href="https://unpkg.com/leaflet.locatecontrol/dist/L.Control.Locate.min.css" />
                  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                  <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
                  <script src="https://unpkg.com/leaflet.locatecontrol/dist/L.Control.Locate.min.js"></script>
                  <style>
                    body { padding: 0; margin: 0; }
                    html, body, #map { height: 100%; width: 100%; }
                    .leaflet-control-attribution { display: none !important; }
                  </style>
                </head>
                <body>
                  <div id="map"></div>
                  <script>
                    var lat = ${latitude || -7.5666};
                    var lng = ${longitude || 110.8283};
                    var map = L.map('map', { zoomControl: false }).setView([lat, lng], 14);
                    
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                      maxZoom: 19
                    }).addTo(map);

                    var marker = L.marker([lat, lng]).addTo(map);

                    // Tambahkan fitur Pencarian (Search Box)
                    var geocoder = L.Control.geocoder({
                      defaultMarkGeocode: false,
                      placeholder: "Cari nama tempat / jalan..."
                    })
                    .on('markgeocode', function(e) {
                      var latlng = e.geocode.center;
                      map.setView(latlng, 16);
                      marker.setLatLng(latlng);
                      
                      // Kirim data ke React Native
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        lat: latlng.lat,
                        lng: latlng.lng,
                        name: e.geocode.name
                      }));
                    })
                    .addTo(map);

                    // Tambahkan fitur Lokasi Saat Ini (GPS)
                    L.control.locate({
                      position: 'topleft',
                      strings: { title: "Ke Lokasi Saya" },
                      locateOptions: { enableHighAccuracy: true }
                    }).addTo(map);

                    // Saat GPS berhasil menemukan lokasi
                    map.on('locationfound', function(e) {
                      marker.setLatLng(e.latlng);
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                        name: "Lokasi Saat Ini"
                      }));
                    });

                    // Saat peta diklik
                    map.on('click', function(e) {
                      marker.setLatLng(e.latlng);
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        lat: e.latlng.lat,
                        lng: e.latlng.lng
                      }));
                    });
                  </script>
                </body>
                </html>
              `,
              baseUrl: "https://localhost"
            }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                setLatitude(data.lat.toString());
                setLongitude(data.lng.toString());
                // Jika hasil dari pencarian nama, otomatis isi nama venue
                if (data.name) {
                  setVenue(data.name);
                }
              } catch (e) {}
            }}
            geolocationEnabled={true}
            scrollEnabled={false}
          />
        </View>

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1">
            <Text className="text-ink-soft font-sans-medium text-xs mb-1">Latitude</Text>
            <TextInput
              className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
              placeholder="-7.5666"
            />
          </View>
          <View className="flex-1">
            <Text className="text-ink-soft font-sans-medium text-xs mb-1">Longitude</Text>
            <TextInput
              className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
              placeholder="110.8283"
            />
          </View>
        </View>

        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Estimasi Pengunjung</Text>
        <TextInput
          className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
          value={attendees}
          onChangeText={setAttendees}
          keyboardType="numeric"
          placeholder="5000"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-ink-soft font-sans-medium text-xs mb-1">Tanggal Mulai</Text>
            <TextInput
              className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View className="flex-1">
            <Text className="text-ink-soft font-sans-medium text-xs mb-1">Tanggal Selesai</Text>
            <TextInput
              className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
      </View>

      <Pressable 
        onPress={handleSubmit}
        disabled={submitting}
        className="bg-navy-900 py-3.5 rounded-btn items-center mb-8 shadow-sm"
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-sans-bold text-base">Buat Event</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
