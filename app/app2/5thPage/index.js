import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFonts, Inter_600SemiBold, Inter_400Regular } from '@expo-google-fonts/inter';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router'; // Updated import

const { width } = Dimensions.get('window');

const DraggableLetter = ({ letter, onGestureEvent, onGestureEnd }) => {
  const animatedX = useSharedValue(letter.x);
  const animatedY = useSharedValue(letter.y);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: animatedX.value }, { translateY: animatedY.value }],
    transition: { type: 'spring', damping: 6, stiffness: 100 },
  }));

  return (
    <PanGestureHandler
      onGestureEvent={(event) => {
        animatedX.value = event.nativeEvent.translationX;
        animatedY.value = event.nativeEvent.translationY;
        onGestureEvent(event.nativeEvent, letter.id);
      }}
      onEnded={(event) => {
        animatedX.value = withSpring(0, { damping: 6, stiffness: 100 });
        animatedY.value = withSpring(0, { damping: 6, stiffness: 100 });
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
  const router = useRouter(); // Initialize router

  const questions = [
    { text: 'Form a word related to "JavaScript"', answer: 'REACT' },
    { text: 'Form a word related to "Mobile"', answer: 'ANDROID' },
    { text: 'Form a word related to "Web"', answer: 'HTML' },
    { text: 'Form a word related to "Database"', answer: 'SQL' },
    { text: 'Form a word related to "Design"', answer: 'UX' },
    { text: 'Form a word related to "Programming"', answer: 'PYTHON' },
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
        x: 0,
        y: 0,
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
      x: 0,
      y: 0,
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
    setLetters((prevLetters) => ({
      ...prevLetters,
      [questionText]: prevLetters[questionText].map((letter) =>
        letter.id === id ? { ...letter, x: event.translationX, y: event.translationY } : letter
      ),
    }));
  };

  const handleGestureEnd = (event, id, questionText) => {
    const targetBoxIndex = answers[questionText].findIndex((box) => box === null);
    const droppedLetter = letters[questionText].find((letter) => letter.id === id);

    if (targetBoxIndex !== -1 && droppedLetter) {
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

  const renderQuestion = (question, index) => (
    <View key={index} style={styles.questionContainer}>
      <Text style={styles.questionNumber}>{`Question ${index + 1}`}</Text>
      <Text style={styles.questionText}>{question.text}</Text>

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
            <Text style={styles.boxText}>{char || ''}</Text>
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.icon} onPress={() => handleShuffle(question.text)}>
          <Icon name="shuffle" size={32} color="#BCC18D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.icon} onPress={() => resetQuestion(question.text)}>
          <Icon name="refresh" size={32} color="#BCC18D" />
        </TouchableOpacity>
      </View>
    </View>
  );

  let [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Level 2: Word Puzzle Challenge</Text>
          <Text style={styles.instructions}>Drag the letters into the boxes to form the correct word.</Text>

          {questions.map((question, index) => renderQuestion(question, index))}

          <TouchableOpacity style={styles.doneButton} onPress={() => router.push('app2/6thPage')}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E89F', // Changed to a lighter background color
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff', // Changed to a darker color for better contrast
    marginBottom: 20,
    fontFamily: 'Inter_600SemiBold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  instructions: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
    fontFamily: 'Inter_400Regular',
  },
  questionContainer: {
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#ECF0F1',
    borderRadius: 10,
    shadowColor: '#BDC3C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  questionText: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
  },
  letterBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  letter: {
    width: 40,
    height: 40,
    backgroundColor: '#BCC18D', // Changed to a more muted color
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Added border radius for smoother corners
    shadowColor: '#2C3E50',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  letterText: {
    fontSize: 24,
    color: '#000000',
    fontFamily: 'Inter_600SemiBold',
  },
  answerBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  answerBox: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderColor: '#BDC3C7',
    borderWidth: 2,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Added border radius for smoother corners
    shadowColor: '#2C3E50',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  boxText: {
    fontSize: 24,
    color: '#000000',
    fontFamily: 'Inter_600SemiBold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: 20,
  },
  doneButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#BCC18D',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  doneText: {
    fontSize: 20,
    color: '#FFFFFF', // Adjusted text color for better visibility
    fontFamily: 'Inter_600SemiBold',
  },
  safeArea: {
    flex: 1,
  },
});

export default LetterDragDropPuzzle;