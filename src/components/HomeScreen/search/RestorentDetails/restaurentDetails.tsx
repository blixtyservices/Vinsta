import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../../../theme/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { ThemeContext } from '../../../../theme/ThemeContext';
import { getFontFamily, getFontWeight } from '../../../../utils/fontHelper';
import { vibrate } from '../../../../utils/vibrationHelper';
import RecommendedFood from './RecommendedFood';
import BestInBurger from './BestInBurger';
import FilterModal from './FilterModal';
import FoodDetailModal from './FoodDetailModal';
import VegNonVegModal from './VegNonVegModal';
import RestuarantBadge from './RestuarantBadge';
import FilterTags from './FilterTags';
import { menuAPI } from '../../../../services/api';
import { useCart } from '../../../../context/CartContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const categories = [
  { name: 'All', img: require('../../../../assets/ct1.png') },
  { name: 'Veg Meal', img: require('../../../../assets/ct2.png') },
  { name: 'Thali', img: require('../../../../assets/ct4.png') },
  { name: 'Pizza', img: require('../../../../assets/ct3.png') },
  { name: 'Burger', img: require('../../../../assets/ct2.png') },
  { name: 'Mexican', img: require('../../../../assets/ct3.png') },
];

interface FoodItem {
  id: number;
  name: string;
  price: number;
  oldPrice: number;
  time: string;
  img: any;
  description?: string;
  restaurant?: string;
  isVeg?: boolean;
}

const RestaurentDetails: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, isDarkMode } = useContext(ThemeContext);
  const isDark = theme.mode === 'dark';
  const route = useRoute<any>();
  const { addItem } = useCart();

  const restaurant = route.params?.restaurant || {};
  const restaurantId = restaurant._id || restaurant.id || '';
  const restaurantName = restaurant.name || 'Restaurant';
  const selectedItem = route.params?.selectedItem || 'Burger';
  const initialFoodType = route.params?.foodType || 'Veg';

  const [likedItems, setLikedItems] = useState<number[]>([]);
  const [addedItems, setAddedItems] = useState<number[]>([]);
  const [heartScales] = useState<{ [key: number]: Animated.Value }>({});
  const [plusScales] = useState<{ [key: number]: Animated.Value }>({});
  const [activeCategory, setActiveCategory] = useState(selectedItem);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filters, setFilters] = useState<string[]>(['Spicy']);
  const [vegNonVegFilter, setVegNonVegFilter] = useState<'Veg' | 'NonVeg'>(
    initialFoodType,
  );
  const [vegNonVegDropdownVisible, setVegNonVegDropdownVisible] =
    useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuLoading, setMenuLoading] = useState(false);

  // Heart Icon in header state for liked toggle
  const [headerLiked, setHeaderLiked] = useState(false);
  const [headerHeartScale] = useState(new Animated.Value(1));

  // Food Item Modal States
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [selectedCheese, setSelectedCheese] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [cookingRequest, setCookingRequest] = useState<string>('');

  // Menu from API
  const [vegFoodItems, setVegFoodItems] = useState<FoodItem[]>([]);
  const [nonVegFoodItems, setNonVegFoodItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    if (!restaurantId) return;
    setMenuLoading(true);
    menuAPI.getMenu(restaurantId)
      .then((res: any) => {
        const items: FoodItem[] = (res.menu || []).map((m: any) => ({
          id: m._id,
          name: m.name,
          price: m.price,
          oldPrice: m.originalPrice || m.price,
          time: m.preparationTime || '10-15 mins',
          img: m.imageUrl ? { uri: m.imageUrl } : require('../../../../assets/b1.png'),
          description: m.description || '',
          restaurant: restaurantName,
          isVeg: !!m.isVeg,
        }));
        setVegFoodItems(items.filter(i => i.isVeg));
        setNonVegFoodItems(items.filter(i => !i.isVeg));
      })
      .catch(() => {
        // API not ready — keep empty arrays
      })
      .finally(() => setMenuLoading(false));
  }, [restaurantId]);

  const foodItems = vegNonVegFilter === 'Veg' ? vegFoodItems : nonVegFoodItems;

  const handleHeartPress = (id: number) => {
    if (!heartScales[id]) heartScales[id] = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(heartScales[id], {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(heartScales[id], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    setLikedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const handlePlusPress = (id: number) => {
    if (!plusScales[id]) plusScales[id] = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(plusScales[id], {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(plusScales[id], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    setAddedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const toggleFilter = (filterName: string) => {
    setFilters(prev => {
      if (prev.includes(filterName)) {
        return prev.filter(f => f !== filterName);
      } else {
        return [...prev, filterName];
      }
    });
  };

  const [appliedFilters, setAppliedFilters] = useState({
    sortBy: 'Price High to Low',
    TopPicks: 'Highly Recommended',
    DietaryPrefrence: 'Spicy',
  });

  const filterOptions = {
    sortBy: ['Price Low to High', 'Price High to Low'],
    TopPicks: ['Highly Recommended'],
    DietaryPrefrence: ['Spicy'],
  };

  const hasActiveFilters = () => {
    return Object.values(appliedFilters).some(filter => filter !== 'All');
  };

  const handleFoodItemPress = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(1);
    setSelectedCheese([]);
    setCookingRequest('');
    setFoodModalVisible(true);
  };

  const toggleCheeseSelection = (cheese: string) => {
    setSelectedCheese(prev => {
      if (prev.includes(cheese)) {
        return prev.filter(c => c !== cheese);
      } else {
        if (prev.length < 2) {
          return [...prev, cheese];
        }
        return prev;
      }
    });
  };

  const handleAddToCart = () => {
    if (selectedFood) {
      addItem(
        {
          menuItemId: String(selectedFood.id),
          name: selectedFood.name,
          price: selectedFood.price,
          quantity: quantity,
          isVeg: !!selectedFood.isVeg,
          description: selectedFood.description,
          specialInstructions: cookingRequest || undefined,
        },
        restaurantId,
        restaurantName,
      );
      setAddedItems(prev => [...prev, selectedFood.id as number]);
      setFoodModalVisible(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getTotalPrice = () => {
    if (!selectedFood) return 0;
    let basePrice = selectedFood.price;

    selectedCheese.forEach(cheese => {
      if (cheese === 'Single Cheese Slice') {
        basePrice += 25.0;
      } else if (cheese === 'Double Cheese Slice') {
        basePrice += 39.0;
      }
    });

    return basePrice * quantity;
  };

  const resetFilters = () => {
    setAppliedFilters({
      sortBy: 'Price High to Low',
      TopPicks: 'Highly Recommended',
      DietaryPrefrence: 'Spicy',
    });
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('../../../../assets/emptycart.png')}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyText}>
        {vegNonVegFilter === 'NonVeg'
          ? "Non-veg option is not available here you can explore from veg option's."
          : "Veg option is not available here you can explore from non-veg option's."}
      </Text>
    </View>
  );

  const currentIcon =
    vegNonVegFilter === 'Veg'
      ? require('../../../../assets/leaf.png')
      : require('../../../../assets/nonveg.png');

  // Heart press handler for header back button heart with scale animation, color switch, and vibration
  const onHeaderHeartPress = () => {
    vibrate(40); // Use vibrationHelper with consistent duration
    Animated.sequence([
      Animated.timing(headerHeartScale, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(headerHeartScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    setHeaderLiked(prev => !prev);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* VEG/NON-VEG DROPDOWN MODAL */}
      <VegNonVegModal
        visible={vegNonVegDropdownVisible}
        onClose={() => setVegNonVegDropdownVisible(false)}
        vegNonVegFilter={vegNonVegFilter}
        setVegNonVegFilter={setVegNonVegFilter}
      />

      {/* FOOD ITEM DETAIL MODAL */}
      <FoodDetailModal
        foodModalVisible={foodModalVisible}
        setFoodModalVisible={setFoodModalVisible}
        selectedFood={selectedFood}
        selectedCheese={selectedCheese}
        toggleCheeseSelection={toggleCheeseSelection}
        quantity={quantity}
        incrementQuantity={incrementQuantity}
        decrementQuantity={decrementQuantity}
        cookingRequest={cookingRequest}
        setCookingRequest={setCookingRequest}
        handleAddToCart={handleAddToCart}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ===== HEADER IMAGE & ICONS ===== */}
        <View style={styles.headerImgBox}>
          <Image
            source={require('../../../../assets/r1.png')}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={require('../../../../assets/back.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Bistro Excellence</Text>

            {/* Heart Button - Same style as previous components */}
            <TouchableOpacity
              style={[
                styles.productHeartWrapper,
                {
                  backgroundColor: headerLiked
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(255, 255, 255, 0.3)',
                },
              ]}
              onPress={onHeaderHeartPress}
              activeOpacity={0.7}
            >
              <Animated.Image
                source={
                  headerLiked
                    ? require('../../../../assets/heartfill.png')
                    : require('../../../../assets/heart.png')
                }
                style={[
                  styles.heartIcon,
                  { tintColor: headerLiked ? COLORS.primary : '#fff' },
                  { transform: [{ scale: headerHeartScale }] },
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== RESTAURANT BADGE ===== */}
        <RestuarantBadge />

        {/* ===== SEARCH BAR ===== */}
        <View style={styles.searchWrapper}>
          <View
            style={[
              styles.searchRow,
              {
                backgroundColor: theme.cardBackground,
              },
            ]}
          >
            <Image
              source={require('../../../../assets/search.png')}
              style={[styles.searchIcon]}
            />
            <TextInput
              placeholder="search"
              placeholderTextColor="#999"
              style={[
                styles.input,
                {
                  color: theme.text,
                },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.searchFilterContainer}
            onPress={() => navigation.navigate('MenuScreen')}
          >
            <Image
              source={require('../../../../assets/menu.png')}
              style={styles.searchFilterIcon}
            />
          </TouchableOpacity>
        </View>

        {/* ===== CATEGORY BAR ===== */}
        <View style={styles.categoryHeader}>
          <Image source={currentIcon} style={styles.leafIcon} />
          <Text style={[styles.availText, { color: theme.text }]}>
            Available options for {selectedItem}
          </Text>
          <Image
            source={
              vegNonVegFilter === 'Veg'
                ? require('../../../../assets/veg.png')
                : require('../../../../assets/nonveg.png')
            }
            style={styles.vegIcon}
          />
          <TouchableOpacity onPress={() => setVegNonVegDropdownVisible(true)}>
            <Image
              source={require('../../../../assets/dropdown.png')}
              style={styles.dropIcon}
            />
          </TouchableOpacity>
        </View>

        {/* ===== NEW CATEGORIES COMPONENT ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[
            styles.categorySlider,
            isDarkMode || theme.mode === 'dark'
              ? { backgroundColor: theme.backgroundColor || '#000' }
              : { backgroundColor: '#FFF' }
          ]}
          contentContainerStyle={styles.categorySliderContent}
          bounces={false}
        >
          {categories.map((cat, index) => {
            const selected = activeCategory === cat.name;

            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryItem,
                  index > 0 && { marginLeft: wp('3.5%') }
                ]}
                onPress={() => setActiveCategory(cat.name)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryContent}>
                  <Image
                    source={cat.img}
                    style={styles.categoryIcon}
                    resizeMode="contain"
                  />

                  <Text style={[
                    styles.categoryText,
                    selected
                      ? { color: COLORS.primary }
                      : { color: isDarkMode || theme.mode === 'dark' ? '#AAA' : '#666' }
                  ]}>
                    {cat.name}
                  </Text>

                  {selected && (
                    <View style={styles.selectedIndicator} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Menu loading / content */}
        {menuLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: hp('10%') }}
          />
        ) : foodItems.length > 0 ? (
          <>
            {/* ===== FILTER TAGS ===== */}
            <FilterTags
              setShowFilterModal={setShowFilterModal}
              hasActiveFilters={hasActiveFilters}
              toggleFilter={toggleFilter}
              filters={filters}
            />

            {/* ===== RECOMMENDATION HEADER ===== */}
            <View style={styles.recommendHeaderRow}>
              <Image source={currentIcon} style={styles.recommendHeaderIcon} />
              <Text style={[styles.recommendHeaderText, { color: theme.text }]}>
                Recommendation for you
              </Text>
            </View>

            {/* FOOD GRID (Recommendation) */}
            <RecommendedFood
              foodItems={foodItems}
              likedItems={likedItems}
              heartScales={heartScales}
              plusScales={plusScales}
              handleHeartPress={handleHeartPress}
              handlePlusPress={handlePlusPress}
              handleFoodItemPress={handleFoodItemPress}
            />

            {/* ===== BEST IN CATEGORY ===== */}
            <View style={styles.bestBurgerHeaderRow}>
              <Image
                source={require('../../../../assets/popular.png')}
                style={styles.bestBurgerHeaderIcon}
              />
              <Text
                style={[styles.bestBurgerHeaderText, { color: theme.text }]}
              >
                Best In {activeCategory}
              </Text>
            </View>
            <BestInBurger
              foodItems={foodItems}
              likedItems={likedItems}
              heartScales={heartScales}
              plusScales={plusScales}
              handleHeartPress={handleHeartPress}
              handlePlusPress={handlePlusPress}
              handleFoodItemPress={handleFoodItemPress}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </ScrollView>

      <FilterModal
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

export default RestaurentDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp('2%'),
  },
  headerImgBox: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: hp('24%'),
    borderBottomLeftRadius: wp('6%'),
    borderBottomRightRadius: wp('6%'),
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('24%'),
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: hp('6%'),
    paddingHorizontal: wp('5%'),
    zIndex: 9,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: hp('6.5%'),
    textAlign: 'center',
    color: '#fff',
    fontSize: hp('2.2%'),
    letterSpacing: 0.6,
    textShadowColor: '#000',
    textShadowRadius: 4,
    fontFamily: Platform.OS === 'android' ? 'Figtree-Bold' : 'Figtree',
    fontWeight: Platform.OS === 'android' ? undefined : '700',
  },
  backBtn: {
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: wp('50%'),
    padding: wp('1.5%'),
  },
  backIcon: {
    width: wp('5.5%'),
    height: wp('5.5%'),
    tintColor: '#fff',
  },
  productHeartWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: wp('5%'),
    padding: wp('2%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heartIcon: {
    width: wp('4%'),
    height: wp('4%'),
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('5.5%'),
    marginTop: hp('1.6%'),
    marginBottom: hp('0.4%'),
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: wp('3.5%'),
    paddingHorizontal: wp('3.5%'),
    height: hp('5.5%'),
    elevation: 1,
  },
  searchIcon: {
    width: wp('4.5%'),
    height: wp('4.5%'),
    tintColor: '#999',
    marginRight: wp('1.8%'),
  },
  input: {
    flex: 1,
    paddingVertical: hp('1%'),
    fontSize: hp('1.8%'),
    color: '#111',
    fontFamily: Platform.OS === 'android' ? 'Figtree-Regular' : 'Figtree',
    fontWeight: Platform.OS === 'android' ? undefined : '400',
  },
  searchFilterContainer: {
    backgroundColor: COLORS.primary,
    marginLeft: wp('3%'),
    padding: wp('2.5%'),
    borderRadius: wp('3.5%'),
    elevation: 2,
  },
  searchFilterIcon: {
    width: wp('5.5%'),
    height: wp('5.5%'),
    tintColor: '#fff',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('5.5%'),
    marginTop: hp('1.3%'),
  },
  leafIcon: {
    width: wp('3.5%'),
    height: wp('3.5%'),
    marginRight: wp('1.8%'),
  },
  availText: {
    color: '#000',
    fontSize: hp('1.8%'),
    flex: 1,
    fontFamily: Platform.OS === 'android' ? 'Figtree-Bold' : 'Figtree',
    fontWeight: Platform.OS === 'android' ? undefined : '700',
  },
  vegIcon: {
    width: wp('3.5%'),
    height: wp('3.5%'),
    marginLeft: wp('1.8%'),
    marginRight: wp('1.2%'),
  },
  dropIcon: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    resizeMode: 'contain',
    tintColor: '#999',
  },
  // ===== NEW CATEGORIES STYLES (EXACT COPY FROM FIRST COMPONENT) =====
  categorySlider: {
    paddingVertical: hp('1%'),
  },
  categorySliderContent: {
    paddingHorizontal: wp('3%'),
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: wp('18%'),
  },
  categoryContent: {
    alignItems: 'center',
    position: 'relative',
    paddingBottom: hp('0.6%'),
  },
  categoryIcon: {
    width: wp('12%'),
    height: wp('12%'),
    marginBottom: hp('0.8%'),
  },
  categoryText: {
    fontSize: hp('1.4%'),
    fontFamily: Platform.OS === 'android' ? 'Figtree-SemiBold' : 'Figtree',
    fontWeight: Platform.OS === 'android' ? '600' : '600',
    textAlign: 'center',
    marginBottom: hp('0.3%'),
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    width: wp('6%'),
    height: hp('0.25%'),
    backgroundColor: COLORS.primary,
    borderRadius: wp('0.25%'),
  },
  // ===== END NEW CATEGORIES STYLES =====
  recommendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('5.5%'),
    marginTop: hp('1.8%'),
    marginBottom: hp('0.2%'),
  },
  recommendHeaderIcon: {
    width: wp('3.5%'),
    height: wp('3.5%'),
    marginRight: wp('1.5%'),
  },
  recommendHeaderText: {
    color: '#222',
    fontSize: hp('1.8%'),
    fontFamily: Platform.OS === 'android' ? 'Figtree-Bold' : 'Figtree',
    fontWeight: Platform.OS === 'android' ? undefined : '700',
  },
  bestBurgerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp('5.5%'),
    marginBottom: hp('0.7%'),
    marginTop: hp('1.7%'),
  },
  bestBurgerHeaderIcon: {
    width: wp('4%'),
    height: wp('4%'),
    marginRight: wp('1.8%'),
  },
  bestBurgerHeaderText: {
    color: '#222',
    fontSize: hp('1.7%'),
    fontFamily: Platform.OS === 'android' ? 'Figtree-Bold' : 'Figtree',
    fontWeight: Platform.OS === 'android' ? undefined : '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
    paddingVertical: hp('10%'),
    minHeight: hp('40%'),
  },
  emptyImage: {
    width: wp('90%'),
    height: wp('60%'),
    resizeMode: 'contain',
    marginBottom: hp('0%'),
  },
  emptyText: {
    fontSize: hp('2%'),
    color: '#666',
    textAlign: 'center',
    lineHeight: hp('3%'),
    fontFamily: Platform.OS === 'android' ? 'Figtree-Medium' : 'Figtree',
    fontWeight: Platform.OS === 'android' ? undefined : '500',
  },
});
