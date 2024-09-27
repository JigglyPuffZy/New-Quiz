import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const GameScreen = () => {
  const [answers] = useState([
    { word: "METAMORPH", letters: "OAMHMTIEP", question: "What is the change of form or structure?" }, // 7 letters
    { word: "BREAKDOWN", letters: "RBEODKNA", question: "What is the process of separating into parts?" }, // 8 letters
    { word: "DISSOLVE", letters: "VDLSSIE", question: "What happens when a solid mixes into a liquid?" }, // 7 letters
  ]);

  const [shuffledLetters, setShuffledLetters] = useState([
    ["M", "H", "O", "T", "M", "E", "T", "A", "R", "P", "O", "H",],
    ["N", "B", "R", "E", "K", "W", "D", "O",],
    ["D", "S", "S", "I", "L", "V", "E","O"],
  ]);

  const [selectedAnswers, setSelectedAnswers] = useState(Array(answers.length).fill(null));
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [selectedLetterIndices, setSelectedLetterIndices] = useState([]);

  const handleDrop = (dropZoneIndex) => {
    if (selectedQuestionIndex !== null) {
      const newSelectedAnswers = [...selectedAnswers];
      newSelectedAnswers[dropZoneIndex] = answers[selectedQuestionIndex];

      // Remove alert logic to not show modals when dropping answers
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

  const handleDone = () => {
    // Optional: Logic to handle when the user indicates they've finished
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

      {/* Done Button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E7E89F', // Updated background color
  },
  
  levelText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff', // White color for main text
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    textShadowColor: '#000000', // Black color for the outline
    textShadowOffset: { width: 1, height: 1 }, // Offset for the outline
    textShadowRadius: 2, // Radius for the blur of the outline
  },
  instructionText: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  questionsContainer: {
    marginBottom: 20,
    width: width * 0.9,
    left:18,
  },
  answerContainer: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    elevation: 4,
    marginBottom: 15,
    padding: 10,
  },
  questionBox: {
    backgroundColor: '#BCC18D',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 'auto',
    borderColor: '#000000',
    borderWidth: 2,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
      
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  selectedQuestionBox: {
    backgroundColor: '#BCC18D',
  },
  answerBox: {
    backgroundColor: '#BCC18D', // Updated answer box color
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BCC18D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 2,
    padding: 5,
    minHeight: 50,
  },
  mergedQuestionBox: {
    backgroundColor: '#BCC18D',
  },
  answerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    textShadowColor: '#000000', // Black color for the outline
    textShadowOffset: { width: 1, height: 1 }, // Offset for the outline
    textShadowRadius: 2, // Radius for the blur of the outline
  },
  lettersContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  letterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: width * 0.9,
  },
  letterButton: {
    backgroundColor: '#BCC18D', // Updated letter button color
    padding: 10,
    margin: 5,
    borderRadius: 5,
    elevation: 2,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#000000', // Black color for the outline
    textShadowOffset: { width: 1, height: 1 }, // Offset for the outline
    textShadowRadius: 2, // Radius for the blur of the outline
  },
  shuffleButton: {
    backgroundColor: '#BCC18D',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  questionIcon: {
    marginTop: 10,
  },
  doneButton: {
    backgroundColor: '#BCC18D', // Green color for the done button
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Add some margin at the bottom
    marginHorizontal: 20, // Add some horizontal margin
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default GameScreen;
