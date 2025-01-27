import React from 'react';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import { Button, XStack } from 'tamagui';
import {useQuizStore} from "../app/app2/upload";

const QuizResultsPDF = () => {
    const { quiz, levelScores } = useQuizStore();

    const createHTML = () => {
        let totalScore = Object.values(levelScores).reduce((a, b) => a + b, 0);

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Quiz Results</title>
          <style>
            body {
              font-family: Helvetica, Arial, sans-serif;
              padding: 20px;
            }
            .header {
              text-align: center;
              color: #354a21;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .level-header {
              color: #45a049;
              font-size: 20px;
              margin-top: 20px;
              border-bottom: 2px solid #45a049;
              padding-bottom: 5px;
            }
            .question-container {
              background-color: #f5f5f5;
              padding: 15px;
              margin: 10px 0;
              border-radius: 8px;
            }
            .question {
              font-weight: bold;
              margin-bottom: 8px;
            }
            .answer {
              margin-bottom: 4px;
            }
            .correct-answer {
              color: #4CAF50;
            }
            .incorrect-answer {
              color: #e74c3c;
            }
            .score {
              text-align: right;
              font-weight: bold;
              margin-top: 10px;
              color: #354a21;
            }
            .total-score {
              text-align: center;
              font-size: 20px;
              margin-top: 30px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Quiz Results Summary</h1>
          </div>
          
          ${[1, 2, 3, 4].map(level => `
            <div>
              <h2 class="level-header">Level ${level}</h2>
              <div class="score">Score: ${levelScores[`level${level}`]}/10</div>
              
              ${quiz[`level${level}`].map((q, index) => `
                <div class="question-container">
                  <div class="question">Question ${index + 1}: ${q.question}</div>
                  <div class="answer">Your Answer: ${q.userAnswer || 'Not answered'}</div>
                  <div class="correct-answer">Correct Answer: ${q.correctAnswer || q.answer}</div>
                </div>
              `).join('')}
            </div>
          `).join('')}
          
          <div class="total-score">
            Total Score: ${totalScore}/40
          </div>
        </body>
      </html>
    `;
    };

    const downloadPDF = async () => {
        try {
            // Show loading alert
            Alert.alert('Generating PDF', 'Please wait while we prepare your results...');

            // Generate PDF
            const file = await Print.printToFileAsync({
                html: createHTML(),
                base64: false
            });

            // Create a new filename with timestamp to avoid duplicates
            const timestamp = new Date().getTime();
            const newFileName = `QuizResults_${timestamp}.pdf`;

            // Set up the new file path in app documents directory
            const downloadPath = `${FileSystem.documentDirectory}${newFileName}`;

            // Copy file to documents directory
            await FileSystem.copyAsync({
                from: file.uri,
                to: downloadPath
            });

            if (Platform.OS === 'android') {
                // For Android: Save to downloads folder
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

                if (permissions.granted) {
                    const base64 = await FileSystem.readAsStringAsync(downloadPath, {
                        encoding: FileSystem.EncodingType.Base64
                    });

                    try {
                        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
                            permissions.directoryUri,
                            newFileName,
                            'application/pdf'
                        );
                        await FileSystem.writeAsStringAsync(uri, base64, {
                            encoding: FileSystem.EncodingType.Base64
                        });
                        Alert.alert('Success', 'PDF saved to your device!');
                    } catch (e) {
                        console.error('Error saving to downloads:', e);
                        // Fallback to sharing
                        await Sharing.shareAsync(downloadPath);
                    }
                }
            } else {
                // For iOS: Use sharing
                await Sharing.shareAsync(downloadPath, {
                    UTI: 'com.adobe.pdf',
                    mimeType: 'application/pdf',
                    dialogTitle: 'Save Quiz Results'
                });
            }

            // Clean up temporary file
            await FileSystem.deleteAsync(file.uri);
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert(
                'Error',
                'Failed to generate PDF. Please try again.'
            );
        }
    };

    return (
        <XStack space="$2">
            <Button
                flex={1}
                size="$5"
                backgroundColor="$blue9"
                color="white"
                onPress={downloadPDF}
            >
                {Platform.OS === 'ios' ? 'Share PDF' : 'Download PDF'}
            </Button>
        </XStack>
    );
};

export default QuizResultsPDF;