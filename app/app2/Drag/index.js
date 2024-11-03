import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Modal, Platform, StatusBar } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts, Poppins_600SemiBold, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const DraggableLetter = ({ letter, onDrop }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
  }));

  const onGestureEvent = (event) => {
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
  };

  const onGestureEnd = (event) => {
    onDrop(event.nativeEvent, letter);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
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
  const router = useRouter();

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

  const handleDrop = (event, letter, questionText) => {
    const targetBoxIndex = answers[questionText].findIndex(box => box === null);
    
    if (targetBoxIndex !== -1) {
      setLetters(prev => ({
        ...prev,
        [questionText]: prev[questionText].filter(l => l.id !== letter.id)
      }));
      
      setAnswers(prev => {
        const newAnswers = { ...prev };
        newAnswers[questionText][targetBoxIndex] = letter.char;
        return newAnswers;
      });
    }
  };

  const handleShuffle = (questionText) => {
    setLetters(prev => ({
      ...prev,
      [questionText]: [...prev[questionText]].sort(() => Math.random() - 0.5)
    }));
  };

  const handleReset = (questionText) => {
    const question = questions.find(q => q.text === questionText);
    const newLetters = question.answer.split('').map((char, i) => ({
      id: `${questionText}-${i}`,
      char,
    }));
    setLetters(prev => ({
      ...prev,
      [questionText]: [...newLetters].sort(() => Math.random() - 0.5)
    }));
    setAnswers(prev => ({
      ...prev,
      [questionText]: Array(question.answer.length).fill(null)
    }));
  };

  const handleDone = () => {
    const calculatedScore = questions.reduce((acc, question) => {
      const userAnswer = answers[question.text]?.join('') || '';
      return acc + (userAnswer === question.answer ? 1 : 0);
    }, 0);
    setScore(calculatedScore);
    setModalVisible(true);
  };

  const handleQuit = () => {
    setModalVisible(false);
    router.push('app2/HomePage');
  };

  let [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Word Puzzle Challenge</Text>
          </View>
          
          {questions.map((question, index) => (
            <View key={index} style={styles.questionContainer}>
              <LinearGradient
                colors={['#a8d38d', '#fee135', '#a8d38d']}
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
                    onDrop={(event) => handleDrop(event, letter, question.text)}
                  />
                ))}
              </View>

              <View style={styles.answerBoxes}>
                {Array(question.answer.length).fill(null).map((_, idx) => (
                  <View key={idx} style={styles.answerBox}>
                    <Text style={styles.boxText}>
                      {answers[question.text]?.[idx] || ''}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.controls}>
                <TouchableOpacity onPress={() => handleShuffle(question.text)}>
                  <Icon name="shuffle-variant" size={30} color="#74b72e" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReset(question.text)}>
                  <Icon name="refresh" size={30} color="#FF0000" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
              <Text style={styles.buttonText}>Quit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Score: {score}/{questions.length}</Text>
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
    backgroundColor: '#d8ffb1',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a8d38d',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    fontSize: 27,
    color: '#fee135',
    fontFamily: 'Poppins_600SemiBold',
    textShadowColor: '#2b2713',
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 4,
  },
  questionContainer: {
    marginBottom: 25,
    backgroundColor: '#F5f5d1',
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
    color: '#354a21',
    marginBottom: 5,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#354a21',
  },
  letterBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F5f5d1',
  },
  letter: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#a8d38d',
    borderRadius: 8,
    elevation: 3,
  },
  letterText: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: '#Ffffe0',
  },
  answerBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  answerBox: {
    width: 30,
    height: 32,
    borderWidth: 2,
    borderColor: '#fee135',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    backgroundColor: '#ECF0F1',
    borderRadius: 8,
  },
  boxText: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2C3E50',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 15,
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
  doneButton: {
    backgroundColor: '#93dc5c',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    elevation: 3,
  },
  buttonText: {
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2C3E50',
  },
  modalButton: {
    backgroundColor: '#93dc5c',
    padding: 15,
    borderRadius: 8,
    minWidth: 150,
  },
  modalButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
},
});

export default LetterDragDropPuzzle;
