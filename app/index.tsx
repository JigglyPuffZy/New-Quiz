import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Login from '../components/login';
import {useNicknameStore} from "@/app/app2/Nickname/index";

export default function Index() {
    const router = useRouter();
    const { loadNickname, nickname } = useNicknameStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            await loadNickname();
            setIsLoading(false);
        };
        initializeApp();
    }, []);

    useEffect(() => {
        if (!isLoading && nickname) {
            router.replace("/app2/upload" as any);
        }
    }, [isLoading, nickname]);

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