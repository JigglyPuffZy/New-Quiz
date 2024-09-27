import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const buttonStyle = {
  backgroundColor: '#BCC18D',
  color: '#000',
  padding: 15,
  borderRadius: 25,
  width: 280,
  height: 60,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 8,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  borderWidth: 1,
  borderColor: '#BCC18D',
};

const WelcomeComponent = () => {
  const [isFirstTime, setIsFirstTime] = useState(true); // Track if it's the user's first time playing
  const navigation = useNavigation();
  const router = useRouter();

  // Simulate checking if it's the user's first time playing
  useEffect(() => {
    // You can add logic here to check from storage or an API
    const checkFirstTime = async () => {
      // Simulate an async check
      const firstTime = true; // Replace this with your actual logic
      setIsFirstTime(firstTime);
    };
    checkFirstTime();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePlayPress = () => {
    router.push('app2/4thPage');
  };

  const handleContinuePress = () => {
    if (!isFirstTime) {
      // Add logic to continue the game if not the first time
      console.log('Continue pressed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('./../../../assets/images/login.png')}
        style={styles.loginImage}
      />
      <Image
        source={require('./../../../assets/images/3page.png')}
        style={styles.characterImage}
      />
      <Text style={styles.welcomeText}>WELCOME BACK JIGGLY!</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={buttonStyle} onPress={handlePlayPress}>
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>

        {/* Conditionally render the continue button as gray and disabled if it's the first time */}
        <TouchableOpacity
          style={[
            buttonStyle,
            isFirstTime ? styles.disabledButton : null, // Apply gray style if first time
          ]}
          onPress={handleContinuePress}
          disabled={isFirstTime} // Disable the button if first time
        >
          <Text
            style={[
              styles.buttonText,
              isFirstTime ? styles.disabledButtonText : null, // Apply gray text if first time
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E89F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loginImage: {
    width: 100,
    height: 80,
    marginBottom: 20,
    borderRadius: 20,
    right: 140,
    zIndex: 1,
    bottom: 20,
  },
  characterImage: {
    width: 320,
    height: 340,
    marginBottom: 20,
    borderRadius: 20,
    bottom: 120,
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#FFFFFF',
    marginBottom: 20,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowOpacity: 0.8,
    textShadowRadius: 4,
    bottom: 190,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 160,
    bottom: 185,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowOpacity: 0.8,
    textShadowRadius: 3,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9', // Gray background for disabled state
    borderColor: '#A9A9A9', // Matching border color
    elevation: 2, // Reduced shadow for disabled button
  },
  disabledButtonText: {
    color: '#D3D3D3', // Lighter gray for disabled text
  },
  backButton: {
    backgroundColor: '#BCC18D',
    padding: 15,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#BCC18D',
    bottom: 155,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowOpacity: 0.8,
    textShadowRadius: 3,
  },
});

export default WelcomeComponent;
