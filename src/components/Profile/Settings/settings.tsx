import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme/colors';
import { ThemeContext } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const Settings = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupAction, setPopupAction] = useState<null | (() => void)>(null);
  const { theme } = useContext(ThemeContext);

  /** ─── Function to open confirmation popup ─── **/
  const openPopup = (message: string, onConfirm: () => void) => {
    setPopupMessage(message);
    setPopupAction(() => onConfirm);
    setShowPopup(true);
  };

  /** ─── Settings options list ─── **/
  const settingsOptions = [
    {
      id: 1,
      label: 'Account Setting',
      icon: require('../../../assets/ac.png'),
      route: 'AccountSetting',
    },
    {
      id: 2,
      label: "Sound's and voice",
      icon: require('../../../assets/sound.png'),
      route: 'SoundAndVoice',
    },
    {
      id: 3,
      label: 'Language',
      icon: require('../../../assets/language.png'),
      route: 'Language',
    },
    {
      id: 4,
      label: 'Notification Setting',
      icon: require('../../../assets/notisetting.png'),
      route: 'NotificationSetting',
    },
    {
      id: 5,
      label: 'Account management',
      icon: require('../../../assets/acmanage.png'),
      route: 'AccountManagement',
    },
    {
      id: 6,
      label: 'About us',
      icon: require('../../../assets/aboutus.png'),
      route: 'AboutUs',
    },
    {
      id: 7,
      label: 'Share app',
      icon: require('../../../assets/share1.png'),
      route: 'ShareApp',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* ===== HEADER ===== */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/back.png')}
            style={[styles.backIcon, { tintColor: theme.text }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ===== OPTIONS LIST ===== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.optionContainer}>
          {settingsOptions.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionRow,
                { borderBottomColor: theme.borderColor },
              ]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={item.icon}
                  style={[styles.optionIcon, { tintColor: theme.text }]}
                />
                <Text style={[styles.optionLabel, { color: theme.text }]}>
                  {item.label}
                </Text>
              </View>
              <Image
                source={require('../../../assets/right-arrow.png')}
                style={[styles.arrowIcon, { tintColor: theme.text }]}
              />
            </TouchableOpacity>
          ))}

          {/* ===== LOG OUT ===== */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: theme.borderColor }]}
            activeOpacity={0.7}
            onPress={() =>
              openPopup('Are you sure you want to logout?', async () => {
                await logout();
                navigation.navigate('SignIn');
              })
            }
          >
            <View style={styles.optionLeft}>
              <Image
                source={require('../../../assets/logout.png')}
                style={[styles.optionIcon, { tintColor: '#E53935' }]}
              />
              <Text style={[styles.optionLabel, { color: '#E53935' }]}>
                Log out
              </Text>
            </View>
          </TouchableOpacity>

          {/* ===== DELETE ACCOUNT ===== */}
          {/* <TouchableOpacity
            style={styles.optionRow}
            activeOpacity={0.7}
            onPress={() =>
              openPopup('Are you sure you want to delete your account?', () => navigation.navigate('SignIn'))
            }
          >
            <View style={styles.optionLeft}>
              <Image source={require('../../../assets/delete.png')} style={styles.optionIcon} />
              <Text style={[styles.optionLabel, { color: '#E53935' }]}>Delete Account</Text>
            </View>
          </TouchableOpacity> */}
        </View>
      </ScrollView>

      {/* ===== CONFIRMATION POPUP ===== */}
      <Modal
        transparent
        visible={showPopup}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.popupOverlay}>
          <View
            style={[styles.popupBox, { backgroundColor: theme.cardBackground }]}
          >
            <Text style={[styles.popupText, { color: theme.text }]}>
              {popupMessage}
            </Text>

            <View style={styles.popupButtonsRow}>
              {/* CANCEL */}
              <TouchableOpacity
                style={[
                  styles.popupButton,
                  { backgroundColor: theme.borderColor },
                ]}
                onPress={() => setShowPopup(false)}
              >
                <Text style={[styles.popupButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* CONFIRM */}
              <TouchableOpacity
                style={[
                  styles.popupButton,
                  { backgroundColor: COLORS.primary },
                ]}
                onPress={() => {
                  setShowPopup(false);
                  popupAction && popupAction();
                }}
              >
                <Text
                  style={[styles.popupButtonText, { color: theme.background }]}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Settings;

/* ────────────── STYLES ────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /** HEADER **/
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? height * 0.07 : height * 0.07,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontFamily: 'Figtree-Bold',
  },

  /** OPTION LIST **/
  optionContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    marginRight: 15,
  },
  optionLabel: {
    fontSize: width * 0.037,
    fontFamily: 'Figtree-SemiBold',
  },
  arrowIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },

  /** POPUP **/
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupBox: {
    width: width * 0.8,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 6 },
    }),
  },
  popupText: {
    fontSize: width * 0.04,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Figtree-Medium',
  },
  popupButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  popupButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  popupButtonText: {
    fontFamily: 'Figtree-Bold',
    fontSize: width * 0.04,
  },
});
