import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const TriviaGameScreen = () => {
  const animatedValue = new Animated.Value(1);
  const router = useRouter();

  const onPressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with icons */}
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3406/3406808.png' }}
            style={styles.icon}
          />
        </View>

        {/* Main game section */}
        <View style={styles.gameSection}>
          {/* Left section with Samurai */}
          <View style={styles.leftPanel}>
            <LinearGradient
              colors={['#BCC18D', '#E7E89F']}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.leftGradient}
            >
              <Text style={styles.playText}>PLAY FOR FUN</Text>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3874/3874176.png' }}
                style={styles.samuraiImage}
              />
            </LinearGradient>
          </View>

          {/* Right section with avatars */}
          <View style={styles.rightPanel}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/186/186313.png' }}
                style={styles.avatarImage}
              />
              <Text style={styles.challengeText}>Play to Learn!</Text>
            </View>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5691/5691850.png' }}
                style={styles.avatarImage}
              />
            </View>
          </View>
        </View>

        {/* Fun Games Section */}
        <TouchableOpacity 
          style={styles.funGamesButton} 
          activeOpacity={0.7}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.View style={[styles.buttonInner, { transform: [{ scale: animatedValue }] }]}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5692/5692030.png' }}
              style={styles.funGamesIcon}
            />
            <Text style={styles.funGamesText}>Fun games!</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Trivia Game Quiz Section */}
        <View style={styles.quizSection}>
          <Text style={styles.quizTitle}>Quiz Whirl Game Quiz</Text>
          <Text style={styles.quizDescription}>
          Welcome to QuizWhirl! Enjoy an interactive platform designed for secondary and tertiary students to review quizzes and exams while making learning fun and engaging.
          </Text>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity 
          onPress={() => router.push('app2/Nickname')}
          style={styles.getStartedButton} activeOpacity={0.7}>
          <LinearGradient
            colors={['#BCC18D', '#E7E89F']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.gradientButton}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 20,
  },
  icon: {
    width: 70,
    height: 70,
  },
  gameSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  leftPanel: {
    flex: 1,
    marginRight: 10,
  },
  leftGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  samuraiImage: {
    width: 90,
    height: 90,
  },
  rightPanel: {
    flex: 1,
    justifyContent: 'space-between',
  },
  avatarWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#E7E89F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 15,
  },
  avatarImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  challengeText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
  funGamesButton: {
    alignSelf: 'center',
    marginTop: 30,
    right:96,
    bottom:120,
  },
  buttonInner: {
    flexDirection: 'row',
    backgroundColor: '#BCC18D',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#E7E89F',
    shadowOffset: { width: 1, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  funGamesIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
    
  },
  funGamesText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quizSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  quizTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333333',
  },
  quizDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
  },
  getStartedButton: {
    marginBottom: 40,
    alignSelf: 'center',
    width: '75%',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  gradientButton: {
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default TriviaGameScreen;
