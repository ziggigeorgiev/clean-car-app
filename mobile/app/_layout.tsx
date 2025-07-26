import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { View, TouchableOpacity, StyleSheet } from 'react-native';

import SafeScreen from "@/components/SafeScreen";

import { COLORS } from "../constants/colors";


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
            backgroundColor: "#F4F6F7",
            borderTopColor: COLORS.border,
            borderTopWidth: 2,
            paddingBottom: 8,
            paddingTop: 12,
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
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={32} color={color} />,
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            tabBarButton: () => (
              <TouchableOpacity
                onPress={() => {
                  
                  console.log('Plus button pressed');
                  router.push('/location')
                }}
                style={styles.plusButton}
              >
                <View style={styles.plusCircle}>
                  <Ionicons name="add" size={32} color={COLORS.background} />
                </View>
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="list-orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={32} color={color} />,
          }}
        />

        <Tabs.Screen
          name="order/[id]"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="location"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="availability"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="services"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="confirm"
          options={{ href: null }}
        />
      </Tabs>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  plusButton: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.background,
  },
});

export default TabsLayout;