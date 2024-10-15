import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TriviaGameScreen = () => {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#2ecc71', '#27ae60', '#1abc9c']}
        style={styles.container}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Ionicons name="leaf" size={48} color="#FFFFFF" />
          <Text style={styles.headerText}>QuizWhirl</Text>
        </Animated.View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3874/3874176.png' }}
            style={styles.mainImage}
          />
          <Text style={styles.title}>Grow Your Knowledge</Text>
          <Text style={styles.description}>
          Enjoy an interactive platform designed for secondary and tertiary students to review quizzes and exams while making learning fun and engaging.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('app2/Nickname')}
          >
            <LinearGradient
              colors={['#27ae60', '#2ecc71']}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start Learning</Text>
              <Ionicons name="arrow-forward-circle" size={28} color="#FFFFFF" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  headerText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 12,
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    alignItems: 'center',
  },
  mainImage: {
    width: 280,
    height: 280,
    marginBottom: 36,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 36,
    opacity: 0.9,
    fontFamily: 'System',
    lineHeight: 28,
  },
  buttonContainer: {
    marginBottom: 48,
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 12,
    fontFamily: 'System',
  },
  buttonIcon: {
    marginLeft: 6,
  },
});

export default TriviaGameScreen;
