import React, { useState, useEffect } from "react";
import { create } from "zustand";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";

export const useQuizStore = create((set) => ({
  quiz: {
    level1: [],
    level2: [],
    level3: [],
    level4: [],
  },
  currentLevel: 1,
  setQuiz: (data) => set({ quiz: data }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  reset: () =>
    set({
      quiz: {
        level1: [],
        level2: [],
        level3: [],
        level4: [],
      },
      currentLevel: 1,
    }),
}));

const SimpleUploadOrCapture = () => {
  const [fileUri, setFileUri] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileResult, setFileResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false); // New state for generation status
  const [generatedQuestions, setGeneratedQuestions] = useState([]); // Added state for questions
  const router = useRouter();

  //zustand
  const { setQuiz } = useQuizStore();

  const handleUploadDocument = async () => {
    console.log("Starting...");
    try {
      console.log("Before Documentpicker");
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
      });
      console.log("After Documentpicker result: ", result);
      const selectedUri = result.assets?.[0]?.uri;
      const selectedName = result.assets?.[0]?.name;

      console.log("File selected - URI:", selectedUri);
      setFileUri(selectedUri);
      setFileName(selectedName);
      setFileResult(result);
    } catch (error) {
      console.error("Error uploading document:", error);
      Alert.alert("Error", "Failed to upload the file. Please try again.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  useEffect(() => {
    console.log("fileUri changed to:", fileUri);
  }, [fileUri]);

  useEffect(() => {
    console.log("fileName changed to:", fileName);
  }, [fileName]);

  const handleSubmit = async () => {
    if (!fileUri || !fileResult) {
      Alert.alert("Error", "No file selected for upload.");
      return;
    }

    setModalVisible(true);
    setLoadingMessage("Processing PDF...");
    try {
      const file = fileResult.assets[0];

      // First get the base64 data of the file
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const base64Promise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Remove the data:application/pdf;base64, part
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Data = await base64Promise;
      console.log("Base64 data length:", base64Data.length);

      // Send the base64 data to server
      const uploadResponse = await axios.post(
        "https://quizwhirl-production.up.railway.app/api/parse-pdf-text",
        {
          file: base64Data,
          filename: file.name,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", uploadResponse.data);

      if (uploadResponse.data.error) {
        throw new Error(uploadResponse.data.error);
      }

      setQuiz(uploadResponse.data);
      setLoadingMessage("Text extracted successfully!");
      setSuccess(true);
      setIsGenerated(true);
    } catch (error) {
      console.error("Processing Error:", error);
      Alert.alert("Error", "Failed to extract text from PDF");
    } finally {
      if (!success) {
        setModalVisible(false);
      }
    }
  };

  const handleReset = () => {
    setFileUri(null);
    setFileName(null);
    setGeneratedQuestions([]);
    setSuccess(false);
    setIsGenerated(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Upload or Capture</Text>

      {/* Start Button */}
      <TouchableOpacity
        style={[
          styles.startButton,
          (!fileName && !fileUri) || !isGenerated
            ? styles.disabledButton
            : styles.successButton,
        ]}
        onPress={() => {
          if (fileName || fileUri) {
            router.push("/app2/HomePage");
          }
        }}
        disabled={(!fileName && !fileUri) || !isGenerated}
      >
        <Text style={styles.buttonText}>► Start the test</Text>
      </TouchableOpacity>

      {/* Submit and Reset Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, styles.successButton]}
          onPress={handleSubmit}
          disabled={!fileName && !fileUri}
        >
          <Text style={styles.buttonText}>✓ Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.buttonText}>↻ Reset</Text>
        </TouchableOpacity>
      </View>
      
      {/* File Upload Preview */}
      <View>
        {fileName && (
          <View>
            <Text>Uploaded document:</Text>
            <Text>{fileName}</Text>
          </View>
        )}
        {!fileName && !fileUri && !loading && <Text>No file selected</Text>}
      </View>

      {/* Upload Button */}
      <TouchableOpacity style={styles.button} onPress={handleUploadDocument}>
        <Text style={styles.buttonText}>📁 Upload</Text>
      </TouchableOpacity>

      {/* Generated Questions Section */}
      {isGenerated && generatedQuestions.length > 0 && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>Generated Questions:</Text>
          {generatedQuestions.map((question, index) => (
            <Text key={index} style={styles.questionText}>
              {index + 1}. {question}
            </Text>
          ))}
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.buttonText}>◀ Back</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{loadingMessage}</Text>
            {!success ? (
              <ActivityIndicator size="large" color="#74b72e" />
            ) : (
              <FontAwesome name="check-circle" size={50} color="green" />
            )}
            {success && (
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#d8ffb1",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 30,
    top: 20,
    color: "#354a21",
    textAlign: "center",
    textShadowColor: "#fee135",
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 5,
  },
  startButton: {
    backgroundColor: "#a8d38d",
    paddingVertical: 10,
    paddingHorizontal: 23,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a8d38d",
    paddingVertical: 10,
    paddingHorizontal: 23,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    top: 10,
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignSelf: "center",
    marginHorizontal: 10,
  },
  successButton: {
    backgroundColor: "#74b72e",
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  resetButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignSelf: "center",
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#354a21",
    fontSize: 20,
    fontWeight: "bold",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textShadowColor: "#fee135",
  },
  loading: {
    marginVertical: 20,
  },
  previewContainer: {
    width: "100%",
    maxHeight: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 3,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 20,
  },
  fileContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  fileText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  fileName: {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "bold",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  infoText: {
    fontSize: 16,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  closeButtonText: {
    marginTop: 10,
    fontSize: 16,
    color: "#74b72e",
  },
  backButton: {
    backgroundColor: "#e8e8e8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  questionContainer: {
    width: "100%",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    alignItems: "flex-start",
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#354a21",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
});

export default SimpleUploadOrCapture;
