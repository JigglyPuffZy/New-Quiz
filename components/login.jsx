import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const WidgetContent = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'DancingScript-Bold': require('./../assets/fonts/DancingScript-Bold.ttf'), // Adjust path as needed
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.innerContainer}>
          <Image
            source={require('./../assets/images/login.png')}
            style={styles.icon}
          />
          <Text style={styles.title}>QUIZ WHIRL</Text>
          <ButtonGroup />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ButtonGroup = () => {
  const router = useRouter();
  const buttons = [
    { text: 'Single Player', route: 'app2/2ndPage' },
    { text: 'Multiplayer', route: 'app2/multiplayerPage' },
    { text: 'Settings', route: 'app2/settingsPage' }
  ];

  const handlePress = (route) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.buttonGroup}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => handlePress(button.route)}
        >
          <Text style={styles.buttonText}>{button.text}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E89F',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',
    paddingHorizontal: width * 0.05, // Responsive horizontal padding
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    width: width * 0.8, // Responsive width
    height: width * 0.8, // Maintain aspect ratio
    marginBottom: 20, // Adjusted spacing
  },
  title: {
    fontSize: width * 0.14, // Responsive font size
    fontFamily: 'DancingScript-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    textShadowColor: '#000000',
    textShadowOffset: { width: 4, height: 3 },
    textShadowRadius: 4,
    bottom:100,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: width * 0.05, // Responsive horizontal padding
    bottom:60,
  },
  button: {
    backgroundColor: '#BCC18D',
    paddingVertical: 15,
    borderRadius: 25,
    width: width * 0.8, // Responsive width
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8, // Enhanced shadow for better effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#BCC18D',
    marginBottom: 20, // Adjusted spacing
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: width * 0.06, // Responsive font size
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});

export default WidgetContent;
