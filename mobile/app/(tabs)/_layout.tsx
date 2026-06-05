import { Tabs, router } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import 'react-native-get-random-values'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

import SafeScreen from "@/components/SafeScreen";

import { COLORS } from "../../constants/colors";
import { useTranslation } from "@/services/i18n";


const TabsLayout = () => {
  const { t } = useTranslation();
  // This layout is used for the main tabs of the app
  return (
    // <SafeScreen>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopColor: COLORS.border,
            borderTopWidth: 2,
            elevation: 0, 
            height: 80,
          }
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{
                color,
                fontWeight: focused ? '600' : '400',
                fontSize: 12
              }}>
                {t('tab.home')}
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
            )
          }}
        />

        <Tabs.Screen
          name="list-orders"
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{
                color,
                fontWeight: focused ? '600' : '400',
                fontSize: 12
              }}>
                {t('tab.orders')}
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons name={focused ? 'clipboard-list' : 'clipboard-list-outline'} size={size} color={color} />
            )
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            tabBarStyle: {
              top: -100, // Hide the tab bar for this screen
            },
            tabBarIcon: ({ focused, color, size }) => (
              <TouchableOpacity
                onPress={() => { router.push('/location') }}
                style={{
                  backgroundColor: "transparent",
                  width: size + 40,
                  height: size + 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={{ marginTop: 15 }}>
                  <MaterialCommunityIcons name="plus-circle" size={size + 12} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            ),
            tabBarLabel: ({ focused, color }) => null,
          }}
        />

        <Tabs.Screen
          name="about"
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{
                color,
                fontWeight: focused ? '600' : '400',
                fontSize: 12
              }}>
                {t('tab.about')}
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons name={focused ? 'information' : 'information-outline'} size={size} color={color} />
            )
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{
                color,
                fontWeight: focused ? '600' : '400',
                fontSize: 12
              }}>
                {t('tab.settings')}
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={size} color={color} />
            )
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
          name="search"
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
        <Tabs.Screen
          name="acknowledge/[id]"
          options={{ href: null }}
        />
      </Tabs>
    // </SafeScreen>
  );
};

const styles = StyleSheet.create({
  
});

export default TabsLayout;