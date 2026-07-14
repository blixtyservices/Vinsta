// File: screens/PaymentScreen.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Modal,
  Dimensions,
  ScrollView,
  Vibration,
} from 'react-native';

import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

// Vibration helper
const vibrate = (duration: number = 40) => {
  if (Platform.OS === "ios") {
    Vibration.vibrate([0, duration]);
  } else {
    Vibration.vibrate(duration);
  }
};

const PaymentScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useContext(ThemeContext);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const closeIcon = require('../assets/close.png');
  const successIcon = require('../assets/sucess.png');

  const showPopup = (msg: string) => {
    setPopupMessage(msg);
    setPopupVisible(true);
  };

  const handlePayment = () => {
    // Demo: simulate successful payment locally (no payment SDK)
    vibrate(100);
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
      navigation.navigate('PaymentSuccess', {
        paymentId: `demo_pay_${Date.now()}`,
      });
    }, 2000);
  };

  return (

    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }} // IMPORTANT
      >

        {/* SHIPPING SECTION */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderBottomColor: theme.borderColor }]}>
          <View style={styles.shippingHeader}>
            <Text style={[styles.shippingTitle, { color: theme.text }]}>Shipping to</Text>
          </View>

          <View style={styles.shippingRow}>
            <Image source={require('../assets/loc1.png')} style={styles.locationIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.homeTitle, { color: theme.text }]}>Home</Text>
              <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                Near MC College, Barpeta Town, Assam 145621, India
              </Text>
            </View>
          </View>
        </View>

        {/* ORDER SUMMARY */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderBottomColor: theme.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>

          {/* ITEM 1 */}
          <View style={styles.orderItem}>
            <View style={styles.itemLeft}>
              <Image source={require('../assets/b1.png')} style={styles.foodImage} />
              <View>
                <Text style={[styles.itemName, { color: theme.text }]}>Chicken Burger</Text>
                <Text style={[styles.itemQty, { color: theme.textSecondary }]}>Qty: 2</Text>
              </View>
            </View>
            <Text style={[styles.itemPrice, { color: theme.text }]}>₹ 240.00</Text>
          </View>

          {/* ITEM 2 */}
          <View style={styles.orderItem}>
            <View style={styles.itemLeft}>
              <Image source={require('../assets/b2.png')} style={styles.foodImage} />
              <View>
                <Text style={[styles.itemName, { color: theme.text }]}>Veg Pizza</Text>
                <Text style={[styles.itemQty, { color: theme.textSecondary }]}>Qty: 1</Text>
              </View>
            </View>
            <Text style={[styles.itemPrice, { color: theme.text }]}>₹ 340.00</Text>
          </View>

          {/* DIVIDER */}
          <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

          {/* PRICE ROWS */}
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>₹ 580.00</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.priceValue, { color: theme.text }]}>Free</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Discount</Text>
            <Text style={[styles.priceValue, { color: COLORS.primary }]}>- ₹ 0.00</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: COLORS.primary }]}>₹ 580.00</Text>
          </View>
        </View>

        {/* NOTE */}
        <View style={[styles.noteSection, { backgroundColor: theme.cardBackground, borderLeftColor: COLORS.primary }]}>
          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            💳 Click "PAY & CONFIRM" to proceed with safe payment via Razorpay
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={[styles.bottomSection, { backgroundColor: theme.cardBackground, borderTopColor: theme.borderColor }]}>
        <View style={styles.totalRowBottom}>
          <Text style={[styles.totalLabelBottom, { color: theme.text }]}>Total</Text>
          <View>
            <Text style={[styles.itemsText, { color: theme.textSecondary }]}>(3 items)</Text>
            <Text style={[styles.totalValueBottom, { color: theme.text }]}>₹ 580.00</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
          <Text style={styles.payBtnText}>PAY & CONFIRM</Text>
        </TouchableOpacity>
      </View>

      {/* ERROR POPUP */}
      <Modal transparent visible={popupVisible} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={[styles.popupBox, { backgroundColor: theme.cardBackground }]}>
            <TouchableOpacity
              style={styles.closeIconWrapper}
              onPress={() => setPopupVisible(false)}
            >
              <Image source={closeIcon} style={[styles.closeIcon, { tintColor: theme.text }]} />
            </TouchableOpacity>

            <Text style={[styles.popupText, { color: theme.text }]}>{popupMessage}</Text>
            <TouchableOpacity style={styles.popupButton} onPress={() => setPopupVisible(false)}>
              <Text style={styles.popupButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUCCESS POPUP */}
      <Modal transparent visible={showSuccessPopup} animationType="fade">
        <View style={styles.successPopupOverlay}>
          <View style={[styles.successPopupBox, { backgroundColor: theme.cardBackground }]}>
            <Image source={successIcon} style={styles.successImage} />

            <Text style={[styles.successTitle, { color: COLORS.primary }]}>Order Confirmed!</Text>
            <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
              Your payment was successful.
            </Text>

            <View style={[styles.progressBar, { backgroundColor: theme.borderColor }]}>
              <View style={[styles.progressFill, { backgroundColor: COLORS.primary }]} />
            </View>

            <Text style={[styles.redirectText, { color: theme.textSecondary }]}>Redirecting...</Text>
          </View>
        </View>
      </Modal>
    </View>

  );
};

export default PaymentScreen;

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Figtree-Bold',
  },

  section: {
    padding: 20,
    borderBottomWidth: 1,
  },

  shippingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },

  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  locationIcon: { width: 60, height: 60, marginRight: 12 },

  homeTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },

  addressText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Figtree-Regular',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Figtree-Bold',
  },

  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },

  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },

  itemName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Figtree-SemiBold',
  },
  itemQty: {
    fontSize: 13,
    fontFamily: 'Figtree-Regular',
  },

  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },

  divider: {
    height: 1,
    marginVertical: 10,
  },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },

  priceLabel: {
    fontSize: 14,
    fontFamily: 'Figtree-Regular',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Figtree-Medium',
  },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },

  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },

  noteSection: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Figtree-Regular',
  },

  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    borderTopWidth: 1,
  },

  totalRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  totalLabelBottom: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },
  itemsText: {
    fontSize: 12,
    fontFamily: 'Figtree-Regular',
  },
  totalValueBottom: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },

  payBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  payBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },

  /* POPUP */
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBox: {
    width: width * 0.8,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  popupText: {
    fontSize: 15,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Figtree-Regular',
  },
  popupButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  popupButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },
  closeIconWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  closeIcon: {
    width: 22,
    height: 22,
  },

  /* SUCCESS POPUP */
  successPopupOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  successPopupBox: {
    width: width * 0.85,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  successImage: { width: 80, height: 80, marginBottom: 20 },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    fontFamily: 'Figtree-Bold',
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Figtree-Regular',
  },
  progressBar: {
    height: 4,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    width: '100%',
    height: '100%',
  },
  redirectText: {
    fontSize: 14,
    fontFamily: 'Figtree-Regular',
  },
});

