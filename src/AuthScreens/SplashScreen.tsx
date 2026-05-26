import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const SplashScreen = ({ navigation }: any) => {
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // wait for token restore to finish
    const timer = setTimeout(() => {
      if (token) {
        navigation.replace('Home');
      } else {
        navigation.replace('Onboarding1');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isLoading, token, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Splash.png')}
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;
