import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter, useSegments } from 'expo-router';
import { Octicons } from '@expo/vector-icons';
import { useInventoryStore } from '@/store/inventoryStore';

interface InventoryHeaderProps {
  showBackButton?: boolean;
}

export default function InventoryHeader({ 
  showBackButton = false 
}: InventoryHeaderProps) {
  const router = useRouter();
  const { selectedIndex, setSelectedIndex } = useInventoryStore();
  const segments = ['Collection', 'Wishlist', 'Lists', 'Stats'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Standard Header Row */}
        <View style={styles.headerRow}>
          {/* Left (Back Button) */}
          <View style={styles.headerLeft}>
            {showBackButton && (
              <TouchableOpacity onPress={() => router.back()}>
                <Octicons name="chevron-left" size={24} color={Colors.color5} />
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <View style={styles.headerTitle}>
            <Text style={styles.titleText}>Inventory</Text>
          </View>

          {/* Right Button */}
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => console.log('Right button pressed')}>
              <Octicons name="filter" size={20} color={Colors.color5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          {segments.map((segment, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.segment,
                selectedIndex === index && styles.selectedSegment,
              ]}
              onPress={() => setSelectedIndex(index)}
            >
              <Text 
                style={[
                  styles.segmentText,
                  selectedIndex === index && styles.selectedSegmentText
                ]}
              >
                {segment}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.color1,
  },
  container: {
    backgroundColor: Colors.color1,
  },
  headerRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeft: {
    width: 60,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.color5,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.color3,
    margin: 8,
    borderRadius: 8,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
  },
  selectedSegment: {
    backgroundColor: Colors.color1,
    borderRadius: 6,
  },
  segmentText: {
    color: Colors.color5 + '80',
    fontSize: 13,
    fontWeight: '500',
  },
  selectedSegmentText: {
    color: Colors.color5,
  },
}); 