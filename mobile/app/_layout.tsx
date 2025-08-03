import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import 'react-native-get-random-values'
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';

import SafeScreen from "@/components/SafeScreen";

import { COLORS } from "../constants/colors";


// const CustomMenuIcon = ({ focused, color, size }) => (
//     <Image
//       source={require('../assets/images/icons/bc-house.svg')} // {focused ? require(`../assets/images/icons/${icon}.svg`) : require(`../assets/images/icons/${icon}.svg`)}
//       style={{ width: size, height: size, tintColor: color }}
//     />
//   );

import HouseIcon from '../assets/images/icons/bc-house.svg';
import FlyerIcon from '../assets/images/icons/bc-flyer.svg';
import UserIcon from '../assets/images/icons/bc-user.svg';
import PlusIcon from '../assets/images/icons/bc-plus.svg';
import LogoIcon from '../assets/images/icons/bc-logo-simple.svg';


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
                Home
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => <HouseIcon width={size} height={size} fill={color} />
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
                Orders
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => <FlyerIcon width={size} height={size} fill={color} />
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
              >
                <View style={{ marginTop: 15 }}>
                  <PlusIcon width={size} height={size} fill={COLORS.primary} />
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
                About
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => <LogoIcon width={50} height={50} stroke={color} fill={color} color={color}/>
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
                Settings
              </Text>
            ),
            tabBarIcon: ({ focused, color, size }) => <UserIcon width={size} height={size} fill={color} />
          }}
        />

        <Tabs.Screen
          name="index"
          options={{ href: null }}
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
          name="splash"
          options={{ href: null }}
        />
      </Tabs>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  
});

export default TabsLayout;