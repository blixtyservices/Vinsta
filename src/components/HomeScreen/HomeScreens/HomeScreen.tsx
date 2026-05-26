import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Categories from './Categories';
import OfferCard from './OfferCard';
import SearchItem from './SearchItem';
import FeaturedRestaurant from './FeaturedRestaurant';
import BesRatedBurger from './BesRatedBurger';
import AllRestaurants from './AllRestaurants';
import SearchModal from './SearchModal';
import { ThemeContext } from '../../../theme/ThemeContext';
import { vibrate } from '../../../utils/vibrationHelper';
import ViewCartCard from './ViewCartCard';
import { restaurantAPI } from '../../../services/api';
import { useCart } from '../../../context/CartContext';

const { width, height } = Dimensions.get('window');

// Calculate responsive dimensions with iOS optimizations
const isTablet = width >= 768;
const isSmallScreen = width < 380;
const screenRatio = width / height;
const isIOS = Platform.OS === 'ios';

// iOS-specific font scaling
const fontScale = size => {
  if (isIOS) {
    return isTablet ? size * 0.85 : size * 0.95;
  }
  return isTablet ? size * 0.85 : size;
};

// iOS-specific dimension scaling
const scaleSize = size => {
  if (isIOS) {
    return isTablet ? size * 0.9 : size * 1.02;
  }
  return size;
};

// ✅ UNIVERSAL Font family helper with proper iOS and Android support
const getFontFamily = (weight = 'Regular') => {
  if (Platform.OS === 'ios') {
    return 'Figtree';
  } else {
    const fontMap = {
      '100': 'Figtree-Thin',
      '200': 'Figtree-ExtraLight',
      '300': 'Figtree-Light',
      '400': 'Figtree-Regular',
      '500': 'Figtree-Medium',
      '600': 'Figtree-SemiBold',
      '700': 'Figtree-Bold',
      '800': 'Figtree-ExtraBold',
      '900': 'Figtree-Black',
      Thin: 'Figtree-Thin',
      ExtraLight: 'Figtree-ExtraLight',
      Light: 'Figtree-Light',
      Regular: 'Figtree-Regular',
      Medium: 'Figtree-Medium',
      SemiBold: 'Figtree-SemiBold',
      Bold: 'Figtree-Bold',
      ExtraBold: 'Figtree-ExtraBold',
      Black: 'Figtree-Black',
    };
    return fontMap[weight] || 'Figtree-Regular';
  }
};

// ✅ Get fontWeight for iOS (Android ignores this)
const getFontWeight = (weight = 'Regular') => {
  if (Platform.OS === 'android') {
    return undefined;
  }

  const weightMap = {
    Thin: '100',
    ExtraLight: '200',
    Light: '300',
    Regular: '400',
    Medium: '500',
    SemiBold: '600',
    Bold: '700',
    ExtraBold: '800',
    Black: '900',
    '100': '100',
    '200': '200',
    '300': '300',
    '400': '400',
    '500': '500',
    '600': '600',
    '700': '700',
    '800': '800',
    '900': '900',
  };
  return weightMap[weight] || '400';
};

// ✅ Complete font style helper
const getTextStyle = (weight = 'Regular') => {
  return {
    fontFamily: getFontFamily(weight),
    ...(Platform.OS === 'ios' && { fontWeight: getFontWeight(weight) }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  };
};

// Separate veg and non-veg products
const vegProducts = [
  {
    id: 1,
    name: 'Veg Cheese Burger',
    price: '₹45.50',
    img: require('../../../assets/b1.png'),
    oldPrice: '₹50.50',
    rating: 4.4,
    deliveryTime: '10-15 mins',
    isFavorite: false,
  },
  {
    id: 2,
    name: 'Veg Delight Burger',
    price: '₹45.50',
    img: require('../../../assets/b2.png'),
    oldPrice: '₹50.50',
    rating: 4.4,
    deliveryTime: '10-15 mins',
    isFavorite: false,
  },
  {
    id: 3,
    name: 'Garden Fresh Burger',
    price: '₹45.50',
    img: require('../../../assets/b1.png'),
    oldPrice: '₹50.50',
    rating: 4.4,
    deliveryTime: '10-15 mins',
    isFavorite: false,
  },
  {
    id: 4,
    name: 'Veggie Supreme',
    price: '₹45.50',
    img: require('../../../assets/b3.png'),
    oldPrice: '₹50.50',
    rating: 4.4,
    deliveryTime: '10-15 mins',
    isFavorite: false,
  },
];

const nonVegProducts = [
  {
    id: 1,
    name: 'Chicken Deluxe',
    price: '₹55.50',
    img: require('../../../assets/non1.png'),
    oldPrice: '₹60.50',
    rating: 4.4,
    deliveryTime: '10-15 mins',
    isFavorite: false,
  },
  {
    id: 2,
    name: 'Beef Special',
    price: '₹65.50',
    img: require('../../../assets/non2.png'),
    oldPrice: '₹70.50',
    rating: 4.4,
    deliveryTime: '10-15 mins',
    isFavorite: false,
  },
  {
    id: 3,
    name: 'Mutton Classic',
    price: '₹75.50',
    img: require('../../../assets/non3.png'),
    oldPrice: '₹80.50',
    rating: 4.4,
    deliveryTime: '10-15 mins',
    isFavorite: false,
  },
  {
    id: 4,
    name: 'Seafood Combo',
    price: '₹85.50',
    img: require('../../../assets/non1.png'),
    oldPrice: '₹90.50',
    rating: 4.4,
    deliveryTime: '10-15 mins',
    isFavorite: false,
  },
];

// Fallback placeholder restaurant for initial renders
const PLACEHOLDER_IMG = require('../../../assets/featuredrestaurant.png');

const mapRestaurant = (r: any) => ({
  id: r._id,
  _id: r._id,
  name: r.name,
  img: r.imageUrl ? { uri: r.imageUrl } : PLACEHOLDER_IMG,
  rating: r.averageRating ?? 4.0,
  deliveryTime: r.estimatedDeliveryTime || '15-20 mins',
  tags: r.categories || [],
  isFavorite: false,
  isVeg: !!r.isVeg,
});

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('Burger');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegMode, setIsVegMode] = useState(true);
  const { theme } = useContext(ThemeContext);
  const { totalItems, totalAmount } = useCart();
  const [vegProductsState, setVegProductsState] = useState(vegProducts);
  const [nonVegProductsState, setNonVegProductsState] =
    useState(nonVegProducts);
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [vegRestaurantsState, setVegRestaurantsState] = useState<any[]>([]);
  const [nonVegRestaurantsState, setNonVegRestaurantsState] = useState<any[]>([]);

  // Load restaurants from API
  useEffect(() => {
    restaurantAPI.getAll()
      .then((res: any) => {
        const list = (res.restaurants || []).map(mapRestaurant);
        setAllRestaurants(list);
        setVegRestaurantsState(list.filter((r: any) => r.isVeg));
        setNonVegRestaurantsState(list.filter((r: any) => !r.isVeg));
      })
      .catch(() => {
        // Keep empty — no restaurants added yet
      });
  }, []);

  // Cart state from context
  const cartItemsCount = totalItems;
  const cartTotal = totalAmount;

  const toggleVegMode = () => {
    setIsVegMode(prev => !prev);
  };

  // Toggle favorite status for products with vibration
  const toggleFavoriteProduct = (productId: number, isVeg: boolean) => {
    vibrate(40);

    if (isVeg) {
      setVegProductsState(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, isFavorite: !product.isFavorite }
            : product,
        ),
      );
    } else {
      setNonVegProductsState(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, isFavorite: !product.isFavorite }
            : product,
        ),
      );
    }
  };

  // Toggle favorite status for restaurants with vibration
  const toggleFavoriteRestaurant = (restaurantId: number, isVeg: boolean) => {
    vibrate(40);

    if (isVeg) {
      setVegRestaurantsState(prevRestaurants =>
        prevRestaurants.map(restaurant =>
          restaurant.id === restaurantId
            ? { ...restaurant, isFavorite: !restaurant.isFavorite }
            : restaurant,
        ),
      );
    } else {
      setNonVegRestaurantsState(prevRestaurants =>
        prevRestaurants.map(restaurant =>
          restaurant.id === restaurantId
            ? { ...restaurant, isFavorite: !restaurant.isFavorite }
            : restaurant,
        ),
      );
    }
  };

  // Navigation handlers
  const handleTodayOfferViewAll = () => {
    navigation.navigate('todayOfferView');
  };

  const handleFeaturedRestaurantViewAll = () => {
    navigation.navigate('featuredRestrorents');
  };

  const handleBestBurgerViewAll = () => {
    navigation.navigate('bestBurger');
  };

  const handleAllRestaurantsViewAll = () => {
    navigation.navigate('featuredRestrorents');
  };

  const handleProductPress = product => {
    navigation.navigate('fooddetails', { product });
  };

  const handleWalletPress = () => {
    navigation.navigate('Wallet');
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  // Calculate proper status bar height for both platforms
  const getStatusBarHeight = () => {
    if (isIOS) {
      return Math.max(insets.top, 20);
    } else {
      return StatusBar.currentHeight || 0;
    }
  };

  const handleRestaurantPress = (restaurant: any) => {
    navigation.navigate('restaurentDetails', { restaurant });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const resetFilters = () => {
    setAppliedFilters({
      category: 'All',
      rating: 'All',
      priceRange: [100, 650],
      sortBy: 'Recent',
    });
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  // Get current restaurants and products based on mode
  const getCurrentRestaurants = () => {
    return isVegMode ? vegRestaurantsState : nonVegRestaurantsState;
  };

  const getCurrentProducts = () => {
    return isVegMode ? vegProductsState : nonVegProductsState;
  };

  const [appliedFilters, setAppliedFilters] = useState({
    category: 'All',
    rating: 'All',
    priceRange: [100, 650],
    sortBy: 'Recent',
  });

  const filterOptions = {
    category: ['All', 'Cold Drink', 'Fast Food', 'Paneer'],
    rating: ['All', '4.0', '4.5'],
    priceRange: [0, 1000],
    sortBy: ['Popular', 'Recent', 'Price High', 'Price Low'],
  };

  const hasActiveFilters = () => {
    return Object.values(appliedFilters).some(filter => filter !== 'All');
  };

  // Calculate total number of restaurants
  const getTotalRestaurantsCount = () => {
    const currentRestaurants = getCurrentRestaurants();
    // Add additional restaurants count (3 additional restaurants as per your data)
    return currentRestaurants.length + 3; // 2 current + 3 additional = 5 total
  };

  // Veg/Non-Veg Toggle Component
  const VegToggleSwitch = () => {
    const toggleAnimRef = useRef(new Animated.Value(0));
    const toggleAnim = toggleAnimRef.current;

    // Compact dimensions
    const switchWidth = isTablet ? scaleSize(wp('9.5%')) : scaleSize(wp('11%'));
    const switchHeight = isTablet ? hp('2.3%') : hp('2.6%');
    const circleSize = isTablet ? hp('1.8%') : hp('2%');
    const padding = wp('0.5%');
    const maxTranslateX = switchWidth - circleSize - padding * 2;

    const translateX = toggleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [padding, maxTranslateX],
    });

    // FIXED: When isVegMode is true (Veg Mode), the circle should be green
    // When isVegMode is false (Non-Veg Mode), the circle should be red
    const toggleBgColor = toggleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FF6B6B', '#4CAF50'], // Red for Non-Veg, Green for Veg
    });

    useEffect(() => {
      // Set animation value based on isVegMode
      // isVegMode = true (Veg) -> animated value = 1 (green)
      // isVegMode = false (Non-Veg) -> animated value = 0 (red)
      Animated.timing(toggleAnimRef.current, {
        toValue: isVegMode ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [isVegMode]);

    return (
      <View style={styles.vegToggleContainer}>
        <TouchableOpacity
          style={[
            styles.switchOuter,
            {
              backgroundColor: theme.background,
              width: switchWidth,
              height: switchHeight,
            },
          ]}
          onPress={toggleVegMode}
          activeOpacity={0.8}
        >
          <View style={styles.switchBackground} />

          <Animated.View
            style={[
              styles.switchCircle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                transform: [{ translateX }],
                backgroundColor: toggleBgColor,
              },
            ]}
          />

          <View style={styles.switchLabelsContainer}>
            <Text
              style={[
                styles.switchTextLeft,
                {
                  color: isVegMode ? '#fff' : theme.text,
                },
              ]}
            >
              OFF
            </Text>
            <Text
              style={[
                styles.switchTextRight,
                {
                  color: !isVegMode ? '#fff' : theme.text,
                },
              ]}
            >
              ON
            </Text>
          </View>
        </TouchableOpacity>

        <Text
          style={[
            styles.vegModeTxt,
            {
              color: theme.background,
            },
          ]}
          numberOfLines={1}
        >
          {isVegMode ? 'Veg Mode' : 'Non-Veg Mode'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
        translucent={false}
      />
      <View style={[styles.statusBarArea, { height: getStatusBarHeight() }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={isIOS}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.rowJustify}>
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <Image
                  source={require('../../../assets/location.png')}
                  style={[styles.icon, { tintColor: theme.background }]}
                />
                <Text
                  style={[styles.locationText, { color: theme.background }]}
                >
                  Location
                </Text>
                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={[styles.dropdownIcon, { tintColor: theme.background }]}
                />
              </View>
              <Text style={[styles.addressText, { color: theme.background }]}>
                4102 Pretty View Lane
              </Text>
            </View>
            <View style={styles.walletBagRow}>
              <TouchableOpacity
                style={[
                  styles.walletBtn,
                  { backgroundColor: theme.background },
                ]}
                activeOpacity={0.7}
                onPress={handleWalletPress}
              >
                <Image
                  source={require('../../../assets/wallet.png')}
                  style={styles.walletIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bagBtn, { backgroundColor: theme.background }]}
                activeOpacity={0.7}
                onPress={handleCartPress}
              >
                <Image
                  source={require('../../../assets/bag.png')}
                  style={styles.bagIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search and Veg Toggle in same row */}
          <View style={styles.searchRow}>
            <View style={styles.searchItemContainer}>
              <SearchItem
                onOpenFilter={() => setShowFilterModal(true)}
                hasActiveFilters={hasActiveFilters}
              />
            </View>
            
            <VegToggleSwitch />
          </View>
        </View>

        {/* Main Content */}
        <View
          style={[styles.mainContent, { backgroundColor: theme.background }]}
        >
          {/* Today's Offers */}
          <View style={styles.sectionRowBetween}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Today's Offer's
            </Text>
            <TouchableOpacity
              onPress={handleTodayOfferViewAll}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Offer Card */}
          <OfferCard />

          {/* Categories */}
          <Categories />

          {/* Featured Restaurants */}
          <View style={styles.sectionRowBetween}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Featured restaurants
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleFeaturedRestaurantViewAll}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <FeaturedRestaurant
            getCurrentRestaurants={getCurrentRestaurants}
            handleRestaurantPress={handleRestaurantPress}
            toggleFavorite={toggleFavoriteRestaurant}
            isVegMode={isVegMode}
          />

          {/* Best-Rated Burgers */}
          <View style={styles.sectionRowBetween}>
            <View style={styles.sectionTitleRow}>
              <Image
                source={require('../../../assets/popular.png')}
                style={styles.sectionIcon}
                resizeMode="contain"
              />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {isVegMode ? 'Best-Rated Burgers' : 'Best-Rated Non-Veg'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleBestBurgerViewAll}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <BesRatedBurger
            getCurrentProducts={getCurrentProducts}
            handleProductPress={handleProductPress}
            toggleFavorite={toggleFavoriteProduct}
            isVegMode={isVegMode}
          />

          {/* NEW: All Restaurants Section */}
          <View style={styles.sectionRowBetween}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.restaurantTitleContainer}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Restaurants Near You
                </Text>
                <Text style={[styles.restaurantCountText, { color: theme.text }]}>
                  ({getTotalRestaurantsCount()})
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleAllRestaurantsViewAll}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <AllRestaurants
            getCurrentRestaurants={getCurrentRestaurants}
            handleRestaurantPress={handleRestaurantPress}
            toggleFavorite={toggleFavoriteRestaurant}
            isVegMode={isVegMode}
          />

          {/* Bottom info */}
          <View style={styles.bottomRow}>
            <Image
              source={require('../../../assets/walk.png')}
              style={styles.bottomImage}
              resizeMode="contain"
            />
            <View style={styles.bottomTextContainer}>
              <Text style={[styles.reachingTxt]}>
                Reaching at your doorstep
              </Text>
              <View style={styles.deliveryTimeContainer}>
                <Image
                  source={require('../../../assets/clock.png')}
                  style={[
                    styles.deliveryClockIcon,
                    { tintColor: COLORS.primary },
                  ]}
                  resizeMode="contain"
                />
                <Text style={[styles.getDeliveredTxt, { color: theme.text }]}>
                  Get delivered in 15 minutes
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* View Cart Card Component */}
      <ViewCartCard cartItemsCount={cartItemsCount} cartTotal={cartTotal} />

      <SearchModal
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        filterOptions={filterOptions}
        appliedFilters={appliedFilters}
        setAppliedFilters={setAppliedFilters}
        resetFilters={resetFilters}
        applyFilters={applyFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarArea: {
    backgroundColor: COLORS.primary,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isIOS ? hp('12%') : hp('10%'),
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: scaleSize(wp('4.5%')),
    paddingTop: isIOS ? hp('2.5%') : hp('3%'),
    borderBottomLeftRadius: scaleSize(wp('6%')),
    borderBottomRightRadius: scaleSize(wp('6%')),
    paddingBottom: isIOS ? hp('3.5%') : hp('4%'),
  },
  rowJustify: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp('1.5%'),
  },
  locationContainer: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.3%'),
  },
  icon: {
    width: isTablet ? scaleSize(wp('3.5%')) : scaleSize(wp('4.5%')),
    height: isTablet ? scaleSize(wp('3.5%')) : scaleSize(wp('4.5%')),
    marginRight: wp('1.5%'),
  },
  locationText: {
    ...getTextStyle('Medium'),
    fontSize: fontScale(14),
    color: COLORS.secondary,
    marginRight: wp('0.5%'),
  },
  dropdownIcon: {
    width: isTablet ? scaleSize(wp('1.8%')) : scaleSize(wp('2.5%')),
    height: isTablet ? scaleSize(wp('1%')) : scaleSize(wp('1.2%')),
    tintColor: COLORS.secondary,
    marginLeft: wp('1.5%'),
  },
  addressText: {
    ...getTextStyle('Regular'),
    fontSize: fontScale(13),
    color: COLORS.secondary,
    opacity: 0.9,
  },
  walletBagRow: {
    flexDirection: 'row',
    gap: wp('2.5%'),
  },
  walletBtn: {
    backgroundColor: '#fff',
    padding: isTablet ? scaleSize(wp('2%')) : scaleSize(wp('2.5%')),
    borderRadius: wp('50%'),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bagBtn: {
    backgroundColor: '#fff',
    padding: isTablet ? scaleSize(wp('1.8%')) : scaleSize(wp('2.2%')),
    borderRadius: wp('50%'),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  walletIcon: {
    width: isTablet ? scaleSize(wp('3.5%')) : scaleSize(wp('4.5%')),
    height: isTablet ? scaleSize(wp('3.5%')) : scaleSize(wp('4.5%')),
    tintColor: COLORS.primary,
  },
  bagIcon: {
    width: isTablet ? scaleSize(wp('3.5%')) : scaleSize(wp('4.5%')),
    height: isTablet ? scaleSize(wp('3.5%')) : scaleSize(wp('4.5%')),
    tintColor: COLORS.primary,
  },
  // Search and Veg Toggle Row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
    gap: wp('2%'),
  },
  searchItemContainer: {
    flex: 1,
  },
  // Veg Toggle Styles
  vegToggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('0.5%'),
  },
  switchOuter: {
    borderRadius: hp('1.15%'),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  switchBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: hp('1.15%'),
  },
  switchCircle: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -(isTablet ? hp('1.8%') : hp('2%')) / 2,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.15,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  switchLabelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('1.4%'),
    zIndex: 1,
  },
  switchTextLeft: {
    ...getTextStyle('SemiBold'),
    fontSize: fontScale(7),
  },
  switchTextRight: {
    ...getTextStyle('SemiBold'),
    fontSize: fontScale(7),
  },
  vegModeTxt: {
    ...getTextStyle('Bold'),
    fontSize: fontScale(9),
    marginTop: hp('0.3%'),
    color: COLORS.secondary,
    width: wp('18%'),
    textAlign: 'center',
  },
  mainContent: {
    marginTop: hp('2%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: COLORS.background,
    flex: 1,
  },
  sectionRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    marginTop: hp('1%'),
  },
  restaurantTitleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: wp('1%'),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  sectionIcon: {
    width: isTablet ? scaleSize(wp('4.5%')) : scaleSize(wp('5.5%')),
    height: isTablet ? scaleSize(wp('4.5%')) : scaleSize(wp('5.5%')),
  },
  sectionTitle: {
    ...getTextStyle('Bold'),
    fontSize: fontScale(18),
    color: COLORS.textDark,
  },
  restaurantCountText: {
    ...getTextStyle('Medium'),
    fontSize: fontScale(14), // Smaller size than the title
    color: COLORS.textLight,
    marginLeft: wp('0.5%'),
  },
  sectionLink: {
    ...getTextStyle('Medium'),
    fontSize: fontScale(14),
    color: COLORS.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1.5%'),
    marginBottom: hp('0.5%'),
    paddingHorizontal: wp('1.5%'),
  },
  bottomImage: {
    width: isTablet ? scaleSize(wp('7.5%')) : scaleSize(wp('9%')),
    height: isTablet ? scaleSize(wp('7.5%')) : scaleSize(wp('9%')),
  },
  bottomTextContainer: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  reachingTxt: {
    ...getTextStyle('SemiBold'),
    fontSize: fontScale(14),
    color: COLORS.primary,
    marginBottom: hp('0.2%'),
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.2%'),
  },
  deliveryClockIcon: {
    width: isTablet ? scaleSize(wp('2.2%')) : scaleSize(wp('2.7%')),
    height: isTablet ? scaleSize(wp('2.2%')) : scaleSize(wp('2.7%')),
    tintColor: COLORS.primary,
  },
  getDeliveredTxt: {
    ...getTextStyle('Regular'),
    fontSize: fontScale(13),
    color: COLORS.textLight,
  },
});

export default HomeScreen;