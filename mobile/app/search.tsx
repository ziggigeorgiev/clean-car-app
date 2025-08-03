// screens/SearchAddressScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import Icon from '@expo/vector-icons/Feather'; // For search icon
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { router, useLocalSearchParams } from "expo-router";
import Constants from 'expo-constants'; // To access expoConfig for API key
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For location pin icon

import { COLORS } from '@/constants/colors'; // Assuming you have this

const { width } = Dimensions.get('window');

// const GooglePlacesInput = () => {
//   return (
//     <GooglePlacesAutocomplete
//       predefinedPlaces={[]} 
//       textInputProps={{}}
//       minLength={2}
//       placeholder='Search'
//       onPress={(data, details = null) => {
//         // 'details' is provided when fetchDetails = true
//         console.log(data, details);
//       }}
//       query={{
//         key: 'AIzaSyBbax4c2uwl8G6nH3CbOh06Ewze2IZ8udw',
//         language: 'en',
//       }} 
//       styles={{ // This is the prop for GooglePlacesAutocomplete's internal styles
//             container: { // THIS IS THE ONE THE ERROR REFERS TO
//                 flex: 0,
//                 position: 'absolute',
//                 width: width - 20,
//                 zIndex: 1,
//                 marginTop: Platform.OS === 'android' ? 10 : 50,
//                 alignSelf: 'center',
//             },
//             textInputContainer: {
//                 backgroundColor: COLORS.white,
//                 borderRadius: 10,
//                 borderTopWidth: 0,
//                 borderBottomWidth: 0,
//                 shadowColor: '#000',
//                 shadowOffset: { width: 0, height: 2 },
//                 shadowOpacity: 0.1,
//                 shadowRadius: 5,
//                 elevation: 3,
//                 paddingHorizontal: 5,
//             },
//             textInput: {
//                 height: 45,
//                 color: COLORS.text,
//                 fontSize: 16,
//                 marginLeft: 10,
//             },
//             predefinedPlacesDescription: {
//                 color: COLORS.primary,
//             },
//             listView: {
//                 backgroundColor: COLORS.white,
//                 borderRadius: 10,
//                 marginTop: 5,
//                 shadowColor: '#000',
//                 shadowOffset: { width: 0, height: 2 },
//                 shadowOpacity: 0.1,
//                 shadowRadius: 5,
//                 elevation: 3,
//             },
//         }}
//     />
//   );
// };
// export default GooglePlacesInput;

const SearchAddressScreen: React.FC = () => {
    const params = useLocalSearchParams();
    const googleApiKey = Constants?.expoConfig?.extra?.googleMapsApiKey; // Access API key from extra config
    console.log("Google Maps API Key:", googleApiKey); // Debugging line to check if the key is loaded
    if (!googleApiKey) {
        console.error("Google Maps API Key not found in app.json 'extra' field.");
        // You might want to display an error message to the user or handle this more gracefully
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>
                    Google Maps API Key is missing. Please configure it in app.json.
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        >
        <View style={styles.container}>
            <GooglePlacesAutocomplete
                predefinedPlaces={[]} // Example predefined place
                keyboardShouldPersistTaps="handled"
                minLength={2}
                placeholder='Search for an address'
                onPress={(data, details = null) => {
                    // 'details' is provided when fetchDetails is true
                    console.log(data, details);
                    if (details) {
                        const { lat, lng } = details.geometry.location;
                        const formattedAddress = data.description; // Or details.formatted_address

                        router.replace({
                            pathname: '/location', // Navigate back to SelectLocationScreen
                            params: {
                                selectedLatitude: lat,
                                selectedLongitude: lng,
                                selectedAddress: formattedAddress,
                            }
                        });
                    }
                }}
                query={{
                    key: googleApiKey, // Your Google Maps API Key
                    language: 'en', // Language of results
                    components: 'country:de', // Restrict to Germany, for example
                }}
                textInputProps={{
                    
                    InputComp: TextInput,
                    returnKeyType: 'search',
                    placeholder: 'Search location',
                }}
                fetchDetails={true} // To get latitude and longitude of the selected place
                renderLeftButton={() => (
                    <View style={styles.leftButtonContainer}>
                        <Icon name="search" size={16} color="#888" style={styles.searchIcon} />
                    </View>
                )}
                // renderRightButton={() => (
                //     <View style={styles.rightButtonContainer}>
                //         <TouchableOpacity onPress={() => setText('')}>
                //             <Text style={{ padding: 10 }}>✖️</Text>
                //         </TouchableOpacity>
                //     </View>
                // )}
                renderRow={(rowData) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 }}>
                    <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.textLight} />
                    {/* <Image 
                        source={require('./path/to/your/custom-icon.png')} // Replace with your icon path
                        style={{ width: 20, height: 20, marginRight: 10 }}
                    /> */}
                    <Text>{rowData.description} {rowData.types}</Text>
                    </View>
                )}
                styles={{
                    container: {
                        color: "red",
                        flex: 0,
                        position: 'absolute',
                        width: width - 20, // Full width minus some padding
                        zIndex: 1,
                        marginTop: Platform.OS === 'android' ? 10 : 50, // Adjust for status bar
                        alignSelf: 'center',
                    },
                     textInputContainer: {
                        backgroundColor: '#f2f2f2', // The gray background for the entire bar
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 5,
                    },
                    textInput: {
                        height: 45,
                        color: COLORS.textLight,
                        fontSize: 16,
                        marginLeft: 10,
                        paddingLeft: 0,
                        paddingTop: 10,
                        flex: 1, // Ensures the input takes up available space
                        backgroundColor: '#F0F0F0', // Light grey background for input
                    },
                    predefinedPlacesDescription: {
                        color: COLORS.text,
                        backgroundColor: "yellow",
                    },
                    listView: {
                        backgroundColor: "blue",
                        color: "green",
                        borderRadius: 10,
                        marginTop: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                        elevation: 3,
                    },
                }}
                debounce={300} // Delay before fetching results (in ms)
            />
        </View>r
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    leftButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 10,

    },
    rightButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 10,

    },
    searchIcon: {
        marginRight: 0,
    }
});

export default SearchAddressScreen;