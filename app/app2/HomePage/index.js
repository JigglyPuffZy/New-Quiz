import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Modal,
  Pressable, Alert,
} from "react-native";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import {SafeAreaView} from "react-native";
const { width } = Dimensions.get("window");
import { View, Text, XStack, Button } from "tamagui";
const levelIcons = ["brain", "puzzle", "lightbulb-on", "telescope"];
const levelColors = [
  ["#fee135", "#9fbf64"],
  ["#fee135", "#9fbf64"],
  ["#9fbf64", "#fee135"],
  ["#9fbf64", "#fee135"],
];
import { useQuizStore } from "../upload/index"
import {FontAwesome, Ionicons} from "@expo/vector-icons";
import LottieView from "lottie-react-native";

const LoadingAnimation = () => {
  return (
      <LottieView
          source={require('../../../assets/loading-bot.json')}
          autoPlay
          loop
          style={{
            width: 200,
            height: 200,
          }}
      />
  );
};

export default function Dashboard() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const router = useRouter();
  const { quiz, resetProgress, reset, unlockedLevels, completedLevels, regenerateQuestions } = useQuizStore();
  const [shouldNavigate, setShouldNavigate] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [regenerateAnim] = useState(new Animated.Value(1));
  useEffect(() => {
    async function prepare() {
      await Font.loadAsync({
        "DancingScript-Bold": require("../../../assets/fonts/DancingScript-Bold.ttf"),
        "Poppins-Regular": require("../../../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-Bold": require("../../../assets/fonts/Poppins-Bold.ttf"),
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

  const handleCardPress = (level) => {
    if (unlockedLevels.includes(level)) {
      const routes = {
        1: "/app2/MultipleChoice",
        2: "/app2/Blank",
        3: "/app2/Guess",
        4: "/app2/Identification",
      };
      setSelectedLevel(level);
      router.push(`${routes[level]}?level=${level}`);
    }
  };

  const handleStartPress = () => {
    if (selectedLevel) {
      const routes = {
        1: "/app2/MultipleChoice",
        2: "/app2/Blank",
        3: "/app2/Guess",
        4: "/app2/Identification",
      };
      router.push(`${routes[selectedLevel]}?level=${selectedLevel}`);
      setCompletedLevels((prev) => [...new Set([...prev, selectedLevel])]); // Mark level as completed
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating) {
      console.log('Already regenerating questions, preventing duplicate request');
      return;
    }

    console.log('Starting question regeneration process...');
    setIsRegenerating(true);
    setShowRegenerateModal(true); // Show the modal

    try {
      const currentState = useQuizStore.getState();
      console.log('Current quiz store state:', {
        hasFileData: !!currentState.fileData,
        fileName: currentState.fileName,
        unlockedLevels: currentState.unlockedLevels,
        completedLevels: currentState.completedLevels
      });

      const result = await regenerateQuestions();

      if (result) {
        console.log('Questions regenerated successfully');
        Alert.alert(
            'Success',
            'Questions have been regenerated successfully! You can now start playing with the new questions.',
            [{ text: 'OK' }]
        );
      } else {
        console.log('Regeneration returned false, indicating failure');
        throw new Error('Regeneration failed with no specific error');
      }
    } catch (error) {
      console.error('Error during regeneration:', error);
      if (error.message === 'No file data available') {
        Alert.alert(
            'Error',
            'Please upload a file first before regenerating questions. Go back to the upload screen to add a file.',
            [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
            'Error',
            'An unexpected error occurred while regenerating questions. Please try again or contact support.',
            [{ text: 'OK' }]
        );
      }
    } finally {
      console.log('Regeneration process completed, resetting loading state');
      setIsRegenerating(false);
      setShowRegenerateModal(false); // Hide the modal
    }
  };

  useEffect(() => {
    if (showRegenerateModal) {
      // Text rotation
      const rotationInterval = setInterval(() => {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 3000);

      // Pulse animation
      const pulse = Animated.sequence([
        Animated.timing(regenerateAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(regenerateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ]);

      Animated.loop(pulse).start();

      return () => {
        clearInterval(rotationInterval);
        regenerateAnim.setValue(1);
      };
    }
  }, [showRegenerateModal]);

  const handleGoBack = () => {
    reset();
    router.push("/app2/upload");
  };

  const handleOverallScorePress = () => {
    if (completedLevels.length === 4) {
      router.push("/app2/Overall");
    } else {
      setShowModal(true); // Show modal if not all levels are completed
    }
  };


  if (!fontsLoaded) return null;

  const handleReset = async () => {
    try {
      setShouldNavigate(false);
      await resetProgress();
      setSelectedLevel(null);
    } catch (error) {
      console.error('Error resetting progress:', error);
      Alert.alert('Error', 'Failed to reset progress. Please try again.');
    }
  };

  const loadingMessages = [
    "Regenerating questions with superhuman speed...",
    "Analyzing your content again...",
    "Creating fresh challenges...",
    "Almost there, preparing your new quiz..."
  ];
  return (
      <View flex={1} h={'100%'} justifyContent={'center'} paddingHorizontal={'$4'}>
        <SafeAreaView flex={1}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Animated.View style={[{ opacity: fadeAnim }]}>
              <View alignItems={'center'}>
                <Text style={styles.appName}>Q𝖚𝖎𝖟 𝕿𝖎𝖒𝖊</Text>
              </View>

              <Text style={styles.subtitle}>Choose your challenge:</Text>

              <View style={styles.cardsContainer}>
                {[1, 2, 3, 4].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={styles.cardWrapper}
                        onPress={() => handleCardPress(level)}
                        disabled={!unlockedLevels.includes(level)}
                    >
                      {unlockedLevels.includes(level) ? (
                          <LinearGradient
                              colors={levelColors[level - 1]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={[
                                styles.card,
                                selectedLevel === level && styles.selectedCard,
                              ]}
                          >
                            <MaterialCommunityIcons
                                name={levelIcons[level - 1]}
                                size={40}
                                color="#354a21"
                            />
                            <View style={styles.cardContent}>
                              <Text style={styles.cardTitle}>
                                𝕷𝖊𝖛𝖊𝖑 {level}
                              </Text>
                              <Text style={styles.cardSubtitle}>
                                {[
                                  "Multiple Choice",
                                  "Fill In the blank",
                                  "Guess",
                                  "Identification",
                                ][level - 1]}
                              </Text>
                              {completedLevels.includes(level) && (
                                  <MaterialCommunityIcons
                                      name="check-circle"
                                      size={24}
                                      color="#354a21"
                                      style={styles.completedIcon}
                                  />
                              )}
                            </View>
                          </LinearGradient>
                      ) : (
                          <View style={styles.lockedCard}>
                            <Text style={styles.lockedLevelText}>𝕷𝖊𝖛𝖊𝖑 {level}</Text>
                            <Ionicons name="lock-closed" size={40} color="#354a21" />
                          </View>
                      )}
                    </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </ScrollView>

          <View
              position="absolute"
              bottom="$0"
              left="$0"
              right="$0"
              padding="$4"
              paddingBottom={"$6"}
              gap="$2"
          >
            <Button
                color={'#000'}
                backgroundColor={'#dedcdc'}
                size="$5"
                onPress={handleRegenerate}
                disabled={isRegenerating}
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate Questions'}
            </Button>
            <Button
                color={'#000'}
                backgroundColor={'#dedcdc'}
                size="$5"
                onPress={handleGoBack}
            >
              Upload a new file
            </Button>
            <Button
                color={'#000'}
                backgroundColor={'#dedcdc'}
                size="$5"
                onPress={handleReset}
            >
              Reset Progress
            </Button>
          </View>

          <Modal
              transparent={true}
              visible={showModal}
              animationType="slide"
              onRequestClose={() => setShowModal(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>
                  You should finish all levels to see the overall score.
                </Text>
                <Pressable
                    style={styles.modalButton}
                    onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <Modal
              transparent={true}
              visible={showRegenerateModal}
              animationType="none"
              onRequestClose={() => setShowRegenerateModal(false)}
          >
            <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.5)"
                }}
            >
              <View
                  style={{
                    width: '90%',
                    padding: 24,
                    backgroundColor: "#1a1a1a",
                    borderRadius: 16,
                    alignItems: "center"
                  }}
              >
                <LoadingAnimation />
                <Animated.Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginBottom: 20,
                      color: '#fff',
                      textAlign: 'center',
                      opacity: regenerateAnim,
                      paddingHorizontal: 20
                    }}
                >
                  {loadingMessages[currentTextIndex]}
                </Animated.Text>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
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
    position: "absolute",
    top: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 120, // Added padding to account for bottom buttons
  },

  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  greeting: {
    fontSize: 20,
    color: "#354a21",
    textShadowColor: "#fee135",
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 4,
  },
  appName: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#354a21",
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 5,
    textShadowColor: "#fee135",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 22,
    color: "#354a21",
    fontFamily: "Poppins-Regular",
    marginBottom: 20,
    textAlign: "center",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Keep space-between
    paddingHorizontal: 5,
  },
  cardWrapper: {
    width: width * 0.42, // Keep original width
    aspectRatio: 1,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 30,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
    borderWidth: 3,
    borderColor: "#fff205",
  },
  cardContent: {
    alignItems: "center",
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 22,
    color: "#354a21",
    fontFamily: "Poppins-Bold",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textShadowColor: "#fee135",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#354a21",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 5,
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "column",
    padding: 20,
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  overallScoreButton: {
    backgroundColor: "#fee135",
    borderRadius: 30,
    elevation: 5,
    paddingVertical: 5,
  },
  overallScoreButtonLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#354a21",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textShadowColor: "#9fbf64",
  },
  startButton: {
    backgroundColor: "#b9db92",
    borderRadius: 30,
    elevation: 5,
    paddingVertical: 5,
  },
  startButtonLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#354a21",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textShadowColor: "#fee135",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  lockedCard: {
    flex: 1,
    borderRadius: 30,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#2b2b2b',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  lockedLevelText: {
    fontSize: 22,
    color: "#354a21",
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },

});
