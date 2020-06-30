import { CardStyleInterpolators } from '@react-navigation/stack';

export const navigatorScreenSetting = {
    headerStyle: {
        backgroundColor: '#FFD44E',
    },
    headerTransparent: true,
    headerTitleAlign: 'center',
    headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
        lineHeight: 25
    },
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    headerShown:true
}

export const bottomTabBarSetting = {
    activeTintColor: '#FFD54E',
    inactiveTintColor: 'black',
    inactiveBackgroundColor: 'white',
    style: {
    },
    labelStyle: {
    },
}
