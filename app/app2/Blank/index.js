
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AntDesign } from "@expo/vector-icons";
import {
  useFonts,
  Poppins_600SemiBold,
  Poppins_400Regular,
} from "@expo-google-fonts/poppins";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useQuizStore } from "../upload";
import { Button } from "tamagui";

const { width, height } = Dimensions.get("window");

const DraggableLetter = ({ letter, onGestureEvent, onGestureEnd }) => {
  const animatedX = useSharedValue(0);
  const animatedY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: animatedX.value }, { translateY: animatedY.value }],
  }));

  return (
      <PanGestureHandler
          onGestureEvent={(event) => {
            animatedX.value = event.nativeEvent.translationX;
            animatedY.value = event.nativeEvent.translationY;
            onGestureEvent(event.nativeEvent, letter.id);
          }}
          onEnded={(event) => {
            onGestureEnd(event.nativeEvent, letter.id);
            animatedX.value = withSpring(0);
            animatedY.value = withSpring(0);
          }}
      >
        <Animated.View style={[styles.letter, animatedStyle]}>
          <Text style={styles.letterText}>{letter.char}</Text>
        </Animated.View>
      </PanGestureHandler>
  );
};

const DynamicDragDropPuzzle = () => {
  const [answers, setAnswers] = useState({});
  const [letters, setLetters] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const answerBoxRefs = useRef({});

  const quiz = useQuizStore((state) => state.quiz);
  const completeLevel = useQuizStore((state) => state.completeLevel);
  const setLevelScore = useQuizStore((state) => state.setLevelScore);
  const questions = quiz.level2;

  // Initialize the refs in useEffect
  useEffect(() => {
    if (questions?.length > 0) {
      questions.forEach(question => {
        answerBoxRefs.current[question.question] = [];
      });
      resetPuzzle();
    }
  }, [questions]);

  useEffect(() => {
    if (questions?.length > 0) {
      resetPuzzle();
    }
  }, [questions]);

  const resetPuzzle = () => {
    const lettersObj = {};
    const answersObj = {};
    questions.forEach((question) => {
      const newLetters = question.answer.split('').map((char, i) => ({
        id: `${question.question}-${i}`,
        char,
      }));
      lettersObj[question.question] = [...newLetters].sort(() => Math.random() - 0.5);
      answersObj[question.question] = Array(question.answer.length).fill(null);
    });
    setLetters(lettersObj);
    setAnswers(answersObj);
  };

  const resetQuestion = (questionText) => {
    const question = questions.find((q) => q.question === questionText);
    const newLetters = question.answer.split('').map((char, i) => ({
      id: `${questionText}-${i}`,
      char,
    }));
    setLetters((prevLetters) => ({
      ...prevLetters,
      [questionText]: [...newLetters].sort(() => Math.random() - 0.5),
    }));
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionText]: Array(question.answer.length).fill(null),
    }));
  };

  const handleGestureEvent = (event, id, questionText) => {
    // Handle the gesture event if needed
  };

  // Update the handleGestureEnd function
  const handleGestureEnd = async (event, id, questionText) => {
    const targetBoxIndex = answers[questionText].findIndex((box) => box === null);
    const droppedLetter = letters[questionText].find((letter) => letter.id === id);

    if (targetBoxIndex !== -1 && droppedLetter) {
      // Get the target box reference
      const boxRef = answerBoxRefs.current[questionText][targetBoxIndex];

      if (!boxRef) return;

      // Measure the box position
      const measurePromise = new Promise(resolve => {
        boxRef.measure((x, y, width, height, pageX, pageY) => {
          resolve({ pageX, pageY, width, height });
        });
      });

      const boxMeasurements = await measurePromise;

      // Calculate if the letter was dropped within the box bounds
      const isWithinX = event.absoluteX >= boxMeasurements.pageX &&
          event.absoluteX <= boxMeasurements.pageX + boxMeasurements.width;
      const isWithinY = event.absoluteY >= boxMeasurements.pageY &&
          event.absoluteY <= boxMeasurements.pageY + boxMeasurements.height;

      if (isWithinX && isWithinY) {
        setLetters((prevLetters) => ({
          ...prevLetters,
          [questionText]: prevLetters[questionText].filter((letter) => letter.id !== id),
        }));
        setAnswers((prevAnswers) => {
          const newAnswer = [...prevAnswers[questionText]];
          newAnswer[targetBoxIndex] = droppedLetter.char;
          return { ...prevAnswers, [questionText]: newAnswer };
        });
      }
    }
  };

  // Update the answer box rendering to include refs
  const renderAnswerBoxes = (question) => (
      <View style={styles.answerBoxes}>
        {answers[question.question]?.map((char, idx) => (
            <View
                key={idx}
                ref={ref => {
                  if (!answerBoxRefs.current[question.question]) {
                    answerBoxRefs.current[question.question] = [];
                  }
                  answerBoxRefs.current[question.question][idx] = ref;
                }}
                style={styles.answerBox}
            >
              <Text style={styles.boxText}>{char || ''}</Text>
            </View>
        ))}
      </View>
  );


  const handleShuffle = (questionText) => {
    setLetters((prevLetters) => ({
      ...prevLetters,
      [questionText]: [...prevLetters[questionText]].sort(() => Math.random() - 0.5),
    }));
  };

  const handleDone = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setIsResultsVisible(true);

      const calculatedScore = questions.reduce((acc, question) => {
        const userAnswer = (answers[question.question] || []).join('').toLowerCase();
        const correctAnswer = question.answer.toLowerCase();
        return acc + (userAnswer === correctAnswer ? 1 : 0);
      }, 0);

      const level2Score = Math.round((calculatedScore / questions.length) * 10);
      await setLevelScore(2, level2Score);

      setScore(calculatedScore);
      setModalVisible(true);

      await completeLevel(2);
    } catch (error) {
      console.error('Error in handleDone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuit = () => {
    router.push("/app2/HomePage");
  };

  const renderQuestion = (question, index) => (
      <View key={index} style={styles.questionContainer}>
        <LinearGradient
            colors={["#a8d38d", "#fee135", "#a8d38d"]}
            style={styles.questionGradient}
        >
          <Text style={styles.questionNumber}>Question {index + 1}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </LinearGradient>

        <View style={styles.letterBank}>
          {letters[question.question]?.map((letter) => (
              <DraggableLetter
                  key={letter.id}
                  letter={letter}
                  onGestureEvent={(e) => handleGestureEvent(e, letter.id, question.question)}
                  onGestureEnd={(e) => handleGestureEnd(e, letter.id, question.question)}
              />
          ))}
        </View>

        {renderAnswerBoxes(question)}

        {isResultsVisible && (
            <View style={styles.feedbackContainer}>
              {answers[question.question] ? (
                  answers[question.question].join('').toLowerCase() === question.answer.toLowerCase() ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AntDesign name="checkcircle" size={20} color="#2e7d32" />
                        <Text style={[styles.feedbackText, styles.correctFeedbackText]}> Correct!</Text>
                      </View>
                  ) : (
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <AntDesign name="closecircle" size={20} color="#d32f2f" />
                          <Text style={[styles.feedbackText, styles.incorrectFeedbackText]}> Incorrect!</Text>
                        </View>
                        <Text style={[styles.feedbackText, styles.correctAnswerText]}>
                          Correct answer: {question.answer}
                        </Text>
                      </View>
                  )
              ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name="closecircle" size={20} color="#d32f2f" />
                    <Text style={[styles.feedbackText, styles.incorrectFeedbackText]}> Not answered</Text>
                  </View>
              )}
            </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity style={styles.icon} onPress={() => handleShuffle(question.question)}>
            <AntDesign name="retweet" size={24} color="#74b72e" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon} onPress={() => resetQuestion(question.question)}>
            <AntDesign name="reload1" size={24} color="#FF0000" />
          </TouchableOpacity>
        </View>
      </View>
  );

  let [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Drag and Drop</Text>
              <Button
                  color={'#000'}
                  backgroundColor={'#dedcdc'}
                  size="$3"
                  mt={'$2'}
                  onPress={handleQuit}
              >
                Back to home
              </Button>
            </View>

            <Text style={styles.instructions}>
              Drag the letters into the boxes to form the correct word
            </Text>

            {questions?.map((question, index) => renderQuestion(question, index))}

            {!isResultsVisible && (
                <Button
                    color={'#fff'}
                    backgroundColor={'#93dc5c'}
                    size="$5"
                    mt={'$2'}
                    onPress={handleDone}
                >
                  Done
                </Button>
            )}
          </ScrollView>

          <Modal
              animationType="none"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>
                  Score: {score}/{questions?.length}
                </Text>
                <TouchableOpacity style={styles.modalButton} onPress={handleQuit}>
                  <Text style={styles.modalButtonText}>Back to Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </GestureHandlerRootView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d8ffb1",
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#a8d38d",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  headerText: {
    color: "#fee135",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#2b2713",
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 4,
  },
  instructions: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#354a21",
    textAlign: "center",
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 25,
    backgroundColor: "#F5f5d1",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
  },
  questionGradient: {
    padding: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#354a21",
    marginBottom: 5,
  },
  questionText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#354a21",
  },
  letterBank: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#F5f5d1",
  },
  letter: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    backgroundColor: "#a8d38d",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  letterText: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#Ffffe0",
  },
  answerBoxes: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
    width: "100%",
  },
  answerBox: {
    width: 30,
    height: 32,
    borderWidth: 2,
    borderColor: "#fee135",
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    backgroundColor: "#ECF0F1",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  boxText: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#2C3E50",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  icon: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  feedbackContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginLeft: 8,
    flex: 1,
  },
  correctFeedbackText: {
    color: "#2e7d32",
    fontWeight: "600",
  },
  incorrectFeedbackText: {
    color: "#d32f2f",
    fontWeight: "600",
  },
  correctAnswerText: {
    color: "#2e7d32",
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    marginTop: 4,
    marginLeft: 28,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#2C3E50",
  },
  modalButton: {
    backgroundColor: "#93dc5c",
    padding: 15,
    borderRadius: 8,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  doneButton: {
    backgroundColor: "#93dc5c",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  doneButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  }
});

export default DynamicDragDropPuzzle;
