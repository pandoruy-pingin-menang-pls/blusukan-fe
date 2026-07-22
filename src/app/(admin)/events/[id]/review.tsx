import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { adminService, AdminEvent } from "@/services/admin";
import { FontAwesome6 } from "@expo/vector-icons";

export default function ReviewEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Editable fields
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [attendees, setAttendees] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const events = await adminService.getEvents(); // fetch all
        const found = events.find(e => e.id === id);
        if (found) {
          setEvent(found);
          setName(found.name);
          setGenre(found.genre);
          setAttendees(found.estimated_attendee_count.toString());
        } else {
          Alert.alert("Error", "Event tidak ditemukan");
          router.back();
        }
      } catch (error) {
        Alert.alert("Error", "Gagal mengambil data event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!event) return;
    setSubmitting(true);
    try {
      await adminService.reviewEvent(event.id, {
        action,
        name: name !== event.name ? name : undefined,
        genre: genre !== event.genre ? genre : undefined,
        estimated_attendee_count: attendees !== event.estimated_attendee_count.toString() ? parseInt(attendees, 10) : undefined,
      });
      Alert.alert("Sukses", `Event berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}`);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Gagal memproses review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#0F2A4A" />
      </View>
    );
  }

  if (!event) return null;

  return (
    <ScrollView className="flex-1 bg-surface p-4">
      <Pressable onPress={() => router.back()} className="flex-row items-center mb-6">
        <FontAwesome6 name="chevron-left" size={16} color="#0F2A4A" />
        <Text className="text-navy-900 font-sans-semibold ml-2">Kembali</Text>
      </Pressable>

      <Text className="text-navy-900 font-display-semibold text-xl mb-4">Review Event</Text>
      
      <View className="bg-white rounded-card p-4 border border-line mb-4 shadow-sm">
        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Status Saat Ini</Text>
        <Text className="text-warn font-sans-bold mb-4">{event.status}</Text>
        
        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Nama Event</Text>
        <TextInput
          className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
          value={name}
          onChangeText={setName}
          placeholder="Nama Event"
        />

        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Genre</Text>
        <TextInput
          className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
          value={genre}
          onChangeText={setGenre}
          placeholder="cultural, sports, dll"
        />

        <Text className="text-ink-soft font-sans-medium text-xs mb-1">Estimasi Pengunjung</Text>
        <TextInput
          className="bg-surface rounded-btn px-4 py-3 font-sans text-ink mb-4 border border-line"
          value={attendees}
          onChangeText={setAttendees}
          keyboardType="numeric"
          placeholder="0"
        />
        
        <View className="mb-4">
          <Text className="text-ink-soft font-sans-medium text-xs mb-1">Venue</Text>
          <Text className="text-ink font-sans">{event.venue_name}</Text>
        </View>
      </View>

      <View className="flex-row gap-3 mt-4 mb-8">
        <Pressable 
          onPress={() => handleReview('reject')}
          disabled={submitting}
          className="flex-1 bg-red-100 py-3 rounded-btn items-center border border-danger/20"
        >
          <Text className="text-danger font-sans-bold text-base">Reject</Text>
        </Pressable>
        
        <Pressable 
          onPress={() => handleReview('approve')}
          disabled={submitting}
          className="flex-1 bg-good py-3 rounded-btn items-center"
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-sans-bold text-base">Approve</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
