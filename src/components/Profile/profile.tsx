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
import { COLORS } from '../../theme/colors';
import { ThemeContext } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const Profile = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupAction, setPopupAction] = useState<null | (() => void)>(null);

  const topOptions = [
    {
      id: 1,
      icon: require('../../assets/address1.png'),
      label: 'Address',
      route: 'Address',
    },
    {
      id: 2,
      icon: require('../../assets/myorders.png'),
      label: 'My Order',
      route: 'MyOrder',
    },
    {
      id: 3,
      icon: require('../../assets/subs1.png'),
      label: 'Subscriptions',
      route: 'Subscription',
    },
    {
      id: 4,
      icon: require('../../assets/wallet.png'),
      label: 'Wallet',
      route: 'Wallet',
    },
  ];

  const bottomOptions = [
    {
      id: 1,
      icon: require('../../assets/profile.png'),
      label: 'Profile',
      route: 'ProfileEdit',
    },
    {
      id: 2,
      icon: require('../../assets/favourite.png'),
      label: "Favourite's",
      route: 'Favourite',
    },
    {
      id: 3,
      icon: require('../../assets/offers.png'),
      label: "My Offer's",
      route: 'todayOfferView',
    },
    {
      id: 4,
      icon: require('../../assets/refer.png'),
      label: 'Refer To Earn',
      route: 'Refer',
    },
    {
      id: 5,
      icon: require('../../assets/dark.png'),
      label: 'Dark Mode',
      route: 'DarkMode',
    },
    {
      id: 6,
      icon: require('../../assets/support.png'),
      label: 'Support',
      route: 'Support',
    },
    {
      id: 7,
      icon: require('../../assets/settings2.png'),
      label: "Setting's",
      route: 'Settings',
    },
  ];

  const openPopup = (message: string, onConfirm: () => void) => {
    setPopupMessage(message);
    setPopupAction(() => onConfirm);
    setShowPopup(true);
  };

  const handleNavigation = (route: string) => {
    navigation.navigate(route);
  };

  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Image source={require('../../assets/bg.png')} style={styles.bgImage} />

      {/* ===== Header ===== */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image
            source={require('../../assets/back.png')}
            style={[styles.backIcon, { tintColor: theme.text }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} />
          <TouchableOpacity onPress={() => navigation.navigate('Help')}>
            <Text style={[styles.helpText, { color: theme.text }]}>Help</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== Scrollable Content ===== */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 60,
          backgroundColor: theme.background,
        }}
      >
        {/* ===== Profile Header ===== */}
        <View style={styles.profileHeader}>
          <View style={styles.userRow}>
            {/* ===== Circle Container with Gray User Icon ===== */}
            <View style={[styles.userCircleContainer, { backgroundColor: theme.cardBackground }]}>
              <Image
                source={require('../../assets/user.png')}
                style={[styles.userCircleIcon, { tintColor: 'gray' }]}
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.userInfo}>
              <Text
                style={[styles.userName, { color: theme.text }]}
              >{`Harshal Sharma`}</Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                harshal@gmail.com
              </Text>
              <Text style={[styles.userPhone, { color: theme.textSecondary }]}>
                +91 1234567890
              </Text>
            </View>
          </View>
        </View>

        {/* ===== Top Options ===== */}
        <View style={styles.topOptionsContainer}>
          {topOptions.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.topOption,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderColor,
                },
              ]}
              onPress={() => navigation.navigate(item.route)}
            >
              <Image
                source={item.icon}
                style={[styles.topIcon, { tintColor: theme.text }]}
              />
              <Text style={[styles.topLabel, { color: theme.textSecondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== Bottom Options ===== */}
        <View style={styles.bottomSection}>
          {bottomOptions.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.optionRow, { borderBottomColor: theme.border }]}
              onPress={() => handleNavigation(item.route)}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={item.icon}
                  style={[
                    styles.optionIcon,
                    { tintColor: theme.textSecondary },
                  ]}
                />
                <Text
                  style={[styles.optionLabel, { color: theme.textSecondary }]}
                >
                  {item.label}
                </Text>
              </View>
              <Image
                source={require('../../assets/right-arrow.png')}
                style={[styles.arrowIcon, { tintColor: theme.text }]}
              />
            </TouchableOpacity>
          ))}

          {/* ===== Logout ===== */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: theme.border }]}
            onPress={() =>
              openPopup('Are you sure you want to logout?', async () => {
                await logout();
                navigation.navigate('SignIn');
              })
            }
          >
            <View style={styles.optionLeft}>
              <Image
                source={require('../../assets/logout.png')}
                style={[styles.optionIcon, { tintColor: '#E53935' }]}
              />
              <Text style={[styles.optionLabel, { color: '#E53935' }]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>

          {/* ===== Delete Account ===== */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: theme.border }]}
            onPress={() =>
              openPopup('Are you sure you want to delete your account?', async () => {
                await logout();
                navigation.navigate('SignIn');
              })
            }
          >
            <View style={styles.optionLeft}>
              <Image
                source={require('../../assets/delete.png')}
                style={[styles.optionIcon, { tintColor: '#E53935' }]}
              />
              <Text style={[styles.optionLabel, { color: '#E53935' }]}>
                Delete Account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ===== Popup Modal ===== */}
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
            <View style={styles.popupButtonsContainer}>
              <TouchableOpacity
                style={[styles.popupButton, styles.popupCancelButton]}
                onPress={() => setShowPopup(false)}
              >
                <Text style={[styles.popupButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.popupButton, styles.popupConfirmButton]}
                onPress={() => {
                  setShowPopup(false);
                  popupAction && popupAction();
                }}
              >
                <Text
                  style={[
                    styles.popupButtonText,
                    { color: theme.cardBackground },
                  ]}
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

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1 },

  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height: height * 0.25,
    resizeMode: 'cover',
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 40,
    padding: 5,
    zIndex: 10,
  },

  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: height * 0.07,
    paddingBottom: 10,
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: width * 0.035,
    fontFamily: 'Figtree-SemiBold',
  },

  profileHeader: { width: '100%', marginTop: height * 0.13 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // ===== NEW CIRCLE CONTAINER STYLES =====
  userCircleContainer: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  userCircleIcon: {
    width: 50,
    height: 50,
  },

  userInfo: { flex: 1, marginLeft: 15 },
  userName: {
    fontSize: width * 0.048,
    fontFamily: 'Figtree-Bold',
  },
  userEmail: {
    fontSize: width * 0.032,
    marginTop: 3,
    fontFamily: 'Figtree-Regular',
  },
  userPhone: {
    fontSize: width * 0.032,
    marginTop: 2,
    fontFamily: 'Figtree-Regular',
  },

  topOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 25,
  },
  topOption: {
    width: width * 0.21,
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 4 },
    }),
  },
  topIcon: { width: 26, height: 26, resizeMode: 'contain', marginBottom: 5 },
  topLabel: {
    fontSize: width * 0.03,
    textAlign: 'center',
    fontFamily: 'Figtree-Medium',
  },

  bottomSection: { marginTop: 30, paddingHorizontal: 20 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionIcon: { width: 22, height: 22, resizeMode: 'contain', marginRight: 15 },
  optionLabel: { fontSize: width * 0.037, fontFamily: 'Figtree-SemiBold' },
  arrowIcon: { width: 14, height: 14, resizeMode: 'contain' },

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
  popupButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  popupButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  popupCancelButton: { backgroundColor: '#f0f0f0', marginRight: 10 },
  popupConfirmButton: { backgroundColor: COLORS.primary, marginLeft: 10 },
  popupButtonText: { fontSize: width * 0.035, fontFamily: 'Figtree-SemiBold' },
});
