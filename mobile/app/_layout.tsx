import { Slot, Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import SafeScreen from "@/components/SafeScreen";

import { COLORS } from "../constants/colors";
// export default function RootLayout() {
//   return (
//       <SafeScreen>
//         <Slot />
//       </SafeScreen>
//   );
// }

const TabsLayout = () => {
  // This layout is used for the main tabs of the app
  return (
    <SafeScreen>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 80,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="list-orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
          }}
        />
        {/* <Tabs.Screen
          name="index"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
          }}
        /> */}
      </Tabs>
    </SafeScreen>
  );
};
export default TabsLayout;