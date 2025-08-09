import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { CONTENT } from '@/constants/content';
import { addToWaitlist, checkEmailExists, testConnection } from '@/constants/supabase';

const { width } = Dimensions.get('window');

export function WaitlistForm() {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Test connection on component mount
  React.useEffect(() => {
    testConnection().then(result => {
      if (result.success) {
        console.log('✅ Supabase connection successful');
      } else {
        console.error('❌ Supabase connection failed:', result.error);
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email.trim().toLowerCase());
      
      if (emailExists) {
        Alert.alert(
          'Already Registered', 
          'This email is already on our waitlist! We\'ll be in touch soon.'
        );
        setEmail('');
        return;
      }

      // Add to Supabase waitlist
      const result = await addToWaitlist(email.trim().toLowerCase());
      
      if (result.success) {
        Alert.alert(
          'Success!', 
          'Thanks for joining our waitlist! We\'ll be in touch soon.',
          [{ text: 'OK', onPress: () => setEmail('') }]
        );
      } else {
        console.error('Supabase error:', result.error);
        Alert.alert(
          'Error', 
          result.error || 'Something went wrong. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.formTitle}>{CONTENT.waitlist.title}</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder={CONTENT.waitlist.placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          testID="email-input"
        />
        
        <TouchableOpacity
          style={[
            styles.button,
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          testID="submit-button"
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? CONTENT.waitlist.submitting : CONTENT.waitlist.buttonText}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.disclaimer}>{CONTENT.waitlist.disclaimer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: width > 768 ? 400 : width - 48,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    flexDirection: Platform.OS === 'web' && width > 500 ? 'row' : 'column',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: Platform.OS === 'web' && width > 500 ? 1 : undefined,
    height: 52,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  button: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minWidth: Platform.OS === 'web' && width > 500 ? 140 : undefined,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.background,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});