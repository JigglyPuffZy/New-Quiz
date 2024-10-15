import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, SafeAreaView, Modal, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const GameScreen = () => {
  const router = useRouter();
  const [answers] = useState([
    { word: "METAMORPH", letters: "OAMHMTIEP", question: "What is the change of form or structure?" },
    { word: "BREAKDOWN", letters: "RBEODKNA", question: "What is the process of separating into parts?" },
    { word: "DISSOLVE", letters: "VDLSSIE", question: "What happens when a solid mixes into a liquid?" },
  ]);

  const [shuffledLetters, setShuffledLetters] = useState([
    ["M", "H", "O", "T", "M", "E", "T", "A", "R", "P", "O", "H"],
    ["N", "B", "R", "E", "K", "W", "D", "O"],
    ["D", "S", "S", "I", "L", "V", "E", "O"],
  ]);

  const [selectedAnswers, setSelectedAnswers] = useState(Array(answers.length).fill(null));
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [selectedLetterIndices, setSelectedLetterIndices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [score, setScore] = useState(0);

  const handleDrop = (dropZoneIndex) => {
    if (selectedQuestionIndex !== null) {
      const newSelectedAnswers = [...selectedAnswers];
      newSelectedAnswers[dropZoneIndex] = answers[selectedQuestionIndex];
      setSelectedAnswers(newSelectedAnswers);
      setUsedQuestions((prev) => new Set(prev).add(selectedQuestionIndex));
      setSelectedQuestionIndex(null);
    }
  };

  const handleLetterPress = (index, letterIndex) => {
    const currentSelection = [...selectedLetterIndices];

    if (currentSelection.length < 2) {
      currentSelection.push({ index, letterIndex });
      setSelectedLetterIndices(currentSelection);

      if (currentSelection.length === 2) {
        swapLetters(currentSelection[0], currentSelection[1]);
      }
    } else {
      setSelectedLetterIndices([{ index, letterIndex }]);
    }
  };

  const swapLetters = (first, second) => {
    const { index: firstIndex, letterIndex: firstLetterIndex } = first;
    const { index: secondIndex, letterIndex: secondLetterIndex } = second;

    const newShuffledLetters = [...shuffledLetters];
    [newShuffledLetters[firstIndex][firstLetterIndex], newShuffledLetters[secondIndex][secondLetterIndex]] =
      [newShuffledLetters[secondIndex][secondLetterIndex], newShuffledLetters[firstIndex][firstLetterIndex]];

    setShuffledLetters(newShuffledLetters);
    setSelectedLetterIndices([]);
  };

  const shuffleLetters = (index) => {
    const shuffled = [...shuffledLetters[index]].sort(() => Math.random() - 0.5);
    const newShuffledLetters = [...shuffledLetters];
    newShuffledLetters[index] = shuffled;
    setShuffledLetters(newShuffledLetters);
  };

  const handleQuestionPress = (index) => {
    setSelectedQuestionIndex(index);
  };

  const resetGame = () => {
    setSelectedAnswers(Array(answers.length).fill(null));
    setSelectedQuestionIndex(null);
    setUsedQuestions(new Set());
    setShuffledLetters([
      ["M", "H", "O", "T", "M", "E", "T", "A", "R", "P", "O", "H"],
      ["N", "B", "R", "E", "K", "W", "D", "O"],
      ["D", "S", "S", "I", "L", "V", "E", "O"],
    ]);
    setSelectedLetterIndices([]);
    setScore(0);
  };

  const calculateScore = () => {
    let correctAnswersCount = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer && answer.word === answers[index].word) {
        correctAnswersCount++;
      }
    });
    const calculatedScore = (correctAnswersCount / answers.length) * 100;
    return calculatedScore;
  };

  const handleDone = () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setShowModal(true);
  };

  const handleQuit = () => {
    router.push('app2/HomePage');
  };

  const closeModal = () => {
    setShowModal(false);
    router.push('app2/HomePage');
  };

  const handleSeeAnswers = () => {
    setShowModal(false);
    setShowAnswersModal(true);
  };

  const closeAnswersModal = () => {
    setShowAnswersModal(false);
    router.push('app2/HomePage');
  };

  const renderAnswers = () => {
    return answers.map((answer, index) => {
      const userAnswer = selectedAnswers[index];
      const isCorrect = userAnswer && userAnswer.word === answer.word;
      return (
        <View key={index} style={styles.answerItem}>
          <Text style={styles.answerItemText}>Question: {answer.question}</Text>
          <Text style={styles.answerItemText}>Correct Answer: {answer.word}</Text>
          <Text style={[styles.answerItemText, isCorrect ? styles.correctAnswer : styles.wrongAnswer]}>
            Your Answer: {userAnswer ? userAnswer.word : 'Not answered'}
          </Text>
        </View>
      );
    });
  };

  const renderAnswerItem = ({ item, index }) => (
    <BlurView intensity={20} tint="light" style={styles.answerContainer}>
      <Text style={styles.answerLabel}>Question {index + 1}</Text>
      <TouchableOpacity
        style={[styles.answerBox, selectedAnswers[index] && styles.mergedQuestionBox]}
        onPress={() => handleDrop(index)}
        accessible={true}
        accessibilityLabel="Answer drop zone"
      >
        <Text style={styles.answerText}>
          {selectedAnswers[index] ? selectedAnswers[index].question : "Tap to place your answer here"}
        </Text>
      </TouchableOpacity>

      <View style={styles.lettersContainer}>
        <View style={styles.letterRow}>
          {shuffledLetters[index].map((letter, letterIndex) => (
            <TouchableOpacity
              key={letterIndex}
              style={[styles.letterButton, selectedLetterIndices.some(item => item.index === index && item.letterIndex === letterIndex) && styles.selectedLetterButton]}
              onPress={() => handleLetterPress(index, letterIndex)}
              accessible={true}
              accessibilityLabel={`Letter ${letter}`}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.shuffleButton} onPress={() => shuffleLetters(index)}>
          <Ionicons name="shuffle" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  const renderQuestionItem = useCallback((item, index) => {
    if (usedQuestions.has(index)) return null;

    return (
      <TouchableOpacity
        key={`question-${index}`}
        style={[styles.questionBox, selectedQuestionIndex === index && styles.selectedQuestionBox]}
        onPress={() => handleQuestionPress(index)}
        accessible={true}
        accessibilityLabel={`Question ${index + 1}: ${item.question}`}
      >
        <Text style={styles.questionText} numberOfLines={2} ellipsizeMode="tail">
          {item.question}
        </Text>
        <Ionicons name="reorder-three" size={20} color="#ffffff" style={styles.questionIcon} />
      </TouchableOpacity>
    );
  }, [selectedQuestionIndex, usedQuestions]);

  return (
    <LinearGradient
      colors={['#2ecc71', '#27ae60']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={answers}
          keyExtractor={(item, index) => `answer-${index}`}
          renderItem={renderAnswerItem}
          ListHeaderComponent={
            <>
              <Text style={styles.levelText}>Level 3</Text>
              <Text style={styles.instructionText}>
                Select a question, then place it in an answer box below.
              </Text>
              <View style={styles.questionsContainer}>
                {answers.map((item, index) => renderQuestionItem(item, index))}
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
                <Text style={styles.resetButtonText}>Reset Game</Text>
              </TouchableOpacity>
            </>
          }
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.buttonText}>Quit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showModal} animationType="fade" transparent={true}>
          <BlurView intensity={80} tint="dark" style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Your Score: {score.toFixed(2)}%</Text>
              <TouchableOpacity style={styles.modalButton} onPress={handleSeeAnswers}>
                <Text style={styles.modalButtonText}>See Answers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Modal>

        <Modal visible={showAnswersModal} animationType="slide" transparent={true}>
          <BlurView intensity={80} tint="dark" style={styles.modalBackground}>
            <View style={styles.answersModalContainer}>
              <ScrollView style={styles.answersScrollView}>
                {renderAnswers()}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseButton} onPress={closeAnswersModal}>
                <Text style={styles.modalCloseButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  levelText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    marginVertical: 20,
    textAlign: 'center',
    fontFamily: 'Inter-ExtraBold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  instructionText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
    fontStyle: 'italic',
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.5,
  },
  questionsContainer: {
    marginBottom: 25,
    width: width - 40,
    alignSelf: 'center',
  },
  answerContainer: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 15,
    overflow: 'hidden',
  },
  answerLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  questionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedQuestionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ scale: 1.05 }],
  },
  answerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    padding: 15,
    minHeight: 60,
  },
  mergedQuestionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  answerText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  lettersContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  letterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: width - 40,
  },
  letterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    margin: 4,
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLetterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  letterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  shuffleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 25,
    bottom:20, 
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quitButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  doneButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  answersModalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  answersScrollView: {
    width: '100%',
    marginBottom: 20,
  },
  answerItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    borderRadius: 10,
  },
  answerItemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  correctAnswer: {
    color: '#27ae60',
  },
  wrongAnswer: {
    color: '#e74c3c',
  },
  modalButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default GameScreen;

