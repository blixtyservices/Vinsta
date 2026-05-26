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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFontFamily, getFontWeight } from '../../../utils/fontHelper';
import MyOrdersTab from './MyOrdersTab';
import MySubscription from './MySubscription';
import RatingModal from './RatingModal';
import { ThemeContext } from '../../../theme/ThemeContext';
import { ordersAPI, subscriptionAPI } from '../../../services/api';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#E67E22',
};

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];
const FALLBACK_IMG = require('../../../assets/poha.png');

const mapOrder = (o: any) => ({
  id: `#${o._id?.slice(-6).toUpperCase() || '------'}`,
  _id: o._id,
  title: o.restaurant?.name || o.items?.[0]?.name || 'Order',
  price: o.totalAmount || 0,
  date: o.createdAt
    ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '--',
  items: `${o.items?.length || 1} Item${(o.items?.length || 1) > 1 ? 's' : ''}`,
  status: o.status || 'pending',
  time: o.estimatedDeliveryTime || '25 min',
  img: o.restaurant?.imageUrl ? { uri: o.restaurant.imageUrl } : FALLBACK_IMG,
});

const mapSub = (s: any, isActive: boolean, theme: any) => ({
  id: s._id,
  title: s.planId?.name || 'Subscription Plan',
  restaurant: s.restaurantId?.name || 'Restaurant',
  price: `₹${s.planId?.price || 0} / ${s.planId?.duration || 'week'}`,
  duration: s.startDate && s.endDate
    ? `${new Date(s.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${new Date(s.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : '--',
  daysLeft: isActive && s.endDate
    ? `${Math.max(0, Math.ceil((new Date(s.endDate).getTime() - Date.now()) / 86400000))} Day's left`
    : "0 Day's left",
  img: FALLBACK_IMG,
  tintColor: theme.text,
});

const MyOrders = () => {
  const navigation = useNavigation<any>();
  const { theme } = useContext(ThemeContext);

  const [mainTab, setMainTab] = useState<'Orders' | 'Subscription'>('Orders');
  const [orderTab, setOrderTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [subTab, setSubTab] = useState<'Active' | 'Previous'>('Active');
  const [ratingModal, setRatingModal] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);

  const [upcomingOrders, setUpcomingOrders] = useState<any[]>([]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [activeSubs, setActiveSubs] = useState<any[]>([]);
  const [previousSubs, setPreviousSubs] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await ordersAPI.getAll();
        const all = res.orders || [];
        setUpcomingOrders(
          all.filter((o: any) => ACTIVE_STATUSES.includes(o.status)).map(mapOrder)
        );
        setPastOrders(
          all.filter((o: any) => !ACTIVE_STATUSES.includes(o.status)).map(mapOrder)
        );
      } catch {}

      try {
        const subRes = await subscriptionAPI.getMine();
        const allSubs = subRes.subscriptions || [];
        setActiveSubs(
          allSubs.filter((s: any) => s.status === 'active').map((s: any) => mapSub(s, true, theme))
        );
        setPreviousSubs(
          allSubs.filter((s: any) => s.status !== 'active').map((s: any) => mapSub(s, false, theme))
        );
      } catch {}

      setLoading(false);
    };
    loadOrders();
  }, []);

  const handleStarPress = (index: number) => setSelectedStars(index);
  const handleSubmitReview = () => {
    setRatingModal(false);
    setSelectedStars(0);
    setReviewText('');
  };

  const navigateToOrderDetail = (order: any) => {
    navigation.navigate('OrderDetail', {
      orderId: order.id,
      orderTitle: order.title,
      orderPrice: order.price,
      orderDate: order.date,
      orderItems: order.items,
      orderStatus: order.status,
      orderImage: order.img,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>  {/* ✅ DARK BG */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}   // ✅ DARK STATUS BAR
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../../assets/back.png')}
            style={[styles.backIcon, { tintColor: theme.text }]}    // ✅ DARK ICON
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>

        <View style={{ width: 25 }} />
      </View>

      {/* MAIN TABS */}
      <View style={styles.mainTabs}>
        <TouchableOpacity style={styles.mainTab} onPress={() => setMainTab('Orders')}>
          <Text
            style={[
              styles.mainTabText,
              { color: mainTab === 'Orders' ? COLORS.primary : theme.text },
              // ✅ DARK TEXT
            ]}
          >
            My Order's
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainTab} onPress={() => setMainTab('Subscription')}>
          <Text
            style={[
              styles.mainTabText,
              { color: mainTab === 'Subscription' ? COLORS.primary : theme.text },
            ]}
          >
            My Subscription's
          </Text>
        </TouchableOpacity>
      </View>

      {/* SLIDER */}
      <View style={[styles.slider, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.sliderIndicator,
            {
              left: mainTab === 'Orders' ? 0 : width / 2,
              backgroundColor: COLORS.primary,
            },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {mainTab === 'Orders' ? (
          <MyOrdersTab
            orderTab={orderTab}
            setOrderTab={setOrderTab}
            upcomingOrders={upcomingOrders}
            pastOrders={pastOrders}
            navigation={navigation}
            navigateToOrderDetail={navigateToOrderDetail}
            setRatingModal={setRatingModal}
          />
        ) : (
          <MySubscription
            subTab={subTab}
            setSubTab={setSubTab}
            activeSubs={activeSubs}
            previousSubs={previousSubs}
            setRatingModal={setRatingModal}
          />
        )}
      </ScrollView>

      <RatingModal
        visible={ratingModal}
        onClose={() => setRatingModal(false)}
        selectedStars={selectedStars}
        onStarPress={handleStarPress}
        reviewText={reviewText}
        setReviewText={setReviewText}
        onSubmit={handleSubmitReview}
      />
    </View>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.07,
    paddingHorizontal: 20,
  },

  backIcon: { width: 22, height: 22 },

  headerTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },

  mainTab: { flex: 1 },

  mainTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },

  mainTabText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: getFontFamily('Bold'),
    fontWeight: getFontWeight('Bold'),
  },

  slider: {
    height: 3,
    width: '100%',
    marginTop: 10,
  },

  sliderIndicator: {
    position: 'absolute',
    top: 0,
    width: width / 2,
    height: 3,
  },
});
