import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function OverallScore({ scores = [], totalQuestions = 0 }) {
  const navigation = useNavigation();
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const maxPossibleScore = totalQuestions * scores.length;
  const overallPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#2ecc71';
    if (percentage >= 80) return '#3498db';
    if (percentage >= 70) return '#f1c40f';
    if (percentage >= 60) return '#e67e22';
    return '#e74c3c';
  };

  return (
    <LinearGradient
      colors={['#3498db', '#2980b9']}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Performance Overview</Text>
      <View style={styles.scoreCard}>
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentageText, { color: getGradeColor(overallPercentage) }]}>
            {overallPercentage.toFixed(1)}%
          </Text>
          <Text style={styles.percentageLabel}>Overall Score</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailsContainer}>
          <Text style={styles.totalScore}>Total: {totalScore}/{maxPossibleScore}</Text>
          {scores.map((score, index) => (
            <View key={index} style={styles.levelScoreContainer}>
              <Text style={styles.levelLabel}>Level {index + 1}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progress, 
                    { 
                      width: `${totalQuestions > 0 ? (score / totalQuestions) * 100 : 0}%`,
                      backgroundColor: getGradeColor((score / totalQuestions) * 100)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.levelScore}>{score}/{totalQuestions}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  percentageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  percentageLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 15,
  },
  detailsContainer: {
    marginTop: 10,
  },
  totalScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 15,
  },
  levelScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelLabel: {
    width: 60,
    fontSize: 14,
    color: '#7f8c8d',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  levelScore: {
    width: 40,
    fontSize: 14,
    color: '#34495e',
    textAlign: 'right',
  },
});
