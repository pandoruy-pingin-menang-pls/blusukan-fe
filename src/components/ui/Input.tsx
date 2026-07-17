import { TextInput, TextInputProps } from "react-native";
import { useState } from "react";

export function Input(props: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor="#8A93A0"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`w-full rounded-btn px-3.5 py-3 text-sm font-sans-medium text-ink bg-white border-[1.5px] ${
        focused ? "border-navy-600" : "border-line"
      }`}
      {...props}
    />
  );
}
