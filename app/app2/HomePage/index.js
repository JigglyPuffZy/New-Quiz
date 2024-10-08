import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const levelIcons = [
  'format-list-checkbox',
  'drag',
  'thought-bubble',
  'magnify',
];

export default function Dashboard() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'DancingScript-Bold': require('../../../assets/fonts/DancingScript-Bold.ttf'),
        'Poppins-Regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  const handleCardPress = (level) => {
    setSelectedLevel(level);
  };

  const handleStartPress = () => {
    if (selectedLevel) {
      const routes = {
        1: '/app2/MultipleChoice',
        2: '/app2/Drag',
        3: '../../../app2/Guess',
        4: '/app2/Identification',
      };
      router.push(`${routes[selectedLevel]}?level=${selectedLevel}`);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={['#4A00E0', '#4A90E2']} style={styles.gradient}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Hi, John!</Text>
            <Text style={styles.subtitle}>Ready to challenge yourself?</Text>
          </View>

          <Text style={styles.welcomeText}>Quiz Whirl</Text>

          <View style={styles.cardsContainer}>
            {[1, 2, 3, 4].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.card, selectedLevel === level && styles.selectedCard]}
                onPress={() => handleCardPress(level)}
              >
                <MaterialCommunityIcons name={levelIcons[level - 1]} size={40} color="#FFF" />
                <Text style={styles.cardTitle}>Level {level}</Text>
                <Text style={styles.cardSubtitle}>
                  {['Multiple Choice', 'Drag and Drop', 'Guess', 'Identification'][level - 1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startButton, !selectedLevel && styles.startButtonDisabled]}
            onPress={handleStartPress}
            disabled={!selectedLevel}
          >
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E0E0',
    fontFamily: 'Poppins-Regular',
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'DancingScript-Bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    width: width * 0.43,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  selectedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#FFF',
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Poppins-Bold',
    marginTop: 15,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#4A90E2',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});
