import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Animated, ScrollView } from 'react-native';

const questions = [
  { id: '1', question: 'What is the capital of France?', correctAnswer: 'Paris' },
  { id: '2', question: 'Which planet is known as the Red Planet?', correctAnswer: 'Mars' },
  { id: '3', question: 'What is the largest ocean on Earth?', correctAnswer: 'Pacific Ocean' },
  { id: '4', question: 'What is the currency of Japan?', correctAnswer: 'Yen' },
  { id: '5', question: 'What is the chemical symbol for gold?', correctAnswer: 'Au' },
  { id: '6', question: 'What is the tallest mountain in the world?', correctAnswer: 'Mount Everest' },
  { id: '7', question: 'Which continent is known as the Dark Continent?', correctAnswer: 'Africa' },
  { id: '8', question: 'What is the largest planet in our solar system?', correctAnswer: 'Jupiter' },
];

const TypingGame = () => {
  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(''));
  const [headerVisible, setHeaderVisible] = useState(true);
  const [correctAnimation] = useState(new Animated.Value(0));

  const handleSubmit = () => {
    let newScore = 0;
    userAnswers.forEach((answer, index) => {
      if (answer.trim().toLowerCase() === questions[index].correctAnswer.toLowerCase()) {
        newScore += 1;
      }
    });
    Alert.alert(`Quiz finished! Your score: ${newScore}/${questions.length}`);
  };

  const handleChange = (text, index) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = text;
    setUserAnswers(updatedAnswers);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setHeaderVisible(offsetY === 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {headerVisible && (
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Level 4</Text>
          <Text style={styles.instructions}>Type your answer to each question below:</Text>
        </View>
      )}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        onScroll={handleScroll} 
        scrollEventThrottle={16}
      >
        {questions.map((q, index) => (
          <View key={q.id} style={styles.questionContainer}>
            <Text style={styles.question}>{`${index + 1}. ${q.question}`}</Text>
            <TextInput
              style={styles.input}
              value={userAnswers[index]}
              onChangeText={(text) => handleChange(text, index)}
              placeholder="Type your answer here"
              placeholderTextColor="#888"
              returnKeyType="done"
              onSubmitEditing={() => handleChange('', index + 1)}
            />
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.correctIndicator, { opacity: correctAnimation }]}>
        <Text style={styles.correctText}>✔️ Correct!</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#E7E89F',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3B3B3B',
    marginBottom: 5,
  },
  instructions: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BCC18D',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  question: {
    fontSize: 22,
    marginBottom: 10,
    textAlign: 'left',
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BCC18D',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#BCC18D',
    padding: 10,
    borderRadius: 10,
    width: '50%',
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    bottom:10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  correctIndicator: {
    position: 'absolute',
    top: 50,
    backgroundColor: 'rgba(0, 255, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  correctText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default TypingGame;
