import {useFonts} from "expo-font";
import {Stack} from "expo-router";
import {Provider} from '../app/provider'

export default function RootLayout() {

    useFonts({
        'Inter': require('./../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-medium': require('./../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-bold': require('./../assets/fonts/Poppins-Bold.ttf')
    })

    return (
        <Provider>
            <Stack screenOptions={{
                headerShown: false,
                contentStyle: {backgroundColor: "#d8ffb1"},
            }}>
                <Stack.Screen name="index"/>
            </Stack>
        </Provider>
    );
}
