import React, { useEffect, useState } from "react";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import SafeScreen from "@/components/SafeScreen";
import { I18nProvider, useTranslation } from "@/services/i18n";
import AppLoading from "@/components/AppLoading";

// Keep the native splash visible until our branded AppLoading is mounted —
// otherwise the native splash hides itself the moment JS starts and the
// user sees a flash of the bare cleen-logo screen between the two.
SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_BRANDED_MS = 1800;

const Booting = ({ children }) => {
  const { ready, locale } = useTranslation();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);

  // Hide the native splash as soon as our React tree has rendered — the
  // branded AppLoading screen is the first frame the user sees.
  useEffect(() => {
    SplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => setSplashHidden(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), MIN_BRANDED_MS);
    return () => clearTimeout(t);
  }, []);

  if (!splashHidden || !ready || !minTimePassed) {
    return <AppLoading locale={locale} />;
  }
  return children;
};

export default function RootLayout() {
  return (
    <I18nProvider>
      <SafeScreen>
        <Booting>
          <Slot />
        </Booting>
      </SafeScreen>
    </I18nProvider>
  );
}
