import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';

import { homeStyles } from '../assets/styles/home.styles';

const AppScreen = () => {
  return (
    <View>
      <ScrollView>
        <View style={homeStyles.container}>

          {/* Header Section */}
          <View>
            <Text style={homeStyles.welcomeText}>Welcome</Text>
            <Text style={homeStyles.text}>
              Get your car interior cleaned while you take care of your day.
            </Text>
          </View>

          {/* Image Section */}
          <View style={homeStyles.imageContainer}>
            <Image
              source={require('../assets/images/react-logo.png')}
              style={homeStyles.logoImage}
              resizeMode="cover"
            />
          </View>

          {/* Order Summary */}
          <View style={homeStyles.orderSummaryContainer}>
            <View style={homeStyles.orderCard}>
              <Text style={homeStyles.orderNumber}>1</Text>
              <Text style={homeStyles.orderLabel}>Active Orders</Text>
            </View>
            <View style={homeStyles.separator} />
            <View style={homeStyles.orderCard}>
              <Text style={homeStyles.orderNumber}>3</Text>
              <Text style={homeStyles.text}>Completed Orders</Text>
            </View>
          </View>

          {/* "Keep track of all your cleaning orders" text */}
          <View style={homeStyles.trackingTextContainer}>
            <Text style={homeStyles.text}>
              Keep track of all your{' '}
              <Text
                style={homeStyles.cleaningOrdersLink}
                onPress={() => console.log('Cleaning orders link pressed')}
              >
                cleaning orders
              </Text>
            </Text>
          </View>

          {/* "Add New Order" Button */}
          <TouchableOpacity
            style={homeStyles.addButton}
            onPress={() => console.log('Add New Order button pressed')}
          >
            <Text style={homeStyles.addButtonIcon}>+</Text>
            <Text style={homeStyles.addButtonText}>Add New Order</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </View>
  );
};

export default AppScreen;