import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, Platform, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const Widget = () => {
  const [nickname, setNickname] = useState('');
  const navigation = useNavigation();
  const router = useRouter();

  const handleNicknameChange = (text) => {
    setNickname(text);
  };

  const handleSaveClick = () => {
    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname.'); // Show error message
      return;
    }
    // Save logic here
    console.log(`Saving nickname: ${nickname}`);
    router.push('app2/upload');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Image
          source={require('./../../../assets/images/2page.png')}
          style={styles.image}
        />
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Nickname"
            placeholderTextColor="#808080"
            value={nickname}
            onChangeText={handleNicknameChange}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveClick}>
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E89F',
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  formContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  input: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#BCC18D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Widget;
