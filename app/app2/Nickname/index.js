import React, {useState, useEffect} from 'react';
import {TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView} from 'react-native';
import {useRouter} from 'expo-router';
import {View, Text, Image, Input, Button} from 'tamagui'
import {Ionicons} from "@expo/vector-icons";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useNicknameStore = create((set) => ({
    nickname: '',
    initialized: false,
    setNickname: async (name) => {
        try {
            await AsyncStorage.setItem('user_nickname', name);
            set({ nickname: name });
        } catch (error) {
            console.warn('Failed to save nickname to storage:', error);
            throw error; // Rethrow to handle in component
        }
    },
    loadNickname: async () => {
        try {
            const savedNickname = await AsyncStorage.getItem('user_nickname');
            if (savedNickname !== null) {
                set({ nickname: savedNickname });
            }
            set({ initialized: true });
        } catch (error) {
            console.warn('Failed to load nickname:', error);
            set({ initialized: true });
        }
    }
}));

const Widget = () => {
    const { nickname, setNickname, loadNickname } = useNicknameStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const handleNicknameChange = (text) => {
        setNickname(text);
    };

    // Load saved nickname when component mounts
    useEffect(() => {
        const initialize = async () => {
            await loadNickname();
            setIsLoading(false);
        };
        initialize();
    }, []);

    // If there's already a nickname saved, redirect to upload page
    useEffect(() => {
        if (!isLoading && nickname) {
            router.replace('app2/upload');
        }
    }, [isLoading, nickname]);


    const handleSaveClick = async () => {
        if (!nickname.trim()) {
            Alert.alert('Error', 'Please enter a nickname.');
            return;
        }

        try {
            await setNickname(nickname.trim());
            console.log(`Saving nickname: ${nickname}`);
            router.push('app2/upload');
        } catch (error) {
            Alert.alert('Error', 'Failed to save nickname. Please try again.');
        }
    };

    return (
        <View flex={1} h={'100%'} justifyContent={'center'} paddingHorizontal={'$8'}>
            <SafeAreaView>
                <View alignItems={'center'}>
                    <Image
                        source={require('./../../../assets/images/Welcome.png')}
                        width={300}
                        height={300}
                    />
                    <Text mt={"$2"} fontSize={20} fontWeight={900} color={'black'}>
                        What should we call you?
                    </Text>
                    <Input color={'black'} mt={"$4"} value={nickname} onChangeText={handleNicknameChange} size={'$6'}
                           placeholder={'e.g. Aaron James'} width={'100%'} backgroundColor={'#F5f5d1'}
                           borderColor={'#fee135'} borderWidth={'$1'} focusStyle={{
                        borderColor: '#fee135'
                    }}/>
                    <Button size="$6" mt={'$4'} width={'80%'} backgroundColor={'#27ae60'}
                            onPress={handleSaveClick}>Confirm</Button>
                </View>
            </SafeAreaView>
        </View>
    );
};


export default Widget;
