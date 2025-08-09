import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WaitlistForm } from '@/components/WaitlistForm';
import { FeatureCard } from '@/components/FeatureCard';
import { CONTENT } from '@/constants/content';
import { COLORS } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const heroFadeAnim = useRef(new Animated.Value(0)).current;
  const heroSlideAnim = useRef(new Animated.Value(30)).current;
  const featuresFadeAnim = useRef(new Animated.Value(0)).current;
  const featuresSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Hero animation
    Animated.parallel([
      Animated.timing(heroFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(heroSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Features animation with delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(featuresFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(featuresSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);
  }, [heroFadeAnim, heroSlideAnim, featuresFadeAnim, featuresSlideAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: heroFadeAnim,
              transform: [{ translateY: heroSlideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>{CONTENT.logo}</Text>
          </View>
          
          <Text style={styles.tagline}>{CONTENT.tagline}</Text>
          <Text style={styles.description}>{CONTENT.description}</Text>
          
          <WaitlistForm />
        </Animated.View>

        {/* Features Section */}
        <Animated.View 
          style={[
            styles.featuresSection,
            {
              opacity: featuresFadeAnim,
              transform: [{ translateY: featuresSlideAnim }],
            },
          ]}
        >
          <Text style={styles.featuresTitle}>{CONTENT.featuresTitle}</Text>
          <View style={styles.featuresGrid}>
            {CONTENT.features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{CONTENT.footer.copyright}</Text>
          <Text style={styles.footerText}>{CONTENT.footer.madeWith}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? 500 : undefined,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: COLORS.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
    maxWidth: width > 768 ? 600 : width - 48,
  },
  description: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    maxWidth: width > 768 ? 500 : width - 48,
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
});