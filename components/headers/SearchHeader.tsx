import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Pressable, Text, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSearch } from '@/context/search';
import { router } from 'expo-router';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  activeTab: 'games' | 'users';
  onTabChange: (tab: 'games' | 'users') => void;
  onSearch: () => void;
  onClear: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export default function SearchHeader({
  searchQuery,
  onSearchQueryChange,
  activeTab,
  onTabChange,
  onSearch,
  onClear,
  onCancel,
  showCancelButton = true,
}: SearchHeaderProps) {
  const { handleSearch: contextHandleSearch, searchInputRef } = useSearch();

  const handleSearch = () => {
    contextHandleSearch();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.searchBarRow}>
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color={Colors.color5 + 'AA'} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor={Colors.color5 + '80'}
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={Colors.color5 + 'AA'} />
              </TouchableOpacity>
            )}
          </View>
          {showCancelButton && (
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.tabsRow}>
          <Pressable
            style={[styles.tab, activeTab === 'games' && styles.activeTab]}
            onPress={() => onTabChange('games')}
          >
            <Text style={[styles.tabText, activeTab === 'games' && styles.activeTabText]}>Games</Text>
            {activeTab === 'games' && <View style={styles.tabUnderline} />}
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => onTabChange('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
            {activeTab === 'users' && <View style={styles.tabUnderline} />}
          </Pressable>
        </View>
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
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.color3,
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: Colors.color5,
    fontSize: 17,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  clearButton: {
    marginLeft: 4,
  },
  cancelButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  cancelText: {
    color: Colors.color5,
    fontSize: 17,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.color4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.color5 + '20',
    marginBottom: 4,
    marginHorizontal: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.color5 + '80',
  },
  activeTabText: {
    color: Colors.color5,
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -2,
    height: 3,
    backgroundColor: Colors.color2,
    borderRadius: 2,
  },
}); 