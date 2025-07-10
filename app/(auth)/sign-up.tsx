import React from 'react'
import { Alert, StyleSheet, View, Text } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { useState } from 'react'
import { router } from 'expo-router'
import { useAuth } from '@/context/auth'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const { register, loading, error } = useAuth()

  const handleSignUp = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await register(name, email, password, passwordConfirmation);
      // Only navigate on successful registration
      router.replace('/(tabs)');
    } catch (e: any) {
      // Show more detailed error information
      const errorMessage = e.response?.data?.message || e.message || 'Registration failed';
      Alert.alert('Registration Error', errorMessage);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Name"
          leftIcon={{ type: 'font-awesome', name: 'user' }}
          onChangeText={(text) => setName(text)}
          value={name}
          placeholder="Your name"
          autoCapitalize={'words'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Confirm Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPasswordConfirmation(text)}
          value={passwordConfirmation}
          secureTextEntry={true}
          placeholder="Confirm password"
          autoCapitalize={'none'}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button 
          title="Sign up" 
          disabled={loading} 
          onPress={handleSignUp} 
          loading={loading}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button 
          title="Back to Sign In" 
          type="outline"
          onPress={() => router.back()} 
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
}) 