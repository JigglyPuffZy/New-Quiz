import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router'; // Import useRouter hook

export default function Dashboard() {
  const [selectedLevel, setSelectedLevel] = useState(null); // State to track the selected level
  const [fontsLoaded, setFontsLoaded] = useState(false); // State to track if fonts are loaded
  const router = useRouter(); // Use the router hook

  // Load custom fonts
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'DancingScript-Bold': require('../../../assets/fonts/DancingScript-Bold.ttf'), // Adjust the path as needed
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  const handleCardPress = (level) => {
    setSelectedLevel(level); // Update the selected level
  };

  const handleStartPress = () => {
    // Navigate to different routes based on the selected level
    if (selectedLevel === 1) {
      router.push(`/app2/MultipleChoice?level=${selectedLevel}`); // Route for Level 1
    } else if (selectedLevel === 2) {
      router.push(`/app2/Drag`); // Route for Level 2
    } else if (selectedLevel === 3) {
      router.push(`/app2/Guess`); // Route for Level 3
    } else if (selectedLevel === 4) {
      router.push(`/app2/Identification`); // Route for Level 4
    }
  };

  if (!fontsLoaded) {
    return null; // Render nothing while loading fonts
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View>
            <Text style={styles.greeting}>Hi, John</Text>
            <Text style={styles.subtitle}>Let's make this day productive</Text>
          </View>
        </View>

        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Welcome to Quiz Whirl!</Text>

        {/* Card Section */}
        <View style={styles.cardsContainer}>
          {/* Card: Level 1 */}
          <TouchableOpacity
            style={[styles.card, selectedLevel === 1 && styles.selectedCard]} // Change style when selected
            onPress={() => handleCardPress(1)}
          >
            <Image
              source={{ uri: 'https://png.pngtree.com/png-vector/20230903/ourmid/pngtree-3d-student-maintain-cleanliness-png-image_9943479.png' }} // Replace with actual icon link
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Level 1</Text>
            <Text style={styles.cardSubtitle}>Multiple Choice</Text>
          </TouchableOpacity>

          {/* Card: Level 2 */}
          <TouchableOpacity
            style={[styles.card, selectedLevel === 2 && styles.selectedCard]}
            onPress={() => handleCardPress(2)}
          >
            <Image
              source={{ uri: 'https://static.vecteezy.com/system/resources/previews/022/484/389/original/shy-3d-student-boy-with-notebook-on-white-background-transparent-background-free-png.png' }} // Replace with actual icon link
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Level 2</Text>
            <Text style={styles.cardSubtitle}>Drag and Drop</Text>
          </TouchableOpacity>

          {/* Card: Level 3 */}
          <TouchableOpacity
            style={[styles.card, selectedLevel === 3 && styles.selectedCard]}
            onPress={() => handleCardPress(3)}
          >
            <Image
              source={{ uri: 'https://static.vecteezy.com/system/resources/previews/024/830/931/original/3d-cute-smiling-university-or-college-student-studying-with-laptop-on-his-lap-transparent-student-3d-render-3d-student-character-isolated-on-transparent-background-student-studying-generative-ai-png.png' }} // Replace with actual icon link
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Level 3</Text>
            <Text style={styles.cardSubtitle}>Guess</Text>
          </TouchableOpacity>

          {/* Card: Level 4 */}
          <TouchableOpacity
            style={[styles.card, selectedLevel === 4 && styles.selectedCard]}
            onPress={() => handleCardPress(4)}
          >
            <Image
              source={{ uri: 'https://static.vecteezy.com/system/resources/previews/022/484/303/original/creative-3d-student-boy-with-paintbrush-on-white-background-transparent-background-free-png.png' }} // Replace with actual icon link
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Level 4</Text>
            <Text style={styles.cardSubtitle}>Identification</Text>
          </TouchableOpacity>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartPress}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E7E89F', // Softer background color for better blending
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF', // White background for the main container
    borderRadius: 12, // Rounded corners for the container
    margin: 16, // Margin around the container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // Shadow for Android
    top: 100,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26, // Larger greeting text
    fontWeight: 'bold',
    color: '#000', // Darker color for better contrast
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D', // Subtitle color
  },
  welcomeText: {
    fontSize: 40, // Larger font size for better emphasis
    fontWeight: 'bold',
    fontFamily: 'DancingScript-Bold', // Use the Dancing Script font
    marginVertical: 10,
    textAlign: 'center', // Centered text
    color: '#BCC18D', // Dark text for contrast
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#E7E89F', // Softened card background color
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '48%', // Card width
    elevation: 3,
    alignItems: 'center', // Center align items in the card
  },
  selectedCard: {
    borderColor: '#BCC18D', // Muted border color when selected
    borderWidth: 2,
  },
  cardIcon: {
    width: 70, // Increased icon size for better visibility
    height: 70, // Increased icon size for better visibility
    marginBottom: 10,
    resizeMode: 'contain', // Ensure the icon scales appropriately
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  startButton: {
    backgroundColor: '#BCC18D', // Softened start button color
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#2C3E50', // Dark text for contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
});
