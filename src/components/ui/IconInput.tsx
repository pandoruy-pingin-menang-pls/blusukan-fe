import { TextInput, TextInputProps, View, StyleSheet } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface IconInputProps extends TextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
}

export function IconInput({ icon, ...props }: IconInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View 
      style={[
        styles.container,
        focused ? styles.focused : styles.unfocused
      ]}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={focused ? "#22548C" : "#94a3b8"} 
      />
      <TextInput
        placeholderTextColor="#94a3b8"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  focused: {
    backgroundColor: "#ffffff",
    borderColor: "#22548C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unfocused: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular", 
    color: "#0f172a",
    fontSize: 15,
    paddingVertical: 12,
  }
});
