import { Redirect } from "expo-router";
import { useAppStore } from "../store/useAppStore";

export default function Index() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(dolan)/home" />;
}
