import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Font from 'expo-font';

// import PropTypes from 'prop-types';

type PriceProps = {
    price: number;
    dollarStyle?: object;
    centStyle?: object;
};

const Price: React.FC<PriceProps> = ({ price, dollarStyle, centStyle }) => {

    // useEffect(() => {
    //     async function loadFonts() {
    //         await Font.loadAsync({
    //             'ComicNeue-Regular': require('../assets/fonts/ComicNeue-Regular.ttf'),
    //             'ComicNeue-Bold': require('../assets/fonts/ComicNeue-Bold.ttf'),
    //         });
    //     }

    //     loadFonts();
    // }, []);
    
    const dollars = Math.floor(price); // Gets the integer part
    const cents = Math.round((price % 1) * 100); // Gets the decimal part and converts to whole cents

    return (
        <View style={styles.priceContainer}>
            <Text style={[styles.dollarText, dollarStyle]}>{dollars}.</Text>
            {cents && (
                <Text style={[styles.centsText, centStyle]}>
                {cents}-
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  priceContainer: {
    flexDirection: 'row', // Arrange children horizontally
    alignItems: 'flex-start', // Align items to the start (top) of the cross axis
    position: 'relative',   // Crucial: This makes it the positioning context for absolute children
    
    // You might need to adjust width or other properties based on your layout
  },
  dollarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    // Add some padding-right if the dot and cents are too close
    paddingRight: 2,
    // fontFamily: 'ComicNeue-Bold'
  },
  centsText: {
    fontSize: 14,             // Smaller font size for cents
    fontWeight: 'bold',
    color: '#000000',
    top: 2,                  // Move up from the baseline of the dollar text (adjust this value)
    // 'left' positions from the start of the dollarText, 'right' from the end
    // Use 'right' to align with the end of the dollar amount more consistently
    right: 2,               // Adjust this value to fine-tune horizontal position relative to the dot
    // fontFamily: 'ComicNeue-Bold'
    // You can also use transform for fine-tuning, e.g., transform: [{ translateX: 5 }]
  },
});


export default Price;