import { View, Text, Pressable, ImageBackground } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { AdminEvent } from "@/services/admin";
import dayjs from "dayjs";

interface EventCardAdminProps {
  event: AdminEvent;
  onPress: () => void;
}

export function EventCardAdmin({ event, onPress }: EventCardAdminProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return { bg: "bg-navy-900", text: "text-white" };
      case "pending_review":
        return { bg: "bg-[#BA5E12]", text: "text-white" };
      case "rejected":
        return { bg: "bg-[#800000]", text: "text-white" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "pending_review":
        return "Menunggu Review";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  };

  const statusStyle = getStatusColor(event.status);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl mb-4 border border-line"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className={`h-8 rounded-t-2xl overflow-hidden ${statusStyle.bg}`}>
        <ImageBackground
          source={require("../../../assets/edit-profile-wave.png")}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 16 }}
          imageStyle={{ opacity: 0.25 }}
          resizeMode="cover"
        >
          <Text className={`font-sans-bold text-[10px] tracking-wider ${statusStyle.text} z-10`}>
            {getStatusLabel(event.status).toUpperCase()}
          </Text>
        </ImageBackground>
      </View>

      <View className="p-4 pt-3">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-navy-900 font-playfair font-semibold text-lg mb-1" numberOfLines={2}>
              {event.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <FontAwesome6 name="location-dot" size={12} color="#8A93A0" />
              <Text className="text-ink-soft font-sans text-xs ml-1.5" numberOfLines={1}>
                {event.venue_name || "Tidak ada lokasi"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row mt-2 pt-3 border-t border-line">
          <View className="flex-1 flex-row items-center">
            <FontAwesome6 name="calendar" size={12} color="#5B6572" />
            <Text className="text-ink-soft font-sans-medium text-xs ml-1.5">
              {dayjs(event.start_datetime).format("DD MMM YYYY")}
            </Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome6 name="users" size={12} color="#5B6572" />
            <Text className="text-ink-soft font-sans-medium text-xs ml-1.5">
              {event.estimated_attendee_count.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
