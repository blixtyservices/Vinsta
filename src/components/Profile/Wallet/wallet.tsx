import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme/colors';
import { ThemeContext } from '../../../theme/ThemeContext';
import { getFontFamily, getFontWeight } from '../../../utils/fontHelper';
import { walletAPI } from '../../../services/api';

const { width, height } = Dimensions.get('window');

const DEBIT_ICON = require('../../../assets/up1.png');
const CREDIT_ICON = require('../../../assets/down1.png');
const FOOD_ICON = require('../../../assets/b1.png');

const mapTransaction = (t: any) => ({
  id: t._id,
  title: t.description || (t.type === 'credit' ? 'Top up wallet' : 'Order payment'),
  time: t.createdAt
    ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '--',
  amount: `₹ ${Number(t.amount).toFixed(2)}`,
  type: t.type === 'credit' ? 'Top Up' : 'Orders',
  icon: FOOD_ICON,
  arrow: t.type === 'credit' ? CREDIT_ICON : DEBIT_ICON,
  rawType: t.type,
});

const Wallet = () => {
  const navigation = useNavigation<any>();
  const [showSearch, setShowSearch] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletUser, setWalletUser] = useState<string>('');
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [walletRes, txRes] = await Promise.all([
          walletAPI.get(),
          walletAPI.getTransactions(),
        ]);
        setWalletBalance(walletRes.balance ?? 0);
        setWalletUser(walletRes.user?.name || '');
        const mapped = (txRes.transactions || []).map(mapTransaction);
        setAllTransactions(mapped);
        setFilteredTransactions(mapped);
      } catch {
        // Keep zeros
      } finally {
        setWalletLoading(false);
      }
    };
    load();
  }, []);

  const handleFilterPress = (type: string) => {
    setFilterType(type);
    let filtered = [...allTransactions];
    switch (type) {
      case 'Older':
        filtered.sort((a, b) => a.id < b.id ? -1 : 1);
        break;
      case 'Latest':
        filtered.sort((a, b) => a.id > b.id ? -1 : 1);
        break;
      case 'Credit':
        filtered = allTransactions.filter(item => item.rawType === 'credit');
        break;
      case 'Debit':
        filtered = allTransactions.filter(item => item.rawType === 'debit');
        break;
      default:
        filtered = allTransactions;
    }
    setFilteredTransactions(filtered);
    setShowOptions(false);
  };

  const clearFilter = () => {
    setFilterType(null);
    setFilteredTransactions(allTransactions);
  };

  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image source={require('../../../assets/back.png')} style={[styles.backIcon, { tintColor: theme.text }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My E-Wallet</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
            <Image source={require('../../../assets/s1.png')} style={[styles.icon, { tintColor: theme.text }]} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
            <Image source={require('../../../assets/options.png')} style={[styles.icon, { marginLeft: 10, tintColor: theme.text }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor="#777"
            style={styles.searchInput}
          />
        </View>
      )}

      {/* Options Dropdown */}
      {showOptions && (
        <View style={[styles.dropdown, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity style={[styles.optionItem, { borderColor: theme.background }]} onPress={() => handleFilterPress('Older')}>
            <Text style={[styles.optionText, { color: theme.text }]}>Older First</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionItem, { borderColor: theme.background }]} onPress={() => handleFilterPress('Latest')}>
            <Text style={[styles.optionText, { color: theme.text }]}>Latest First</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionItem, { borderColor: theme.background }]} onPress={() => handleFilterPress('Credit')}>
            <Text style={[styles.optionText, { color: theme.text }]}>Only Credit</Text>
            <Image source={require('../../../assets/down1.png')} style={styles.optionIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionItem, { borderColor: theme.background }]} onPress={() => handleFilterPress('Debit')}>
            <Text style={[styles.optionText, { color: theme.text }]}>Only Debit</Text>
            <Image source={require('../../../assets/up1.png')} style={styles.optionIcon} />
          </TouchableOpacity>
          {filterType && (
            <TouchableOpacity style={[styles.optionItem, { borderBottomWidth: 0 }]} onPress={clearFilter}>
              <Text style={[styles.optionText, { color: COLORS.primary }]}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Wallet Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.cardBase} />
          <View style={styles.cardOverlay} />

          <View style={styles.cardContent}>
            <Text style={[styles.cardName, { color: theme.background }]}>{walletUser || 'Your Wallet'}</Text>
            <Text style={[styles.cardNumber, { color: theme.background }]}>VINSTA WALLET</Text>
            <Text style={[styles.balanceLabel, { color: theme.background }]}>Your balance</Text>

            {/* Row for balance + top up */}
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceAmount, { color: theme.background }]}>
                {walletLoading ? '...' : `₹ ${walletBalance.toLocaleString('en-IN')}`}
              </Text>
              <TouchableOpacity
                style={[styles.topUpBtn, { backgroundColor: theme.background }]}
                onPress={() => navigation.navigate('TopUp')}>
                <Image source={require('../../../assets/topup.png')} style={[styles.bagIcon, { tintColor: theme.text }]} />
                <Text style={[styles.topUpText, { color: theme.text }]}>Top Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardLogos}>
            <Image source={require('../../../assets/Splash.png')} style={[styles.cardLogo, { marginLeft: 8 }]} />
          </View>
        </View>

        {/* Filter Indicator */}
        {filterType && (
          <View style={[styles.filterIndicator, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.filterText, { color: theme.text }]}>Filter: {filterType}</Text>
            <TouchableOpacity onPress={clearFilter}>
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transaction History */}
        <View style={styles.transactionSection}>
          <View style={styles.transactionHeader}>
            <Text style={[styles.transactionTitle, { color: theme.text }]}>Transaction History</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {filteredTransactions.map(item => (
            <View key={item.id} style={[styles.transactionRow, { borderColor: theme.cardBackground }]}>
              <Image source={item.icon} style={styles.foodImg} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.foodTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={styles.foodTime}>{item.time}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.foodAmount, { color: theme.text }]}>{item.amount}</Text>
                <View style={styles.typeRow}>
                  <Text style={styles.typeText}>{item.type}</Text>
                  <Image source={item.arrow} style={styles.arrowIcon} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  /** HEADER **/
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.07,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain'
  },
  headerTitle: {
    fontSize: width * 0.045,
    color: '#000',
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#000',
    resizeMode: 'contain'
  },

  /** SEARCH **/
  searchBar: {
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    color: '#000',
    fontFamily: getFontFamily('Regular'),
    fontWeight: getFontWeight('Regular'),
  },

  /** DROPDOWN **/
  dropdown: {
    position: 'absolute',
    top: height * 0.13,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    zIndex: 999,
    minWidth: 150,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  optionText: {
    color: '#000',
    fontSize: 14,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },
  optionIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain'
  },

  /** CARD **/
  cardWrapper: {
    borderRadius: 18,
    height: height * 0.22,
    marginHorizontal: 20,
    marginTop: 5,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cardBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#8F3C09'
  },
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
  cardContent: {
    position: 'absolute',
    top: 20,
    left: 25,
    right: 25
  },
  cardName: {
    color: '#fff',
    fontSize: width * 0.045,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  cardNumber: {
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    fontFamily: getFontFamily('Regular'),
    fontWeight: getFontWeight('Regular'),
  },
  balanceLabel: {
    color: '#fff',
    opacity: 0.9,
    marginTop: 18,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'space-between',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: width * 0.08,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 0,
  },
  bagIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginRight: 6
  },
  topUpText: {
    color: '#000',
    fontSize: width * 0.035,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
  cardLogos: {
    position: 'absolute',
    top: 18,
    right: 25,
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain'
  },

  /** FILTER INDICATOR **/
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  filterText: {
    color: '#000',
    fontSize: 14,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
  clearFilterText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },

  /** TRANSACTION SECTION **/
  transactionSection: {
    marginTop: 25,
    paddingHorizontal: 20
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  transactionTitle: {
    fontSize: width * 0.042,
    color: '#000',
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: width * 0.037,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderColor: '#eee',
  },
  foodImg: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12
  },
  foodTitle: {
    fontSize: width * 0.038,
    color: '#000',
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
  foodTime: {
    color: '#888',
    fontSize: width * 0.032,
    marginTop: 2,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },
  foodAmount: {
    fontSize: width * 0.038,
    color: '#000',
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  typeText: {
    color: '#888',
    fontSize: width * 0.032,
    marginRight: 4,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },
  arrowIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain'
  },
});