import { Pressable, Text, PressableProps } from "react-native";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function Button({ label, variant = "primary", disabled, ...rest }: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      disabled={disabled}
      className={
        isPrimary
          ? `w-full rounded-btn p-3.5 items-center justify-center ${
              disabled ? "bg-btn-disabled" : "bg-navy-800 active:bg-navy-900"
            }`
          : "w-full rounded-btn p-3 items-center justify-center bg-white border-[1.5px] border-navy-800"
      }
      {...rest}
    >
      <Text
        className={
          isPrimary
            ? "font-sans-bold text-white text-[14.5px]"
            : "font-sans-bold text-navy-800 text-sm"
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}
