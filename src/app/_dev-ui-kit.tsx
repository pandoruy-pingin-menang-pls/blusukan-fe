import { ScrollView, View, Text } from "react-native";
import { Button, Card, Chip, Badge, Stamp, Input } from "@/components/ui";

export default function DevUiKit() {
  return (
    <ScrollView className="flex-1 bg-surface px-5 pt-16" contentContainerClassName="gap-4 pb-10">
      <Text className="font-display-extra text-navy-900 text-xl">UI Kit Preview</Text>

      <Card className="p-4 gap-3">
        <Input placeholder="4 jam, budget 50rb..." />
        <View className="flex-row gap-2">
          <Chip label="Budaya" active />
          <Chip label="Kuliner" />
        </View>
        <View className="flex-row items-center gap-2">
          <Stamp filled />
          <Stamp filled />
          <Stamp />
          <Stamp size="big" filled />
        </View>
        <Badge label="Hidden Gem" variant="info" />
        <Badge label="Event Aktif" variant="high" />
        <Button label="Susun Rute Blusukan" variant="primary" />
        <Button label="Batal" variant="secondary" />
      </Card>
    </ScrollView>
  );
}
