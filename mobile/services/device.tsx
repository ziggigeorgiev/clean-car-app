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
      return 'Zdravko\'s Phone'; // installationId;
    } catch (error) {
      console.error("Error getting/creating phone_identifier:", error);
      return null; // Handle error appropriately
    }
  },
};