import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const Widget = () => {
  const [nickname, setNickname] = useState('');
  const router = useRouter();

  const handleNicknameChange = (text) => {
    setNickname(text);
  };

  const handleSaveClick = () => {
    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname.');
      return;
    }
    console.log(`Saving nickname: ${nickname}`);
    router.push('app2/upload');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <Image
            source={require('./../../../assets/images/Welcome.png')}
            style={styles.image}
          />
          <Text style={styles.quizDescription}>
            ɪ'ᴠᴇ ʙᴇᴇɴ ᴡᴀɴᴛɪɴɢ ᴛᴏ ᴋɴᴏᴡ ʏᴏᴜ
          </Text>
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Nickname"
              placeholderTextColor="#808080"
              value={nickname}
              onChangeText={handleNicknameChange}
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveClick}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d8ffb1',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 70,
  },
  image: {
    width: 300,
    height: 320,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  formContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  input: {
    marginTop: 5,
    padding: 10,
    backgroundColor: '#F5f5d1',
    borderColor: '#fee135',
    borderWidth: 2,
    borderRadius: 10,
    width: '100%',
  },
  quizDescription: {
    fontFamily: '',
    bottom: 9,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#354a21',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 5,
    textShadowColor: '#fee135',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#a8d38d',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#354a21',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  buttonText: {
    color: '#354a21',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 6,
    textShadowColor: '#fee135',
  },
});

export default Widget;
