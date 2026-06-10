import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS } from "../constants/colors";
import { BRAND_ASSETS } from "../constants/brandAssets";
import { useTranslation } from "../services/i18n";

type Props = {
  title?: string;
  message?: string;
};

export default function NoResultsFound({ title, message }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyState}>
      <View style={styles.logoStack}>
        <Image
          source={BRAND_ASSETS.logo}
          style={styles.cleenLogo}
          resizeMode="contain"
        />
        <Image
          source={BRAND_ASSETS.wordmark}
          style={styles.grimeLogo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.emptyTitle}>{title ?? t('empty.no_orders_title')}</Text>
      <Text style={styles.emptyDescription}>
        {message ?? t('empty.no_orders')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  logoStack: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cleenLogo: {
    width: 110,
    height: 110,
  },
  grimeLogo: {
    width: 130,
    height: 38,
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});
