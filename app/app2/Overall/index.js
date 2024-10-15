import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function OverallScore({ scores = [], totalQuestions = 0 }) {
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const maxPossibleScore = totalQuestions * scores.length;
  const overallPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  return (
    <LinearGradient
      colors={['#2ecc71', '#27ae60']}
      style={styles.container}
    >
      <Text style={styles.title}>Performance Overview</Text>
      <View style={styles.scoreCard}>
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{overallPercentage.toFixed(1)}%</Text>
          <Text style={styles.percentageLabel}>Overall</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailsContainer}>
          <Text style={styles.totalScore}>Total: {totalScore}/{maxPossibleScore}</Text>
          {scores.map((score, index) => (
            <View key={index} style={styles.levelScoreContainer}>
              <Text style={styles.levelLabel}>Level {index + 1}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${totalQuestions > 0 ? (score / totalQuestions) * 100 : 0}%` }]} />
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
    color: '#2ecc71',
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
    backgroundColor: '#2ecc71',
    borderRadius: 4,
  },
  levelScore: {
    width: 40,
    fontSize: 14,
    color: '#34495e',
    textAlign: 'right',
  },
});
