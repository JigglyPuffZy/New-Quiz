import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  Animated,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Widget = () => {
  const [nickname, setNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const animatedViewRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  useEffect(() => {
    const keyboardWillShow = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', keyboardShowHandler)
      : Keyboard.addListener('keyboardDidShow', keyboardShowHandler);
    const keyboardWillHide = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', keyboardHideHandler)
      : Keyboard.addListener('keyboardDidHide', keyboardHideHandler);

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const keyboardShowHandler = (event) => {
    const keyboardHeight = event.endCoordinates.height;
    setKeyboardVisible(true);
    Animated.timing(animatedValue, {
      toValue: -keyboardHeight / 2,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const keyboardHideHandler = () => {
    setKeyboardVisible(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleNicknameChange = (text) => {
    setNickname(text);
    setErrorMessage('');
  };

  const handleSaveClick = () => {
    if (!nickname.trim()) {
      setErrorMessage('Please enter a nickname.');
      return;
    }

    console.log(`Saving nickname: ${nickname}`);
    Alert.alert('Success', `Nickname saved: ${nickname}`);
    router.push('app2/upload');
    setNickname('');
  };

  return (
    <LinearGradient colors={['#1C7AE0', '#3D6DA1']} style={styles.gradientContainer}>
      <SafeAreaView style={styles.container}>
        <Animated.View 
          ref={animatedViewRef}
          style={[
            styles.innerContainer, 
            { transform: [{ translateY: animatedValue }] }
          ]}
        >
          <BlurView intensity={20} style={styles.blurContainer}>
            <Image 
              source={require('../../../assets/images/2page.png')} 
              style={styles.image} 
              resizeMode="cover"
            />
            <View style={styles.formContainer}>
              <Text style={styles.label}>What's Your Nickname?</Text>
              <View style={styles.inputContainer}>
                <FontAwesome name="user" size={20} color="#A8A8A8" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Nickname"
                  placeholderTextColor="#A8A8A8"
                  value={nickname}
                  onChangeText={handleNicknameChange}
                />
              </View>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
              <TouchableOpacity
                onPress={handleSaveClick}
                style={styles.button}>
                <Text style={styles.buttonText}>SAVE NICKNAME</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    width: '90%',
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  blurContainer: {
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderRadius: 20,
  },
  formContainer: {
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 18,
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 5,
    alignSelf: 'flex-start',
    width: '100%',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Widget;
