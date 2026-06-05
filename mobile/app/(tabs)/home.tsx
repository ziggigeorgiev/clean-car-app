import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '@/constants/colors';
import { CleanCarAPI } from '@/services/CleanCarApi';
import { Device } from '@/services/Device';
import { useTranslation } from '@/services/i18n';
import { formatDateTime } from '@/services/DateFormat';
import Price from '@/components/Price';

type Service = {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  is_active: boolean;
};

type Order = {
  id: number;
  status: string;
  plate_number?: string;
  availability?: { time: string };
  services: { name: string; price: number; currency: string }[];
};

const HomeScreen = () => {
  const { t, tService } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const phoneIdentifier = await Device.getPhoneIdentifier();
          const [servicesData, ordersData] = await Promise.all([
            CleanCarAPI.getServices(),
            phoneIdentifier
              ? CleanCarAPI.getOrdersByPhoneIdentifier(phoneIdentifier)
              : Promise.resolve([]),
          ]);
          if (cancelled) return;
          const activeBasic = (servicesData || [])
            .filter((s: Service) => s.is_active)
            .sort((a: Service, b: Service) => a.id - b.id);
          setServices(activeBasic);
          setLastOrder(Array.isArray(ordersData) && ordersData.length > 0 ? ordersData[0] : null);
        } catch (e) {
          console.warn('home fetch failed', e);
        }
      })();
      return () => { cancelled = true; };
    }, []),
  );

  const startBooking = () => router.push('/location');
  const openOrder = (orderId: number) => router.push(`/order/${orderId}`);
  const goToSettings = () => router.push('/settings');

  const computeOrderTotal = (o: Order) =>
    (o.services || []).reduce((sum, s) => sum + (s.price || 0), 0);

  const orderCurrency = (o: Order) => (o.services?.[0]?.currency || 'EUR');

  // Matches the badge style used in the orders tab (OrderCard.tsx)
  const statusBadge = (status: string) => {
    const isCompleted = status === 'completed';
    const isCancelled = status === 'cancelled';
    return (
      <View
        style={[
          styles.statusBadge,
          isCompleted
            ? styles.completedBadge
            : isCancelled
            ? styles.cancelledBadge
            : styles.openBadge,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            isCompleted
              ? styles.completedText
              : isCancelled
              ? styles.cancelledText
              : styles.openText,
          ]}
        >
          {status}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            source={require('@/assets/images/cleen-logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>{t('home.title')}</Text>
        </View>
      </View>

      {/* Hero promo card */}
      <View style={styles.heroCard}>
        <Image
          source={require('@/assets/images/hero-interior.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        {/* Horizontal gradient: strong tint on the left (under the text),
            fading to transparent on the right (so the photo shows through). */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,1)',
            'rgba(255,255,255,0.95)',
            'rgba(255,255,255,0.7)',
            'rgba(255,255,255,0)',
          ]}
          locations={[0, 0.55, 0.8, 1]}
          start={{ x: 0, y: 0.35 }}
          end={{ x: 1, y: 0.35 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroText}>{t('home.hero_offer')}</Text>
          <TouchableOpacity style={styles.heroButton} onPress={startBooking} activeOpacity={0.85}>
            <Text style={styles.heroButtonText}>{t('home.book_now')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent booking */}
      <Text style={styles.sectionTitle}>{t('home.recent')}</Text>
      {lastOrder ? (
        <TouchableOpacity
          style={styles.recentCard}
          onPress={() => openOrder(lastOrder.id)}
          activeOpacity={0.85}
        >
          <View style={styles.recentRow}>
            <Text style={styles.recentLabel}>
              {t('home.your_last_booking')}:{' '}
              <Text style={styles.recentValue}>
                {formatDateTime(lastOrder.availability?.time)}
              </Text>
            </Text>
            {statusBadge(lastOrder.status)}
          </View>
          <View style={styles.recentDivider} />
          <View style={styles.recentRow}>
            <Text style={styles.recentLabel}>
              {(lastOrder.services || [])
                .map((s: any) => tService(s, 'name'))
                .join(', ') || lastOrder.plate_number || ''}
            </Text>
            <Price
              price={computeOrderTotal(lastOrder)}
              currency={orderCurrency(lastOrder)}
              dollarStyle={{ fontSize: 18, color: COLORS.text }}
              centStyle={{ fontSize: 11, color: COLORS.text }}
              currencyStyle={{ fontSize: 14, color: COLORS.text }}
            />
          </View>
        </TouchableOpacity>
      ) : (
        <Text style={styles.emptyText}>{t('home.no_recent')}</Text>
      )}

      {/* Services — flat list separated by dividers, like the policy list */}
      <Text style={styles.sectionTitle}>{t('home.our_services')}</Text>
      <View style={styles.servicesContainer}>
        {services.map((service, idx) => (
          <View
            key={service.id}
            style={[
              styles.serviceRow,
              idx === services.length - 1 && styles.serviceRowLast,
            ]}
          >
            <Text style={styles.serviceNumber}>{String(idx + 1).padStart(2, '0')}</Text>
            <View style={styles.serviceIconWrap}>
              <MaterialCommunityIcons
                name={
                  /interior|innen|seat/i.test(service.name)
                    ? 'car-seat'
                    : /detail|full|premium/i.test(service.name)
                    ? 'shimmer'
                    : 'car-wash'
                }
                size={20}
                color={COLORS.white}
              />
            </View>
            <View style={styles.serviceTextWrap}>
              <Text style={styles.serviceName} numberOfLines={2}>
                {tService(service, 'name')}
              </Text>
              {tService(service, 'description') ? (
                <Text style={styles.serviceDesc} numberOfLines={1}>
                  {tService(service, 'description')}
                </Text>
              ) : null}
            </View>
            <Price
              price={service.price}
              currency={service.currency}
              dollarStyle={{ fontSize: 18, color: COLORS.text }}
              centStyle={{ fontSize: 11, color: COLORS.text }}
              currencyStyle={{ fontSize: 14, color: COLORS.text }}
            />
          </View>
        ))}
      </View>
      <View style={{ height: 16 }} />
    </ScrollView>
  );
};

const HERO_BG = '#DBF1F2';
const SOFT_BG = '#EAF6F6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 44,
    height: 32,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  heroCard: {
    borderRadius: 22,
    marginBottom: 24,
    overflow: 'hidden',
    minHeight: 200,
    backgroundColor: HERO_BG,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroContent: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 200,
  },
  heroText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 16,
    maxWidth: '70%',
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 6,
  },
  recentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  recentLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
  },
  recentValue: {
    color: COLORS.text,
    fontWeight: '600',
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  recentDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  // Matches the badge styling in components/OrderCard.tsx
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  openBadge: {
    backgroundColor: '#C8DEFC',
  },
  completedBadge: {
    backgroundColor: '#E6FFE6',
  },
  cancelledBadge: {
    backgroundColor: '#FBE9EA',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  openText: {
    color: COLORS.primary,
  },
  completedText: {
    color: '#28A745',
  },
  cancelledText: {
    color: '#D9534F',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  servicesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  serviceRowLast: {
    borderBottomWidth: 0,
  },
  serviceNumber: {
    width: 28,
    fontSize: 13,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  serviceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceTextWrap: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  serviceDesc: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textLight,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 8,
  },
  currencyMark: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 2,
    marginTop: 2,
  },
});

export default HomeScreen;
