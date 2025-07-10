import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function IndexSearchHeader() {
  const handleSearchBarPress = () => {
    router.push('/(tabs)/(search)/search-screen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.searchBarContainer} 
          onPress={handleSearchBarPress}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color={Colors.color5 + 'AA'} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search...</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.color4,
  },
  header: {
    backgroundColor: Colors.color4,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.color3,
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    color: Colors.color5 + '80',
    fontSize: 17,
  },
}); 