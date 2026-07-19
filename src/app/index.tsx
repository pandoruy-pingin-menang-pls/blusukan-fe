import { Redirect } from "expo-router";
import { useAppStore } from "../store/useAppStore";

export default function Index() {
  const { isLoggedIn, user } = useAppStore();

  if (!isLoggedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (user?.role === "pedagang") {
    return <Redirect href="/(merchant)/home" />;
  }

  return <Redirect href="/(dolan)/home" />;
}
