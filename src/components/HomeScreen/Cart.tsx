import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../theme/ThemeContext';
import { COLORS } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { ordersAPI, authAPI } from '../../services/api';

const { width, height } = Dimensions.get('window');

// Font helper functions for Figtree
const getFontFamily = (weight = 'Regular') => {
  if (Platform.OS === 'ios') {
    return 'Figtree';
  } else {
    const fontMap: any = {
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

const getFontWeight = (weight = 'Regular') => {
  if (Platform.OS === 'android') {
    return undefined;
  }
  const weightMap: any = {
    Thin: '100',
    ExtraLight: '200',
    Light: '300',
    Regular: '400',
    Medium: '500',
    SemiBold: '600',
    Bold: '700',
    ExtraLight: '200',
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

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme.mode === 'dark';
  const { items: cartItems, restaurantId, restaurantName, updateQuantity: ctxUpdateQty, removeItem: ctxRemoveItem, clearCart, totalAmount } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [savedAddress, setSavedAddress] = useState<any>(null);

  // Load saved address from profile
  useEffect(() => {
    authAPI.getMe()
      .then((res: any) => {
        const addrs = res.user?.addresses || [];
        if (addrs.length > 0) {
          const def = addrs.find((a: any) => a.isDefault) || addrs[0];
          setSavedAddress(def);
        }
      })
      .catch(() => {});
  }, []);

  const [selectedAddress, setSelectedAddress] = useState({
    label: 'Home',
    address: '34/α/54 New Pachha Peth, Kamtam N...',
  });

  const [couponApplied, setCouponApplied] = useState(true);
  const [cutleryNeeded, setCutleryNeeded] = useState(false);

  // cooking request instruction (for first item)
  const [cookingInstruction, setCookingInstruction] = useState('');
  const [tempInstruction, setTempInstruction] = useState('');
  const [showInstructionModal, setShowInstructionModal] = useState(false);

  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // delete confirmation popup
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<null | {
    id: number;
    name: string;
  }>(null);

  const subtotal = totalAmount;
  const deliveryCharge = 50;
  const taxAndCharges = Math.round(subtotal * 0.05);
  const couponDiscount = couponApplied ? 50 : 0;
  const total = subtotal + deliveryCharge + taxAndCharges - couponDiscount;

  const updateQuantity = (id: any, increase: boolean) => {
    ctxUpdateQty(String(id), increase ? 1 : -1);
  };

  const askRemoveItem = (id: any, name: string) => {
    setItemToDelete({ id, name });
    setDeleteModalVisible(true);
  };

  const confirmRemoveItem = () => {
    if (itemToDelete) {
      ctxRemoveItem(String(itemToDelete.id));
    }
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const cancelRemoveItem = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const toggleCoupon = () => {
    setCouponApplied(!couponApplied);
  };

  const toggleCutlery = () => {
    setCutleryNeeded(!cutleryNeeded);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    const deliveryAddr = savedAddress || {
      label: selectedAddress.label,
      address: selectedAddress.address,
    };
    try {
      setPlacingOrder(true);
      const res = await ordersAPI.place({
        restaurantId: restaurantId!,
        items: cartItems.map(i => ({
          menuItem: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
        })),
        deliveryAddress: deliveryAddr,
        paymentMethod: 'cod',
        specialInstructions: cookingInstruction || undefined,
      });
      clearCart();
      navigation.navigate('PaymentSuccess', { orderId: res.order?._id });
    } catch (err: any) {
      Alert.alert('Order Failed', err.message || 'Could not place order. Try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const renderVegNonVegIcon = (isVeg: boolean) => {
    if (isVeg) {
      return (
        <View style={styles.vegIconContainer}>
          <Image
            source={require('../../assets/veg.png')}
            style={styles.vegNonVegIcon}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.nonVegIconContainer}>
          <Image
            source={require('../../assets/nonveg.png')}
            style={styles.vegNonVegIcon}
          />
        </View>
      );
    }
  };

  const openInstructionModal = () => {
    setTempInstruction(cookingInstruction);
    setShowInstructionModal(true);
  };

  const closeInstructionModal = () => {
    setShowInstructionModal(false);
  };

  const saveInstruction = () => {
    setCookingInstruction(tempInstruction.trim());
    setShowInstructionModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={
          theme.cardBackground === 'dark' ? 'light-content' : 'dark-content'
        }
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/back.png')}
            style={[styles.backIcon, { tintColor: theme.text }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Cart</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* RESTAURANT HEADER */}
        <View
          style={[
            styles.restaurantCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.restaurantHeader}>
            <Image
              source={require('../../assets/home.png')}
              style={styles.homeIcon}
            />
            <View style={styles.restaurantInfo}>
              <Text style={[styles.restaurantName, { color: theme.text }]}>
                Domino&apos;s Pizza
              </Text>
              <View style={styles.addressRow}>
                <Text
                  style={[
                    styles.restaurantAddress,
                    { color: theme.textSecondary },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedAddress.label} | {selectedAddress.address}
                </Text>
                <TouchableOpacity>
                  <Image
                    source={require('../../assets/dropdown.png')}
                    style={[
                      styles.dropdownIcon,
                      { tintColor: theme.textSecondary },
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {couponApplied && (
            <View style={styles.couponBadge}>
              <View style={styles.couponIconContainer}>
                <Text style={styles.couponIcon}>✓</Text>
              </View>
              <Text style={styles.couponText}>
                ₹50 saved! With the applied coupon
              </Text>
            </View>
          )}
        </View>

        {/* CART ITEMS SECTION */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          VINSTA eligible items
        </Text>

        {cartItems.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.cartCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderColor,
              },
            ]}
          >
            {renderVegNonVegIcon(item.isVeg)}

            <View style={styles.itemDetails}>
              <View style={styles.itemHeader}>
                <Text style={[styles.foodName, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text style={styles.eligibleBadge}>✓ Eligible</Text>
              </View>

              <Text
                style={[styles.foodDescription, { color: theme.textSecondary }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.description}
              </Text>

              {/* Cooking requests row only for first item */}
              {index === 0 && (
                <View style={styles.cookingRow}>
                  <TouchableOpacity
                    style={styles.cookingLeft}
                    onPress={openInstructionModal}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={require('../../assets/edit.png')}
                      style={styles.editIcon}
                    />
                    <View>
                      <Text
                        style={[
                          styles.cookingTitle,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Cooking requests
                      </Text>
                      {cookingInstruction.length > 0 && (
                        <Text style={styles.instructionAddedText}>
                          Instruction added
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cutleryButton,
                      cutleryNeeded && styles.cutleryButtonActive,
                    ]}
                    onPress={toggleCutlery}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cutleryButtonContent}>
                      {cutleryNeeded && (
                        <View style={styles.cutleryCheckContainer}>
                          <Text style={styles.cutleryCheck}>✓</Text>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.cutleryText,
                          cutleryNeeded && styles.cutleryTextActive,
                        ]}
                      >
                        Cutlery Needed
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.priceRow}>
                <Text style={[styles.foodPrice, { color: theme.text }]}>
                  ₹{item.price}
                </Text>

                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.id, false)}
                    style={styles.qtyBtn}
                  >
                    <Text style={[styles.qtyText, { color: theme.text }]}>
                      -
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.qtyNumber, { color: theme.text }]}>
                    {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
                  </Text>

                  <TouchableOpacity
                    onPress={() => updateQuantity(item.id, true)}
                    style={styles.qtyBtn}
                  >
                    <Text style={[styles.qtyText, { color: theme.text }]}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => askRemoveItem(item.id, item.name)}
              style={styles.deleteButton}
            >
              <Text style={[styles.deleteText, { color: theme.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* SAVINGS CORNER */}
        <View
          style={[
            styles.savingsCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Text style={[styles.savingsTitle, { color: theme.text }]}>
            SAVINGS CORNER
          </Text>

          {couponApplied ? (
            <View style={styles.couponAppliedRow}>
              <View style={styles.couponAppliedLeft}>
                <View style={styles.couponAppliedIcon}>
                  <Text style={styles.couponAppliedCheck}>✓</Text>
                </View>
                <Text
                  style={[styles.couponAppliedText, { color: theme.text }]}
                >
                  ₹50 saved with VINSTA
                </Text>
              </View>
              <TouchableOpacity onPress={toggleCoupon}>
                <Text style={styles.removeCouponText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.viewCouponsButton}>
              <Text style={styles.viewCouponsText}>View all coupons</Text>
              <Text
                style={[
                  styles.viewCouponsArrow,
                  { color: theme.textSecondary },
                ]}
              >
                ›
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* DELIVERY SECTION */}
        <View
          style={[
            styles.deliveryCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Text style={[styles.deliveryTypeTitle, { color: theme.text }]}>
            Delivery Type
          </Text>

          <View style={styles.deliveryOption}>
            <View style={styles.deliveryOptionLeft}>
              <View style={styles.deliveryIconContainer}>
                <Text style={styles.deliveryIcon}>⚡</Text>
              </View>
              <View>
                <Text style={[styles.deliveryTime, { color: theme.text }]}>
                  15 mins delivery
                </Text>
                <Text
                  style={[styles.deliveryNote, { color: theme.textSecondary }]}
                >
                  on your Bolt® order
                </Text>
              </View>
            </View>
            <Text style={styles.deliveryPrice}>₹{deliveryCharge}</Text>
          </View>

          <TextInput
            placeholder="Instructions"
            placeholderTextColor={theme.textSecondary}
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            style={[
              styles.instructionsInput,
              {
                color: theme.text,
                backgroundColor: theme.background,
                borderColor: theme.borderColor,
              },
            ]}
          />
        </View>

        {/* PRICE BREAKDOWN */}
        <View
          style={[styles.priceCard, { backgroundColor: theme.cardBackground }]}
        >
          <View style={styles.totalHeader}>
            <View>
              <Text style={[styles.toPayLabel, { color: theme.textSecondary }]}>
                To Pay
              </Text>
              <Text style={[styles.toPayAmount, { color: theme.text }]}>
                ₹{total}
              </Text>
              {couponDiscount > 0 && (
                <Text style={styles.savingsText}>
                  ₹{couponDiscount} saved on the total!
                </Text>
              )}
            </View>
            <View style={styles.originalPriceContainer}>
              <Text style={styles.originalPrice}>
                ₹{total + couponDiscount}
              </Text>
            </View>
          </View>

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRowItem}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                Item Total
              </Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                ₹{subtotal}
              </Text>
            </View>
            <View style={styles.priceRowItem}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                Delivery Charge
              </Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                ₹{deliveryCharge}
              </Text>
            </View>
            <View style={styles.priceRowItem}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                Tax & Charges
              </Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                ₹{taxAndCharges}
              </Text>
            </View>
            {couponDiscount > 0 && (
              <View style={styles.priceRowItem}>
                <Text style={[styles.priceLabel, { color: '#27AE60' }]}>
                  Coupon Discount
                </Text>
                <Text style={[styles.priceValue, { color: '#27AE60' }]}>
                  -₹{couponDiscount}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <Text
            style={[styles.cancellationPolicy, { color: theme.textSecondary }]}
          >
            Cancellation policy: Please double-check your order and address
            details. Orders are non-refundable once placed.
          </Text>

          <Text style={[styles.paymentTitle, { color: theme.text }]}>
            PAY USING
          </Text>

          <View style={styles.paymentMethod}>
            <View style={styles.paymentMethodLeft}>
              <Text style={styles.paymentIcon}>▲</Text>
              <Text style={[styles.paymentName, { color: theme.text }]}>
                BHIM
              </Text>
            </View>
            <Text style={styles.offerAvailable}>Offer available</Text>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            disabled={placingOrder || cartItems.length === 0}
            style={[styles.payButton, { backgroundColor: COLORS.primary, opacity: placingOrder || cartItems.length === 0 ? 0.6 : 1 }]}
          >
            {placingOrder ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Pay ₹{total}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL FOR COOKING INSTRUCTION */}
      <Modal
        visible={showInstructionModal}
        transparent
        animationType="slide"
        onRequestClose={closeInstructionModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Add cooking instruction
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.text,
                  borderColor: theme.borderColor,
                  backgroundColor: theme.background,
                },
              ]}
              placeholder="Type your note here"
              placeholderTextColor={theme.textSecondary}
              multiline
              value={tempInstruction}
              onChangeText={setTempInstruction}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={closeInstructionModal}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveInstruction}
                style={styles.modalAddButton}
              >
                <Text style={styles.modalAddText}>Add instruction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelRemoveItem}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.deleteModalContainer,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Text style={[styles.deleteTitle, { color: theme.text }]}>
              Remove item
            </Text>
            <Text
              style={[styles.deleteMessage, { color: theme.textSecondary }]}
            >
              {itemToDelete
                ? `Are you sure you want to remove "${itemToDelete.name}" from the cart?`
                : 'Are you sure you want to remove this item from the cart?'}
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={cancelRemoveItem}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmRemoveItem}
                style={styles.deleteConfirmButton}
              >
                <Text style={styles.deleteConfirmText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.06,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#000',
  },
  headerTitle: {
    fontSize: 18,
    color: '#000',
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },

  restaurantCard: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  homeIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: '#666666',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restaurantAddress: {
    fontSize: 13,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
    flex: 1,
  },
  dropdownIcon: {
    width: 12,
    height: 8,
    marginLeft: 8,
  },
  couponBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  couponIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  couponIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  couponText: {
    color: '#27AE60',
    fontSize: 12,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },

  sectionTitle: {
    fontSize: 14,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },

  cartCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  vegIconContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  nonVegIconContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  vegNonVegIcon: {
    width: 16,
    height: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 14,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
    flex: 1,
    marginRight: 8,
  },
  eligibleBadge: {
    color: '#27AE60',
    fontSize: 11,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  foodDescription: {
    fontSize: 12,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
    marginBottom: 8,
    lineHeight: 16,
  },

  // cooking row
  cookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  editIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: '#666666',
  },
  cookingTitle: {
    fontSize: 12,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
    marginBottom: 2,
  },
  instructionAddedText: {
    fontSize: 11,
    color: '#27AE60',
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },

  cutleryButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  cutleryButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#27AE60',
  },
  cutleryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cutleryCheckContainer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  cutleryCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cutleryText: {
    fontSize: 12,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
    color: '#666666',
  },
  cutleryTextActive: {
    color: '#27AE60',
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: 16,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qtyText: {
    fontSize: 18,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  qtyNumber: {
    marginHorizontal: 12,
    fontSize: 14,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  deleteText: {
    fontSize: 18,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },

  savingsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  savingsTitle: {
    fontSize: 12,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
    letterSpacing: 1,
    marginBottom: 12,
  },
  couponAppliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponAppliedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponAppliedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  couponAppliedCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  couponAppliedText: {
    fontSize: 14,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
  removeCouponText: {
    fontSize: 18,
    color: '#666666',
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },
  viewCouponsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewCouponsText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
  viewCouponsArrow: {
    fontSize: 20,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },

  deliveryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  deliveryTypeTitle: {
    fontSize: 14,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
    marginBottom: 12,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  deliveryOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryIcon: {
    fontSize: 20,
  },
  deliveryTime: {
    fontSize: 14,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
  deliveryNote: {
    fontSize: 11,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
    marginTop: 2,
  },
  deliveryPrice: {
    fontSize: 14,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
    color: COLORS.primary,
  },
  instructionsInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: getFontFamily('Regular'),
    fontWeight: getFontWeight('Regular'),
  },

  priceCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 30,
    borderRadius: 12,
    padding: 16,
  },
  totalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toPayLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
    marginBottom: 4,
  },
  toPayAmount: {
    fontSize: 28,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
    marginBottom: 4,
  },
  savingsText: {
    fontSize: 12,
    color: '#27AE60',
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },
  originalPriceContainer: {
    position: 'relative',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999999',
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
    textDecorationLine: 'line-through',
  },
  priceBreakdown: {
    marginBottom: 16,
  },
  priceRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },
  priceValue: {
    fontSize: 13,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  cancellationPolicy: {
    fontSize: 11,
    fontFamily: getFontFamily('Regular'),
    fontWeight: getFontWeight('Regular'),
    lineHeight: 16,
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 12,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
    letterSpacing: 1,
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  paymentName: {
    fontSize: 14,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
  offerAvailable: {
    fontSize: 11,
    color: '#27AE60',
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  payButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },

  // generic modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
    marginBottom: 12,
  },
  modalInput: {
    minHeight: 80,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#666666',
    fontFamily: getFontFamily('Medium'),
    fontWeight: getFontWeight('Medium'),
  },
  modalAddButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  modalAddText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },

  // delete confirmation modal extra styles
  deleteModalContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
  },
  deleteTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 13,
    fontFamily: getFontFamily('Regular'),
    fontWeight: getFontWeight('Regular'),
    marginBottom: 16,
    lineHeight: 18,
  },
  deleteConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor:COLORS.primary,
  },
  deleteConfirmText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: getFontFamily('SemiBold'),
    fontWeight: getFontWeight('SemiBold'),
  },
});





// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Dimensions,
//   StatusBar,
//   TextInput,
//   Platform,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useContext } from 'react';
// import { ThemeContext } from '../../theme/ThemeContext';

// import { COLORS } from '../../theme/colors';
// import { getFontFamily, getFontWeight } from '../../utils/fontHelper';

// const { width, height } = Dimensions.get('window');

// const CartScreen = () => {
//   const navigation = useNavigation<any>();
//   const { theme } = useContext(ThemeContext);
//   const isDarkMode = theme.mode === "dark";
//   const [cartItems, setCartItems] = useState([
//     {
//       id: 1,
//       name: 'Cheese Burger',
//       subtext: 'Bistro Excellence',
//       price: 100,
//       quantity: 2,
//       img: require('../../assets/b1.png'),
//     },
//     {
//       id: 2,
//       name: 'Cheese Burger',
//       subtext: 'Bistro Excellence',
//       price: 100,
//       quantity: 2,
//       img: require('../../assets/b2.png'),
//     },
//   ]);

//   const [selectedAddress, setSelectedAddress] = useState({
//     label: 'Home',
//     address:
//       '320 Koregaon park lane to, 4 opposite to B.M.W. showroom, Indore M.P.',
//   });

//   const updateQuantity = (id: number, increase: boolean) => {
//     setCartItems(prev =>
//       prev.map(item =>
//         item.id === id
//           ? {
//             ...item,
//             quantity: increase
//               ? item.quantity + 1
//               : Math.max(1, item.quantity - 1),
//           }
//           : item,
//       ),
//     );
//   };

//   const removeItem = (id: number) => {
//     setCartItems(prev => prev.filter(item => item.id !== id));
//   };

//   const subtotal = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0,
//   );
//   const productPrice = 200;
//   const totalTax = 50;
//   const deliveryCharge = 50;
//   const total = productPrice + totalTax + deliveryCharge;

//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: theme.background },
//       ]}
//     >
//       <StatusBar
//         barStyle={theme.cardBackground === 'dark' ? 'light-content' : 'dark-content'}
//         translucent
//         backgroundColor="transparent"
//       />

//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Image
//             source={require('../../assets/back.png')}
//             style={[
//               styles.backIcon,
//               { tintColor: theme.text }, // theme.text will be white in dark, black in light
//             ]}
//           />
//         </TouchableOpacity>
//         <Text
//           style={[
//             styles.headerTitle,
//             { color: theme.text }, // auto white in dark, black in light
//           ]}
//         >
//           My Cart
//         </Text>

//         <View style={{ width: 20 }} />
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 160 }}
//       >
//         {/* CART ITEMS */}
//         {cartItems.map(item => (
//           <View
//             key={item.id}
//             style={[
//               styles.cartCard,
//               {
//                 backgroundColor: theme.background,
//                 borderColor: theme.borderColor,
//                 borderWidth: 1,   // REQUIRED
//               },
//             ]}
//           >

//             <Image source={item.img} style={styles.foodImg} />

//             <View style={{ flex: 1, marginHorizontal: 10 }}>
//               <Text
//                 style={[
//                   styles.foodName,
//                   { color: theme.text },   // auto white in dark, black in light
//                 ]}
//               >
//                 {item.name}
//               </Text>

//               <Text style={styles.foodSub}>{item.subtext}</Text>
//               <Text
//                 style={[
//                   styles.foodPrice,
//                   { color: theme.text },  // auto white in dark, black in light
//                 ]}
//               >
//                 ₹ {item.price.toFixed(2)}
//               </Text>

//               <View style={styles.qtyContainer}>
//                 <TouchableOpacity
//                   onPress={() => updateQuantity(item.id, false)}
//                   style={[
//                     styles.qtyBtn,
//                     {
//                       backgroundColor: '#fff',
//                       borderWidth: 1,
//                       borderColor: COLORS.primary,
//                     },
//                   ]}
//                 >
//                   <Text style={[styles.qtyText, { color: COLORS.primary }]}>-</Text>
//                 </TouchableOpacity>

//                 <Text
//                   style={[
//                     styles.qtyNumber,
//                     { color: theme.text }, // white in dark mode, black in light mode
//                   ]}
//                 >
//                   {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
//                 </Text>

//                 <TouchableOpacity
//                   onPress={() => updateQuantity(item.id, true)}
//                   style={[
//                     styles.qtyBtn,
//                     {
//                       backgroundColor: '#fff',
//                       borderWidth: 1,
//                       borderColor: COLORS.primary,
//                     },
//                   ]}
//                 >
//                   <Text style={[styles.qtyText, { color: COLORS.primary }]}>+</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <TouchableOpacity onPress={() => removeItem(item.id)}>
//               <Image
//                 source={require('../../assets/delete.png')}
//                 style={styles.deleteIcon}
//               />
//             </TouchableOpacity>
//           </View>
//         ))}

//         {/* DELIVERY SECTION */}
//         <View
//           style={[
//             styles.deliveryCard,
//             {
//               backgroundColor: theme.background,
//               borderColor: theme.borderColor,
//               borderWidth: 1,
//             },
//           ]}
//         >

//           <View style={styles.deliveryHeader}>
//             <Image
//               source={require('../../assets/location.png')}
//               style={styles.locationIcon}
//             />
//             <Text style={styles.deliveryTitle}>Delivery to.</Text>
//             <TouchableOpacity
//               onPress={() =>
//                 navigation.navigate('ChangeLocation', {
//                   onSelectAddress: (address: any) =>
//                     setSelectedAddress(address),
//                 })
//               }
//               style={styles.changeButton}
//             >
//               <Text style={styles.changeText}>Change</Text>
//             </TouchableOpacity>
//           </View>

//           <Text style={styles.addressText}>* {selectedAddress.address}</Text>

//           {/* PRICING */}
//           <View style={{ marginTop: 15 }}>
//             <View style={styles.priceRow}>
//               <Text style={[styles.priceLabel, { color: theme.text }]}>
//                 Product price
//               </Text>
//               <Text style={[styles.priceValue, { color: theme.text }]}>
//                 ₹ {productPrice.toFixed(2)}
//               </Text>
//             </View>
//             <View style={styles.priceRow}>
//               <Text style={[styles.priceLabel, { color: theme.text }]}>
//                 Total Tax
//               </Text>
//               <Text style={[styles.priceValue, { color: theme.text }]}>
//                 ₹ {totalTax.toFixed(2)}
//               </Text>
//             </View>
//             <View style={styles.priceRow}>
//               <Text style={[styles.priceLabel, { color: theme.text }]}>
//                 Delivery Charge's
//               </Text>
//               <Text style={[styles.priceValue, { color: theme.text }]}>
//                 ₹ {deliveryCharge.toFixed(2)}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.divider} />

//           <View style={styles.priceRow}>
//             <Text style={[styles.subtotalLabel, { color: theme.text }]}>
//               Subtotal
//             </Text>

//             <Text style={styles.subtotalValue}>₹ {total.toFixed(2)}</Text>
//           </View>

//           <TextInput
//             placeholder="Promo code or voucher"
//             placeholderTextColor={theme.textSecondary}
//             style={[
//               styles.input,
//               {
//                 color: theme.text,
//                 backgroundColor: theme.card,
//                 borderColor: theme.borderColor,
//                 borderWidth: 1,
//               },
//             ]}
//           />

//           <TouchableOpacity
//             style={[
//               styles.couponBtn,
//               {
//                 backgroundColor: theme.mode === 'dark' ? '#555555' : theme.primary, // grey in dark, orange in light
//                 borderColor: theme.borderColor,
//                 borderWidth: 1,
//               },
//             ]}
//           >
//             <Text
//               style={[
//                 styles.couponText,
//                 { color: theme.text }, // text white in both modes
//               ]}
//             >
//               Apply Coupon Code
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => navigation.navigate('Payment')}
//             style={styles.checkoutBtn}
//           >
//             <Text style={styles.checkoutText}>Check-out</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default CartScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff'
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingTop: height * 0.06,
//     paddingBottom: 10,
//     paddingHorizontal: 20,
//   },
//   backIcon: {
//     width: 22,
//     height: 22,
//     tintColor: '#000'
//   },
//   headerTitle: {
//     fontSize: 18,
//     color: '#000',
//     fontFamily: getFontFamily('Bold'),
//     fontWeight: getFontWeight('Bold'),
//   },

//   cartCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     marginHorizontal: 20,
//     marginTop: 12,
//     borderRadius: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 2 },
//     padding: 12,
//   },
//   foodImg: {
//     width: 80,
//     height: 80,
//     borderRadius: 10,
//     resizeMode: 'cover'
//   },
//   foodName: {
//     fontSize: 18,
//     color: '#000',
//     fontFamily: getFontFamily('Bold'),
//     fontWeight: getFontWeight('Bold'),
//   },
//   foodSub: {
//     fontSize: 13,
//     color: '#777',
//     marginBottom: 5,
//     fontFamily: getFontFamily('SemiBold'),
//     fontWeight: getFontWeight('SemiBold'),
//   },
//   foodPrice: {
//     fontSize: 15,
//     color: '#000',
//     fontFamily: getFontFamily('Bold'),
//     fontWeight: getFontWeight('Bold'),
//   },
//   qtyContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6,
//   },
//   qtyBtn: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   qtyText: {
//     fontSize: 16,
//     textAlign: 'center',
//     textAlignVertical: 'center',
//     fontFamily: getFontFamily('Bold'),
//     fontWeight: getFontWeight('Bold'),
//   },
//   qtyNumber: {
//     marginHorizontal: 10,
//     fontSize: 14,
//     color: '#000',
//     fontFamily: getFontFamily('SemiBold'),
//     fontWeight: getFontWeight('SemiBold'),
//   },
//   deleteIcon: {
//     width: 20,
//     height: 20,
//     tintColor: '#FF6B6B'
//   },

//   deliveryCard: {
//     backgroundColor: '#fff',
//     marginTop: 10,
//     marginHorizontal: 20,
//     borderRadius: 16,
//     padding: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   deliveryHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//   },
//   locationIcon: {
//     width: 18,
//     height: 18,
//     tintColor: COLORS.primary,
//     marginRight: 6,
//   },
//   deliveryTitle: {
//     fontSize: 15,
//     color: COLORS.primary,
//     flex: 1,
//     fontFamily: getFontFamily('Bold'),
//     fontWeight: getFontWeight('Bold'),
//   },
//   changeButton: {
//     marginLeft: 'auto',
//   },
//   changeText: {
//     color: COLORS.primary,
//     fontSize: 14,
//     fontFamily: getFontFamily('Bold'),
//     fontWeight: getFontWeight('Bold'),
//   },
//   addressText: {
//     fontSize: 13,
//     color: '#555',
//     marginTop: 4,
//     lineHeight: 18,
//     fontFamily: getFontFamily('Medium'),
//     fontWeight: getFontWeight('Medium'),
//   },

//   priceRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   priceLabel: {
//     fontSize: 14,
//     color: '#000',
//     fontFamily: getFontFamily('SemiBold'),
//     fontWeight: getFontWeight('SemiBold'),
//   },
//   priceValue: {
//     fontSize: 14,
//     color: '#000',
//     fontFamily: getFontFamily('SemiBold'),
//     fontWeight: getFontWeight('SemiBold'),
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E0E0E0',
//     marginVertical: 10
//   },

//   subtotalLabel: {
//     fontSize: 16,
//     color: '#000',
//     fontFamily: getFontFamily('Bold'),
//     fontWeight: getFontWeight('Bold'),
//   },
//   subtotalValue: {
//     fontSize: 16,
//     color: COLORS.primary,
//     fontFamily: getFontFamily('Bold'),
//     fontWeight: getFontWeight('Bold'),
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     fontSize: 14,
//     marginTop: 10,
//     color: '#000',
//     fontFamily: getFontFamily('Regular'),
//     fontWeight: getFontWeight('Regular'),
//   },
//   couponBtn: {
//     marginTop: 10,
//     backgroundColor: '#FFF3E0',
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   couponText: {
//     color: COLORS.primary,
//     textAlign: 'center',
//     fontSize: 14,
//     fontFamily: getFontFamily('SemiBold'),
//     fontWeight: getFontWeight('SemiBold'),
//   },
//   checkoutBtn: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 10,
//     paddingVertical: 14,
//     marginTop: 14,
//   },
//   checkoutText: {
//     color: '#fff',
//     textAlign: 'center',
//     fontSize: 16,
//     fontFamily: getFontFamily('Bold'),
//     fontWeight: getFontWeight('Bold'),
//   },
// });
