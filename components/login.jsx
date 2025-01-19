import React, {useEffect} from 'react';
import {TouchableOpacity, StyleSheet, Animated, SafeAreaView} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {View, Text, Image, Button} from 'tamagui'

const TriviaGameScreen = () => {
    const router = useRouter();
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.5);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <>
            <View flex={1} backgroundColor={'#27ae60'} h={'100%'} justifyContent={'center'} paddingHorizontal={'$8'}>
                <SafeAreaView>
                    <Animated.View style={[{opacity: fadeAnim}]}>
                        <View flexDirection={'row'} justifyContent={'center'} alignItems={'center'} gap={8}>
                            <Image
                                source={require('../assets/images/logo.png')}
                                width={300}
                                height={260}
                            />
                        </View>
                    </Animated.View>

                    <Animated.View style={[{opacity: fadeAnim, transform: [{scale: scaleAnim}]}]}>
                        <Text fontWeight={600} fontSize={24} mt={'$4'} textAlign={'center'}>Grow Your Knowledge</Text>
                        <Text fontSize={18} color={'#e3e3e3'} mt={'$2'} textAlign={'center'}>
                            Enjoy an interactive platform designed for secondary and tertiary students to review quizzes
                            and exams while making learning fun and engaging.
                        </Text>
                    </Animated.View>

                    <Animated.View style={[{opacity: fadeAnim}]}>
                        <Button size="$6" mt={'$6'} iconAfter={<Ionicons name="arrow-forward-circle" size={32} color="#FFFFFF"/>}
                                onPress={() => router.push('app2/Nickname')}>Start Learning</Button>
                    </Animated.View>
                </SafeAreaView>
            </View>
        </>
    );
};


export default TriviaGameScreen;
