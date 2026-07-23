import { View, Text, Pressable } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavItem = { href: string; icon: string; label: string };

const DOLAN_ITEMS: NavItem[] = [
  { href: "/(dolan)/home", icon: "house", label: "Beranda" },
  { href: "/(dolan)/itinerary", icon: "map", label: "Rute" },
  { href: "/(dolan)/stamps", icon: "stamp", label: "Stempel" },
  { href: "/(dolan)/profile", icon: "user", label: "Profil" },
];

const BAKUL_ITEMS: NavItem[] = [
  { href: "/(bakul)/dashboard", icon: "chart-simple", label: "Beranda" },
  { href: "/(bakul)/pos", icon: "cash-register", label: "Kasir" },
  { href: "/(bakul)/catalog", icon: "book-open", label: "Katalog" },
  { href: "/(bakul)/promo", icon: "gift", label: "Promo" },
  { href: "/(bakul)/my-store", icon: "store", label: "Toko" },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: "/(admin)/dashboard", icon: "chart-line", label: "Dashboard" },
  { href: "/(admin)/events", icon: "calendar-check", label: "Events" },
  { href: "/(admin)/monitoring", icon: "users-viewfinder", label: "Monitoring" },
];

export function BottomNav({ mode }: { mode: "dolan" | "bakul" | "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const user = useAppStore(state => state.user);
  
  const items = mode === "dolan" 
    ? DOLAN_ITEMS 
    : mode === "bakul"
      ? BAKUL_ITEMS.filter(item => {
          if (item.href === "/(bakul)/my-store" || item.href === "/(bakul)/promo") return user?.has_merchant_profile;
          return true;
        })
      : ADMIN_ITEMS;

  return (
    <View 
      className="flex-row border-t border-line bg-white px-2 pt-2.5"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href as any)}
            className="flex-1 items-center gap-1 py-1"
          >
            <FontAwesome6
              name={item.icon as any}
              size={19}
              color={active ? "#14335A" : "#8A93A0"}
            />
            <Text
              className={`text-[10.5px] font-sans-semibold ${
                active ? "text-navy-800" : "text-ink-faint"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
