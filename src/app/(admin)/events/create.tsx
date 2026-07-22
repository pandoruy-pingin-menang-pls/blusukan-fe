import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { adminService } from "@/services/admin";
import { FontAwesome6 } from "@expo/vector-icons";
import dayjs from "dayjs";

export default function CreateEventScreen() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [venue, setVenue] = useState("");
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
    <ScrollView className="flex-1 bg-surface p-4">
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

        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Genre</Text>
        <TextInput
          className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
          value={genre}
          onChangeText={setGenre}
          placeholder="cultural, sports, convention, concert, festival"
          autoCapitalize="none"
        />

        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Nama Venue / Lokasi</Text>
        <TextInput
          className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
          value={venue}
          onChangeText={setVenue}
          placeholder="Jl. Slamet Riyadi, Surakarta"
        />

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
