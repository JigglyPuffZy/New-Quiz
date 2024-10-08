import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Modal, Platform, StatusBar } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts, Poppins_600SemiBold, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
        animatedX.value = withSpring(0);
        animatedY.value = withSpring(0);
        onGestureEnd(event.nativeEvent, letter.id);
      }}
    >
      <Animated.View style={[styles.letter, animatedStyle]}>
        <Text style={styles.letterText}>{letter.char}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

const LetterDragDropPuzzle = () => {
  const [answers, setAnswers] = useState({});
  const [letters, setLetters] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef(null);

  const questions = [
    { text: 'Form a word related to "Narration"', answer: 'RECOUNT' },
    { text: 'Form a word related to "Fiction"', answer: 'NOVEL' },
    { text: 'Form a word related to "Editing"', answer: 'REVIEW' },
    { text: 'Form a word related to "Research"', answer: 'ANALYZE' },
    { text: 'Form a word related to "Syntax"', answer: 'FORMAT' },
    { text: 'Form a word related to "Audience"', answer: 'READER' },
    { text: 'Form a word related to "Context"', answer: 'SETTING' },
    { text: 'Form a word related to "Critique"', answer: 'REVIEW' },
    { text: 'Form a word related to "Thesis"', answer: 'SEARCH' },
    { text: 'Form a word related to "Genre"', answer: 'STYLE' },
  ];

  useEffect(() => {
    resetPuzzle();
  }, []);

  const resetPuzzle = () => {
    const lettersObj = {};
    const answersObj = {};
    questions.forEach((question) => {
      const newLetters = question.answer.split('').map((char, i) => ({
        id: `${question.text}-${i}`,
        char,
      }));
      lettersObj[question.text] = [...newLetters].sort(() => Math.random() - 0.5);
      answersObj[question.text] = Array(question.answer.length).fill(null);
    });
    setLetters(lettersObj);
    setAnswers(answersObj);
  };

  const resetQuestion = (questionText) => {
    const question = questions.find((q) => q.text === questionText);
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
    // This function can be left empty as we're handling the animation in the DraggableLetter component
  };

  const handleGestureEnd = (event, id, questionText) => {
    const targetBoxIndex = answers[questionText].findIndex((box) => box === null);
    const droppedLetter = letters[questionText].find((letter) => letter.id === id);

    if (targetBoxIndex !== -1 && droppedLetter && Math.abs(event.translationY) < 50) {
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
  };

  const handleShuffle = (questionText) => {
    setLetters((prevLetters) => ({
      ...prevLetters,
      [questionText]: [...prevLetters[questionText]].sort(() => Math.random() - 0.5),
    }));
  };

  const handleDone = () => {
    const calculatedScore = Object.keys(answers).reduce((acc, questionText) => {
      const correctAnswer = questions.find(q => q.text === questionText).answer;
      const userAnswer = answers[questionText].join('');
      return acc + (userAnswer === correctAnswer ? 1 : 0);
    }, 0);
    setScore(calculatedScore);
    setModalVisible(true);
  };

  const handleQuit = () => {
    router.push('app2/HomePage');
  };

  const handleSeeAnswers = () => {
    setShowCorrectAnswers(true);
    setModalVisible(false);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderQuestion = (question, index) => (
    <View key={index} style={styles.questionContainer}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.questionGradient}
      >
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
        <Text style={styles.questionText}>{question.text}</Text>
      </LinearGradient>

      <View style={styles.letterBank}>
        {letters[question.text]?.map((letter) => (
          <DraggableLetter
            key={letter.id}
            letter={letter}
            onGestureEvent={(e) => handleGestureEvent(e, letter.id, question.text)}
            onGestureEnd={(e) => handleGestureEnd(e, letter.id, question.text)}
          />
        ))}
      </View>

      <View style={styles.answerBoxes}>
        {answers[question.text]?.map((char, idx) => (
          <View key={idx} style={styles.answerBox}>
            <Text style={styles.boxText}>{showCorrectAnswers ? question.answer[idx] : (char || '')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.icon} onPress={() => handleShuffle(question.text)}>
          <Icon name="shuffle-variant" size={32} color="#3D6DA1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.icon} onPress={() => resetQuestion(question.text)}>
          <Icon name="refresh" size={32} color="#3D6DA1" />
        </TouchableOpacity>
      </View>
    </View>
  );

  let [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Level 2: Word Puzzle Challenge</Text>
          <Text style={styles.instructions}>Drag the letters into the boxes to form the correct word.</Text>

          {questions.map((question, index) => renderQuestion(question, index))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
              <Text style={styles.quitButtonText}>Quit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Your Score: {score}/{questions.length}</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.seeAnswersButton} onPress={handleSeeAnswers}>
                  <Text style={styles.seeAnswersText}>See Answers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.goBackButton} onPress={handleQuit}>
                  <Text style={styles.goBackText}>Go Back to Homepage</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F0F4F8',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#34495E',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
  overflow: 'hidden',
},
questionGradient: {
  padding: 15,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
},
questionNumber: {
  fontSize: 18,
  fontFamily: 'Poppins_600SemiBold',
  color: '#FFFFFF',
  marginBottom: 5,
},
questionText: {
  fontSize: 16,
  fontFamily: 'Poppins_400Regular',
  color: '#FFFFFF',
},
letterBank: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  padding: 15,
  backgroundColor: '#F8F9FA',
},
letter: {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  margin: 5,
  backgroundColor: '#4CAF50',
  borderRadius: 8,
  elevation: 3,
},
letterText: {
  fontSize: 24,
  fontFamily: 'Poppins_600SemiBold',
  color: '#FFFFFF',
},
answerBoxes: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginBottom: 15,
  paddingHorizontal: 15,
},
answerBox: {
  width: 40,
  height: 40,
  borderWidth: 2,
  borderColor: '#3498DB',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 5,
  backgroundColor: '#ECF0F1',
  borderRadius: 8,
},
boxText: {
  fontSize: 24,
  fontFamily: 'Poppins_600SemiBold',
  color: '#2C3E50',
},
controls: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingBottom: 15,
},
icon: {
  padding: 10,
  backgroundColor: '#ECF0F1',
  borderRadius: 25,
},
buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
},
quitButton: {
  backgroundColor: '#E74C3C',
  padding: 15,
  borderRadius: 8,
  flex: 1,
  marginRight: 10,
  elevation: 3,
},
quitButtonText: {
  color: '#FFFFFF',
  textAlign: 'center',
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 16,
},
doneButton: {
  backgroundColor: '#2ECC71',
  padding: 15,
  borderRadius: 8,
  flex: 1,
  marginLeft: 10,
  elevation: 3,
},
doneButtonText: {
  color: '#FFFFFF',
  textAlign: 'center',
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 16,
},
modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalView: {
  margin: 20,
  backgroundColor: 'white',
  borderRadius: 20,
  padding: 35,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  width: '80%',
},
modalText: {
  marginBottom: 15,
  textAlign: 'center',
  fontSize: 20,
  fontFamily: 'Poppins_600SemiBold',
  color: '#2C3E50',
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '100%',
},
seeAnswersButton: {
  backgroundColor: '#3498DB',
  padding: 12,
  borderRadius: 8,
  flex: 1,
  marginRight: 5,
},
seeAnswersText: {
  color: '#FFFFFF',
  textAlign: 'center',
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 14,
},
goBackButton: {
  backgroundColor: '#E74C3C',
  padding: 12,
  borderRadius: 8,
  flex: 1,
  marginLeft: 5,
},
goBackText: {
  color: '#FFFFFF',
  textAlign: 'center',
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 14,
},
}
);

export default LetterDragDropPuzzle;
