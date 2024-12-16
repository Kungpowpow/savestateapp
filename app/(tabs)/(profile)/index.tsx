import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/auth';
import { Button } from '@rneui/themed';

export default function Profile() {
  const { session, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/(auth)/login');
    }
  }, [session]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Email: {session.user.email}</Text>
      <Text style={styles.text}>User ID: {session.user.id}</Text>
      <Button
        title="Sign Out"
        onPress={handleSignOut}
        containerStyle={styles.buttonContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
