import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Modal,
  Pressable,
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

export default function Dashboard() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [completedLevels, setCompletedLevels] = useState([]); // Track completed levels
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const router = useRouter();
  const { quiz, reset } = useQuizStore();

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

  const handleCardPress = (level) => setSelectedLevel(level);

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

  useEffect(() => {
    if (selectedLevel) {
      const routes = {
        1: "/app2/MultipleChoice",
        2: "/app2/Blank",
        3: "/app2/Guess",
        4: "/app2/Identification",
      };
      router.push(`${routes[selectedLevel]}?level=${selectedLevel}`);
      setCompletedLevels((prev) => [...new Set([...prev, selectedLevel])]);
    }
  }, [selectedLevel]);

  if (!fontsLoaded) return null;

  return (
      <View flex={1} h={'100%'} justifyContent={'center'} paddingHorizontal={'$4'}>
        <SafeAreaView flex={1}>
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
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
                >
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
                      <Text style={styles.cardTitle}>𝕷𝖊𝖛𝖊𝖑 {level}</Text>
                      <Text style={styles.cardSubtitle}>
                        {
                          [
                            "Multiple Choice",
                            "Fill In the blank",
                            "Guess",
                            "Identification",
                          ][level - 1]
                        }
                      </Text>
                    </View>
                  </LinearGradient>
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
            <Button color={'#000'} backgroundColor={'#dedcdc'} size="$5"
                    onPress={handleGoBack}>Upload a new file</Button>
            <Button color={'#000'} backgroundColor={'#dedcdc'} size="$5"
                    onPress={handleOverallScorePress}>Overall Score</Button>

          </View>
        {/* Modal for incomplete levels */}
        <Modal
          transparent={true}
          visible={showModal}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                You should finish the test to see the overall score.
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
});
