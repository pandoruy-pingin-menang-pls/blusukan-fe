import { View, ViewProps } from "react-native";

export function Card({ className = "", children, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={`border border-line rounded-card bg-white ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
