import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar } from 'react-native';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FAB, Button } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const levelIcons = ['brain', 'puzzle', 'lightbulb-on', 'telescope'];
const levelColors = [
  ['#fee135', '#9fbf64'],
  ['#fee135', '#9fbf64'],
  ['#9fbf64', '#fee135'],
  ['#9fbf64', '#fee135'],
];

export default function Dashboard() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      await Font.loadAsync({
        'DancingScript-Bold': require('../../../assets/fonts/DancingScript-Bold.ttf'),
        'Poppins-Regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
      });
      setFontsLoaded(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
    prepare();
  }, []);

  const handleCardPress = (level) => setSelectedLevel(level);

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

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient colors={['#d8ffb1', '#aef359']} style={styles.gradient}>
        <Svg height="30%" width="100%" style={styles.svgCurve}>
          <Path
            fill="#d8ffb1"
            d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />
        </Svg>
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.header}>
              <Text style={styles.greeting}>ʏᴏᴜ ᴍᴀʏ ɴᴏᴡ ᴛᴀᴋᴇ ɪᴛ!</Text>
              <Text style={styles.appName}>Q𝖚𝖎𝖟 𝕿𝖎𝖒𝖊</Text>
            </View>

            <Text style={styles.subtitle}>Choose your challenge:</Text>

            <View style={styles.cardsContainer}>
              {[1, 2, 3, 4].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={styles.cardWrapper}
                  onPress={() => handleCardPress(level)}
                >
                  <LinearGradient
                    colors={levelColors[level - 1]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[styles.card, selectedLevel === level && styles.selectedCard]}
                  >
                    <MaterialCommunityIcons name={levelIcons[level - 1]} size={40} color="#354a21" />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>𝕷𝖊𝖛𝖊𝖑 {level}</Text>
                      <Text style={styles.cardSubtitle}>
                        {['Multiple Choice', 'Drag and Drop', 'Guess', 'Identification'][level - 1]}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.buttonWrapper}>
          <Button
            mode="contained"
            icon="trophy"
            onPress={() => router.push('/app2/Overall')}
            style={styles.overallScoreButton}
            labelStyle={styles.overallScoreButtonLabel}
          >
            OVERALL SCORE
          </Button>
          
          <Button
            mode="contained"
            icon="play"
            onPress={handleStartPress}
            disabled={!selectedLevel}
            style={styles.startButton}
            labelStyle={styles.startButtonLabel}
          >
            START QUIZ
          </Button>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  svgCurve: {
    position: 'absolute',
    top: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 120, // Added padding to account for bottom buttons
  },
  content: {
    padding: 20,
    paddingTop: StatusBar.currentHeight + 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    color: '#354a21',
    textShadowColor: '#fee135',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 4,
  },
  appName: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#354a21',
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 5,
    textShadowColor: '#fee135',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 22,
    color: '#354a21',
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Keep space-between
    paddingHorizontal: 5,

  },
  cardWrapper: {
    width: width * 0.42, // Keep original width
    aspectRatio: 1,
    marginBottom: 20,
    // Removed any horizontal margins to keep original layout
  },
  card: {
    flex: 1,
    borderRadius: 30,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 4 
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
    borderWidth: 3,
    borderColor: '#fff205',
  },
  cardContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 22,
    color: '#354a21',
    fontFamily: 'Poppins-Bold',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textShadowColor: '#fee135',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#354a21',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 5,
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    padding: 20,
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  overallScoreButton: {
    backgroundColor: '#fee135',
    borderRadius: 30,
    elevation: 5,
    paddingVertical: 5,
  },
  overallScoreButtonLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#354a21',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textShadowColor: '#9fbf64',
  },
  startButton: {
    backgroundColor: '#b9db92',
    borderRadius: 30,
    elevation: 5,
    paddingVertical: 5,
  },
  startButtonLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#354a21',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textShadowColor: '#fee135',
  },
});