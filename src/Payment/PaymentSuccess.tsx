import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

const PaymentSuccess = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderId = route.params?.orderId;

  // Handle Android hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#259E29" barStyle="light-content" />

      {/* BACK BUTTON */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Image source={require('../assets/back.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {/* TICK ICON SECTION */}
      <View style={styles.centerSection}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <Image
              source={require('../assets/tick.png')}
              style={styles.tickIcon}
            />
          </View>
        </View>

        {/* SUCCESS TEXT */}
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>You Ordered Successfully</Text>
        {orderId && (
          <Text style={styles.orderIdText}>Order ID: #{orderId.slice(-8).toUpperCase()}</Text>
        )}
        <Text style={styles.desc}>
          You successfully placed an order, your order is confirmed and will be
          delivered ASAP ThankYou.{'\n'}Wish you enjoy the food.
        </Text>
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.keepBrowsingBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.keepBrowsingText}>KEEP BROWSING</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.trackOrderBtn}
          onPress={() => navigation.navigate('TrackOrder')}
        >
          <Text style={styles.trackOrderText}>TRACK ORDER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#259E29',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },

  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
  },

  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 120,
    paddingHorizontal: 20,
  },

  outerCircle: {
    backgroundColor: '#fff',
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    backgroundColor: '#259E29',
    width: 90,
    height: 90,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickIcon: {
    width: 40,
    height: 40,
    tintColor: '#fff',
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Figtree-Bold',
    marginTop: 30,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Figtree-SemiBold',
    marginTop: 6,
  },
  orderIdText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Figtree-Medium',
    marginTop: 8,
    opacity: 0.85,
  },
  desc: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Figtree-Regular',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    opacity: 0.9,
  },

  buttonSection: {
    width: '100%',
    alignItems: 'center',
  },

  keepBrowsingBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '85%',
    paddingVertical: 14,
    marginBottom: 12,
  },
  keepBrowsingText: {
    color: '#259E29',
    fontSize: 16,
    fontFamily: 'Figtree-Bold',
    textAlign: 'center',
  },

  trackOrderBtn: {
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 10,
    width: '85%',
    paddingVertical: 14,
  },
  trackOrderText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Figtree-Bold',
    textAlign: 'center',
  },
});
