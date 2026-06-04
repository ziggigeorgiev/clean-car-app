import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Font from 'expo-font';

// import PropTypes from 'prop-types';

type PriceProps = {
    price: number;
    currency?: string;
    dollarStyle?: object;
    centStyle?: object;
    currencyStyle?: object;
};

const currencySymbol = (code?: string) => {
    switch ((code || '').toUpperCase()) {
        case 'EUR': return '€';
        case 'USD': return '$';
        case 'GBP': return '£';
        default: return code || '';
    }
};

const Price: React.FC<PriceProps> = ({ price, currency, dollarStyle, centStyle, currencyStyle }) => {
    const safePrice = Number.isFinite(price) ? price : 0;
    const dollars = Math.floor(safePrice); // Gets the integer part
    const cents = Math.round((safePrice % 1) * 100); // Gets the decimal part and converts to whole cents
    const symbol = currencySymbol(currency);

    return (
        <View style={styles.priceContainer}>
            {symbol ? (
                <Text style={[styles.currencyText, dollarStyle, currencyStyle]}>{symbol}</Text>
            ) : null}
            <Text style={[styles.dollarText, dollarStyle]}>{dollars}<Text>.</Text></Text>
            {cents > 0 ? (
                <Text style={[styles.centsText, centStyle]}>
                    {cents}
                </Text>
            ) : null}
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
  currencyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 2,
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