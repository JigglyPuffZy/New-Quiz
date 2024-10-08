import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, SafeAreaView, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

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
      ["S", "H", "O", "T", "M", "E", "T", "A", "R", "P", "O", "H", "I", "S"],
      ["C", "O", "M", "D", "P", "I", "E", "O", "T", "I", "N"],
      ["Y", "H", "P", "I", "S", "C", "S"],
    ]);
    setSelectedLetterIndices([]);
  };

  const renderAnswerItem = ({ item, index }) => (
    <View key={index} style={styles.answerContainer}>
      <Text style={styles.answerLabel}>Answer:</Text>
      <TouchableOpacity
        style={[styles.answerBox, selectedAnswers[index] && styles.mergedQuestionBox]}
        onPress={() => handleDrop(index)}
        accessible={true}
        accessibilityLabel="Answer drop zone"
      >
        <Text style={styles.answerText}>
          {selectedAnswers[index] ? selectedAnswers[index].question : "Your answer will be displayed here."}
        </Text>
      </TouchableOpacity>

      <View style={styles.lettersContainer}>
        <View style={styles.letterRow}>
          {shuffledLetters[index].map((letter, letterIndex) => (
            <TouchableOpacity
              key={letterIndex}
              style={styles.letterButton}
              onPress={() => handleLetterPress(index, letterIndex)}
              accessible={true}
              accessibilityLabel={`Letter ${letter}`}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.shuffleButton} onPress={() => shuffleLetters(index)}>
          <Icon name="shuffle" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
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
        <Icon name="reorder-three" size={20} color="#ffffff" style={styles.questionIcon} />
      </TouchableOpacity>
    );
  }, [selectedQuestionIndex, usedQuestions]);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={answers}
        keyExtractor={(item, index) => `answer-${index}`}
        renderItem={renderAnswerItem}
        ListHeaderComponent={
          <>
            <Text style={styles.levelText}>Level 3</Text>
            <Text style={styles.instructionText}>
              Click on a question to select it, then click on an answer box to place it below.
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

      <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
        <Text style={styles.quitButtonText}>Quit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Your Score: {score.toFixed(2)}%</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleSeeAnswers}>
              <Text style={styles.modalButtonText}>See Answers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAnswersModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.answersModalContainer}>
            <ScrollView style={styles.answersScrollView}>
              {renderAnswers()}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeAnswersModal}>
              <Text style={styles.modalCloseButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C7AE0',
  },
  levelText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Inter-ExtraBold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
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
    width: width * 0.95,
    alignSelf: 'center',
  },
  answerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    elevation: 8,
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  questionBox: {
    backgroundColor: 'rgba(61, 109, 161, 0.8)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 'auto',
    borderColor: '#fff',
    borderWidth: 2,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  selectedQuestionBox: {
    backgroundColor: 'rgba(61, 109, 161, 1)',
    transform: [{ scale: 1.05 }],
  },
  answerBox: {
    backgroundColor: 'rgba(61, 109, 161, 0.9)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 5,
    padding: 10,
    minHeight: 60,
  },
  mergedQuestionBox: {
    backgroundColor: 'rgba(61, 109, 161, 1)',
  },
  answerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    maxWidth: width * 0.95,
  },
  letterButton: {
    backgroundColor: 'rgba(61, 109, 161, 0.9)',
    padding: 12,
    margin: 6,
    borderRadius: 10,
    elevation: 5,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  letterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  shuffleButton: {
    backgroundColor: 'rgba(61, 109, 161, 0.9)',
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  questionText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resetButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 25,
    elevation: 5,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  questionIcon: {
    marginTop: 10,
  },
  quitButton: {
    backgroundColor: '#FF0000',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    elevation: 5,
  },
  quitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#3D6DA1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    elevation: 5,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
  },
  answersModalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
  },
  answersScrollView: {
    width: '100%',
    marginBottom: 20,
  },
  answerItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  answerItemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  correctAnswer: {
    color: 'green',
  },
  wrongAnswer: {
    color: 'red',
  },
  modalButton: {
    backgroundColor: '#3D6DA1',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 5,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameScreen;

