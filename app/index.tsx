import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Login from '../components/login';
import { useNicknameStore } from "@/app/app2/Nickname/index";
import { useQuizStore, hasQuizData } from "@/app/app2/upload/index";

export default function Index() {
    const router = useRouter();
    const { loadNickname, nickname } = useNicknameStore();
    const { quiz, loadQuizData } = useQuizStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await Promise.all([loadNickname(), loadQuizData()]);
            } catch (error) {
                console.error('Error initializing app:', error);
            } finally {
                setIsLoading(false);
            }
        };
        initializeApp();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        if (nickname) {
            if (hasQuizData(quiz)) {
                router.replace("/app2/HomePage");
            } else {
                router.replace("/app2/upload");
            }
        }
    }, [isLoading, nickname, quiz]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#27ae60" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Login />
        </View>
    );
}