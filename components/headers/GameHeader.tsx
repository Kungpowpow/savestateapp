import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter, useSegments } from 'expo-router';
import { Octicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GameHeaderProps {
  title: string;
  id: number;
  first_release_date: number | undefined;
  scrollY: Animated.Value;
}

export default function GameHeader({ title, id, first_release_date, scrollY }: GameHeaderProps) {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  
  // Calculate header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Calculate icon background opacity (inverse of header opacity)
  const iconBgOpacity = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  const handleMorePress = () => {
    // Get the current segment (trending, inventory, search, activity, or profile)
    const currentSegment = segments.find(segment => 
      ['(trending)', '(inventory)', '(search)', '(activity)', '(profile)'].includes(segment)
    );
    
    if (currentSegment) {
      router.push({
        pathname: `/(tabs)/${currentSegment}/(game)/more` as any,
        params: { 
          title: title,
          first_release_date: first_release_date,
          id: id
        }
      });
    } else {
      // Fallback to trending if no valid segment found
      router.push({
        pathname: '/(tabs)/(trending)/(game)/more',
        params: { 
          title: title,
          first_release_date: first_release_date,
          id: id
        }
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Solid background header */}
      <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
      
      {/* Header content */}
      <View style={styles.content}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.iconButton}
        >
          <Animated.View 
            style={[
              styles.iconBackground, 
              { opacity: iconBgOpacity }
            ]} 
          />
          <Octicons style={{ marginTop: 1, marginRight: 1 }} name="chevron-left" size={24} color={Colors.color5} />
        </TouchableOpacity>

        <Animated.Text 
          style={[styles.title, { opacity: headerOpacity }]} 
          numberOfLines={1}
        >
          {title}
        </Animated.Text>

        <TouchableOpacity 
          onPress={handleMorePress}
          style={styles.iconButton}
        >
          <Animated.View 
            style={[
              styles.iconBackground, 
              { opacity: iconBgOpacity }
            ]} 
          />
          <Octicons style={{ marginTop: 2 }} name="kebab-horizontal" size={24} color={Colors.color5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.color1,
  },
  content: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: Colors.color4,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.color5,
    textAlign: 'center',
    marginHorizontal: 16,
  },
}); 