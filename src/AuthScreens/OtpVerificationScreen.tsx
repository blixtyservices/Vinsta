import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { getFontFamily, getFontWeight } from '../utils/fontHelper';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { height: screenHeight, width } = Dimensions.get('window');

const OtpVerificationScreen = ({ navigation, route }: any) => {
  const { mobile } = route.params || {};
  const { login } = useAuth();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loadingResend, setLoadingResend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [timer, setTimer] = useState(60);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const inputs = useRef<TextInput[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      setTimeout(() => scrollViewRef.current?.scrollTo({ y: 100, animated: true }), 100);
    });

    const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;

    if (text && index < 5) inputs.current[index + 1]?.focus();
    if (!text && index > 0) inputs.current[index - 1]?.focus();

    setOtp(newOtp);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      setLoadingResend(true);
      await authAPI.sendOtp(mobile);
      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      inputs.current[0]?.focus();
    } catch {
      // silently fail on resend — user can try again
    } finally {
      setLoadingResend(false);
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;
    try {
      setLoadingVerify(true);
      const res = await authAPI.verifyOtp(mobile, otpValue);
      await login(res.token, res.user);
      if (res.isNewUser) {
        navigation.replace('Welcome', { mobile });
      } else {
        navigation.replace('Home');
      }
    } catch (err: any) {
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoadingVerify(false);
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
  };

  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContainer,
            keyboardVisible && styles.scrollContainerKeyboardVisible,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../assets/Splash.png')}
            style={[styles.logo, keyboardVisible && styles.logoKeyboardVisible]}
            resizeMode="contain"
          />

          <Text style={styles.title}>O.T.P. Verification</Text>

          <Text style={styles.subtitle}>
            Enter the code from SMS we sent to {'\n'}
            <Text style={styles.mobileText}>+91 {mobile}</Text>
          </Text>

          <Text style={styles.timerText}>{formatTime()}</Text>

          {/* OTP BOXES FIXED + CENTERED + SPACING ADDED */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref!)}
                style={[
                  styles.otpInput,
                  digit !== '' && { borderColor: COLORS.primary },
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectionColor={COLORS.primary}
                textAlign="center"
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, { opacity: otp.join('').length === 6 ? 1 : 0.6 }]}
            onPress={handleVerify}
            disabled={loadingVerify || otp.join('').length !== 6}
            activeOpacity={0.8}
          >
            {loadingVerify ? (
              <ActivityIndicator color={COLORS.secondary} size="small" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn’t receive the OTP? </Text>
            {timer > 0 ? (
              <Text style={[styles.resendButton, { opacity: 0.5 }]}>Resend</Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={loadingResend}>
                {loadingResend ? (
                  <ActivityIndicator color={COLORS.primary} size="small" />
                ) : (
                  <Text style={styles.resendButton}>Resend</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.08,
    paddingVertical: 40,
    minHeight: screenHeight,
  },
  scrollContainerKeyboardVisible: {
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    marginBottom: 40,
  },
  logoKeyboardVisible: {
    width: width * 0.2,
    height: width * 0.2,
    marginBottom: 30,
  },
  title: {
    fontSize: width * 0.06,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: width * 0.04,
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },
  mobileText: {
    color: COLORS.primary,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
  timerText: {
    color: COLORS.primary,
    fontSize: width * 0.05,
    marginVertical: 12,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },

  /** ⭐ FIXED OTP STYLING: CENTERED + SPACE BETWEEN BOXES ⭐ */
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',      // center horizontally
    alignItems: 'center',          // center vertically
    width: '100%',
    marginVertical: 20,
    gap: 14,                       // spacing between boxes (RN 0.71+)
    // Alternative if gap not supported:
    // justifyContent: 'space-between',
  },

  otpInput: {
    width: width * 0.13,
    height: width * 0.15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    fontSize: width * 0.06,
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },

  button: {
    backgroundColor: COLORS.primary,
    width: '85%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.secondary,
    fontSize: width * 0.045,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  resendText: {
    color: COLORS.text,
    fontSize: width * 0.04,
    fontFamily: getFontFamily('Regular'),
    fontWeight: getFontWeight('Regular'),
  },
  resendButton: {
    color: COLORS.primary,
    fontSize: width * 0.04,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
});

export default OtpVerificationScreen;
