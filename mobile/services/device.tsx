import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Device = {
  getPhoneIdentifier: async () => {
    try {
      let installationId = await AsyncStorage.getItem('phone_identifier');
      if (!installationId) {
        installationId = Crypto.randomUUID(); // Generate a new UUID
        await AsyncStorage.setItem('phone_identifier', installationId);
      }
      // return 'Zdravko\'s Phone'; 
      return installationId;
    } catch (error) {
      console.error("Error getting/creating phone_identifier:", error);
      return null; // Handle error appropriately
    }
  },
  getPhoneNumber: async () => {
    return await AsyncStorage.getItem('phone_number');
  },
  setPhoneNumber: async (phoneNumber: string) => {
    return await AsyncStorage.setItem('phone_number', phoneNumber);
  },
  getPlateNumber: async () => {
    return await AsyncStorage.getItem('plate_number');
  },
  setPlateNumber: async (plateNumber: string) => {
    return await AsyncStorage.setItem('plate_number', plateNumber);
  },
  getEmail: async () => {
    return await AsyncStorage.getItem('email');
  },
  setEmail: async (email: string) => {
    return await AsyncStorage.setItem('email', email);
  },
  getName: async () => {
    return await AsyncStorage.getItem('name');
  },
  setName: async (name: string) => {
    return await AsyncStorage.setItem('name', name);
  },

  /**
   * Mark that an order has just been placed. The next time the order flow
   * screens are focused they should treat themselves as a fresh start.
   */
  markOrderPlaced: async () => {
    await AsyncStorage.setItem('order_just_placed', '1');
  },
  /**
   * Returns true if an order was just placed and clears the flag.
   * Call once per focus on the order flow screens.
   */
  consumeOrderPlacedFlag: async (): Promise<boolean> => {
    const v = await AsyncStorage.getItem('order_just_placed');
    if (v) await AsyncStorage.removeItem('order_just_placed');
    return !!v;
  },
};