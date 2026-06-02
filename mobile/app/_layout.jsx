import { Slot } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import { I18nProvider } from "@/services/i18n";

export default function RootLayout() {
  return (
    <I18nProvider>
      <SafeScreen>
        <Slot />
      </SafeScreen>
    </I18nProvider>
  );
}
