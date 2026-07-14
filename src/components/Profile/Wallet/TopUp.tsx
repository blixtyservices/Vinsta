import React, { useState, useEffect, useContext } from 'react';
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
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../../theme/colors';
import font from '../../../assets/fonts';
import { ThemeContext } from '../../../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

// Default transaction history
const defaultHistory = [
  {
    id: '1699876543210',
    amount: '500',
    paymentId: 'pay_MZq8R2xYz1234AbCdEf567gh',
    date: '10-11-2025',
    time: '14:30',
    dateTime: '10-11-2025, 14:30',
    oldBalance: 8879,
    newBalance: 9379,
    status: 'Success',
  },
  {
    id: '1699790143210',
    amount: '1000',
    paymentId: 'pay_MZp7Q1wXy9876ZyXwVu432fe',
    date: '09-11-2025',
    time: '10:15',
    dateTime: '09-11-2025, 10:15',
    oldBalance: 7879,
    newBalance: 8879,
    status: 'Success',
  },
  {
    id: '1699703743210',
    amount: '2000',
    paymentId: 'pay_MZo6P0vWx8765YxWvUt321ed',
    date: '08-11-2025',
    time: '18:45',
    dateTime: '08-11-2025, 18:45',
    oldBalance: 5879,
    newBalance: 7879,
    status: 'Success',
  },
];

const TopUp = () => {
  const navigation = useNavigation<any>();
  const [topupAmount, setTopupAmount] = useState('');
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(9379);
  const [topupHistory, setTopupHistory] = useState<any[]>(defaultHistory);
  const [lastTransactionData, setLastTransactionData] = useState<any>(null);
  const { theme } = useContext(ThemeContext);

  // Predefined amounts
  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    loadTopupHistory();
  }, []);

  const loadTopupHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('topupHistory');
      if (history) {
        setTopupHistory(JSON.parse(history));
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const saveTopupHistory = async (transaction: any) => {
    try {
      const newHistory = [transaction, ...topupHistory];
      await AsyncStorage.setItem('topupHistory', JSON.stringify(newHistory));
      setTopupHistory(newHistory);
    } catch (error) {
      console.log('Error saving history:', error);
    }
  };

  const showSuccessPopup = (transactionData: any) => {
    setLastTransactionData(transactionData);
    setSuccessPopupVisible(true);
  };

  const closeSuccessPopup = () => {
    setSuccessPopupVisible(false);
  };

  const handleAmountChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setTopupAmount(numericText);
  };

  const handleQuickAmount = (amount: number) => {
    setTopupAmount(amount.toString());
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return {
      date: `${day}-${month}-${year}`,
      time: `${hours}:${minutes}`,
      dateTime: `${day}-${month}-${year}, ${hours}:${minutes}`,
    };
  };

  const handlePayment = () => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      alert('Please enter a valid top-up amount');
      return;
    }

    // Demo: simulate successful top-up locally (no payment SDK)
    const { date, time, dateTime } = getCurrentDateTime();
    const newBalance = currentBalance + parseFloat(topupAmount);

    const transactionData = {
      id: Date.now().toString(),
      amount: topupAmount,
      paymentId: `demo_pay_${Date.now()}`,
      date: date,
      time: time,
      dateTime: dateTime,
      oldBalance: currentBalance,
      newBalance: newBalance,
      status: 'Success',
    };

    setCurrentBalance(newBalance);
    saveTopupHistory(transactionData);
    showSuccessPopup(transactionData);
    setTopupAmount('');
  };

  const handleViewReceipt = (transaction: any) => {
    navigation.navigate('EReceipt', { transaction });
  };

  const renderHistoryItem = ({ item }: any) => (
    <View style={[styles.historyCard, { backgroundColor: theme.cardBackground, borderColor: theme.background }]}>
      <View style={styles.historyHeader}>
        <View style={styles.historyIcon}>
          <Image
            source={require('../../../assets/wallet.png')}
            style={[styles.topupIconSmall, { tintColor: theme.background }]}
          />
        </View>
        <View style={styles.historyDetails}>
          <Text style={[styles.historyTitle, { color: theme.text }]}>Wallet Top-Up</Text>
          <Text style={styles.historyDate}>{item.dateTime}</Text>
        </View>
        <View style={styles.historyRight}>
          <Text style={styles.historyAmount}>+ ₹{item.amount}</Text>
          <Text style={[styles.historyStatus, { color: '#4CAF50' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={[styles.historyFooter, { borderTopColor: theme.background }]}>
        <Text style={styles.paymentIdText}>
          Payment ID: {item.paymentId.substring(0, 20)}...
        </Text>
        <TouchableOpacity
          style={styles.viewReceiptBtn}
          onPress={() => handleViewReceipt(item)}
        >
          <Text style={[styles.viewReceiptText, { color: theme.background }]}>View Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Image
            source={require('../../../assets/back.png')}
            style={[styles.backIcon, { tintColor: theme.text }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Top Up Wallet</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Wallet Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.cardBase} />
          <View style={styles.cardOverlay} />

          <View style={styles.cardContent}>
            <Text style={[styles.cardName, { color: theme.background }]}>Harshal Sharma</Text>
            <Text style={[styles.cardNumber, { color: theme.background }]}>1234567890</Text>
            <Text style={[styles.balanceLabel, { color: theme.background }]}>Current balance</Text>

            <View style={styles.balanceRow}>
              <Text style={[styles.balanceAmount, { color: theme.background }]}>
                ₹ {currentBalance.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.cardLogos}>
            <Image
              source={require('../../../assets/Splash.png')}
              style={[styles.cardLogo, { marginLeft: 8 }]}
            />
          </View>
        </View>

        {/* Top Up Section */}
        <View style={styles.topupSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Enter Top-Up Amount</Text>

          {/* Amount Input */}
          <View style={[styles.inputWrapper, { backgroundColor: theme.cardBackground, borderColor: theme.background }]}>
            <Text style={[styles.currencySymbol, { color: theme.text }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.textSecondary }]}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={topupAmount}
              onChangeText={handleAmountChange}
              maxLength={6}
            />
          </View>

          {/* Quick Amount Buttons */}
          <Text style={[styles.quickAmountLabel, { color: theme.text }]}>Quick Select</Text>
          <View style={styles.quickAmountGrid}>
            {quickAmounts.map(amount => {
              const isActive = topupAmount === amount.toString();

              return (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountBtn,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.background,
                    },
                    isActive && styles.quickAmountBtnActive,
                  ]}
                  onPress={() => handleQuickAmount(amount)}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      {
                        color: isActive ? theme.background : theme.text,
                      },
                    ]}
                  >
                    ₹ {amount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Payment Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💳 Your wallet will be topped up instantly after successful
              payment via Razorpay
            </Text>
          </View>

          {/* Top Up Details */}
          {topupAmount && parseFloat(topupAmount) > 0 && (
            <View style={[styles.detailsBox, { backgroundColor: theme.cardBackground, borderColor: theme.background }]}>
              <Text style={[styles.detailsTitle, { color: theme.text }]}>Top-Up Summary</Text>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.text }]}>Top-up Amount</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>₹ {topupAmount}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.text }]}>Processing Fee</Text>
                <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                  Free
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.cardBackground }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>Total Payable</Text>
                <Text style={[styles.totalValue, , { color: theme.text }]}>₹ {topupAmount}</Text>
              </View>

              <View style={[styles.detailRow, { marginTop: 8 }]}>
                <Text style={[styles.detailLabel, { color: theme.text }]}>New Balance</Text>
                <Text style={[styles.newBalanceValue, { color: theme.text }]}>
                  ₹{' '}
                  {(currentBalance + parseFloat(topupAmount)).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Top-Up History */}
        {topupHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historySectionTitle, { color: theme.text }]}>Top-Up History</Text>
            {topupHistory.map((item, index) => (
              <View key={item.id || index}>{renderHistoryItem({ item })}</View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomSection, { backgroundColor: theme.cardBackground, borderTopColor: theme.background }]}>
        <TouchableOpacity
          style={[
            styles.topupButton,
            (!topupAmount || parseFloat(topupAmount) <= 0) &&
            styles.topupButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!topupAmount || parseFloat(topupAmount) <= 0}
          activeOpacity={0.8}
        >
          <Text style={[styles.topupButtonText, { color: theme.background }]}>
            {topupAmount && parseFloat(topupAmount) > 0
              ? `TOP UP ₹ ${topupAmount}`
              : 'ENTER AMOUNT TO PROCEED'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Popup Modal */}
      <Modal
        transparent
        visible={successPopupVisible}
        animationType="fade"
        onRequestClose={closeSuccessPopup}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            {/* Success Icon - Direct from image */}
            <Image
              source={require('../../../assets/sucess.png')}
              style={styles.successIconImage}
              resizeMode="contain"
            />

            <Text style={styles.successTitle}>Top Up Successful!</Text>
            <Text style={styles.successMessage}>
              You have successfully top up{'\n'}e-wallet for $
              {lastTransactionData?.amount || '0'}
            </Text>

            {/* Buttons */}
            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => {
                closeSuccessPopup();
                handleViewReceipt(lastTransactionData);
              }}
            >
              <Text style={styles.receiptButtonText}>View E-Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                closeSuccessPopup();
                navigation.goBack();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TopUp;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /** HEADER **/
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.07,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: width * 0.045, fontWeight: '700', color: '#000', fontFamily: 'Figtree-Bold' },

  /** CARD **/
  cardWrapper: {
    borderRadius: 18,
    height: height * 0.22,
    marginHorizontal: 20,
    marginTop: 15,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cardBase: { ...StyleSheet.absoluteFillObject, backgroundColor: '#8F3C09' },
  cardOverlay: {
    position: 'absolute',
    right: -width * 0.15,
    top: -height * 0.02,
    width: width * 0.9,
    height: height * 0.32,
    backgroundColor: '#E87C23',
    opacity: 0.42,
    transform: [{ rotate: '-18deg' }],
  },
  cardContent: { position: 'absolute', top: 20, left: 25, right: 25 },
  cardName: { color: '#fff', fontSize: width * 0.045, fontWeight: '700', fontFamily: 'Figtree-Bold' },
  cardNumber: {
    color: '#fff', opacity: 0.9, marginTop: 4, fontFamily: 'Figtree-Medium',
    fontWeight: '500'
  },
  balanceLabel: {
    color: '#fff', opacity: 0.9, marginTop: 18, fontFamily: 'Figtree-SemiBold',
    fontWeight: '600'
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: width * 0.08,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },
  cardLogos: {
    position: 'absolute',
    top: 18,
    right: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogo: { width: 50, height: 50, resizeMode: 'contain' },

  /** TOP UP SECTION **/
  topupSection: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: width * 0.042,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
    fontFamily: 'Figtree-Bold',
  },

  /** AMOUNT INPUT **/
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  currencySymbol: {
    fontSize: width * 0.08,
    fontWeight: '700',
    color: '#000',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: width * 0.08,
    fontWeight: '700',
    color: '#000',
    paddingVertical: 12,
    fontFamily: 'Figtree-Bold',
  },

  /** QUICK AMOUNTS **/
  quickAmountLabel: {
    fontSize: width * 0.038,
    fontWeight: '600',
    color: '#666',
    marginTop: 25,
    marginBottom: 12,
    fontFamily: 'Figtree-SemiBold',
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountBtn: {
    width: '31%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  quickAmountBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: width * 0.04,
    color: '#000',
    fontFamily: 'Figtree-SemiBold',
    fontWeight: '600'
  },
  quickAmountTextActive: {
    color: '#fff',
  },

  /** INFO BOX **/
  infoBox: {
    backgroundColor: '#FFF9E6',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Figtree-Regular',
    fontWeight: '400'
  },

  /** DETAILS BOX **/
  detailsBox: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 0,
  },
  detailsTitle: {
    fontSize: width * 0.042,
    color: '#000',
    marginBottom: 15,
    fontFamily: 'Figtree-Bold',
    fontWeight: '700'
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: width * 0.037,
    color: '#666',
    fontFamily: 'Figtree-SemiBold',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: width * 0.037,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Figtree-SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Figtree-Bold',
  },
  totalValue: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Figtree-Bold',
  },
  newBalanceValue: {
    fontSize: width * 0.037,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Figtree-Bold',
  },

  /** HISTORY SECTION **/
  historySection: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  historySectionTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
    fontFamily: 'Figtree-Bold',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topupIconSmall: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FFF', //COLORS.primary
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Figtree-SemiBold',
  },
  historyDate: {
    fontSize: width * 0.032,
    color: '#888',
    fontFamily: 'Figtree-Regular',
    fontWeight: '400'
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: width * 0.042,
    color: '#4CAF50',
    marginBottom: 4,
    fontFamily: 'Figtree-SemiBold',
    fontWeight: '600'
  },
  historyStatus: {
    fontSize: width * 0.03,
    fontWeight: '600',
    fontFamily: 'Figtree-SemiBold',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paymentIdText: {
    fontSize: width * 0.028,
    color: '#999',
    flex: 1,
    fontFamily: 'Figtree-Regular',
    fontWeight: '400'
  },
  viewReceiptBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewReceiptText: {
    color: '#fff',
    fontSize: width * 0.032,
    fontWeight: '600',
    fontFamily: 'Figtree-SemiBold',
  },

  /** BOTTOM BUTTON **/
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  topupButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  topupButtonDisabled: {
    backgroundColor: '#ccc',
  },
  topupButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
  },

  /** SUCCESS POPUP **/
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.08,
  },
  successBox: {
    width: width * 0.84,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIconImage: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
    fontFamily: 'Figtree-Bold',
  },
  successMessage: {
    fontSize: width * 0.037,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    fontFamily: 'Figtree-Medium',
    fontWeight: '500'
  },
  receiptButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontFamily: 'Figtree-SemiBold',
    fontWeight: '600'
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: width * 0.04,
    fontWeight: '600',
    fontFamily: 'Figtree-SemiBold',
  },
});
