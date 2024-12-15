import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, navigation }: any) {
  return (
      <View style={styles.container}>
        {/* Background curved shape */}
        <View style={styles.backgroundCurve} />
        
        {/* Tab buttons */}
        <View style={styles.tabButtonsContainer}>
          {state.routes.map((route: any, index: any) => {
            const isFocused = state.index === index;
            // Special handling for search (middle) button
            if (route.name === '(search)') {
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <View key={route.key}>
                  <View style={styles.tabButton} />
                  <TouchableOpacity
                    onPress={onPress}
                    style={styles.searchButton}
                    activeOpacity={1}
                  >
                    <MaterialCommunityIcons
                      name="magnify"
                      size={32}
                      color={Colors.color6}
                    />
                  </TouchableOpacity>
                </View>
              );
            }

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const getIcon = (routeName: string) => {
              switch (routeName) {
                case '(trending)':
                  return 'flame';
                  // return 'comment-discussion';
                case '(inventory)':
                  return 'star';
                  // return 'heart';
                  // return 'bookmark';
                case '(activity)':
                  return 'comment-discussion';
                  // return 'bell';
                case '(profile)':
                  return 'person';
                default:
                  return 'circle';
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
              >
                <Octicons
                  name={getIcon(route.name)}
                  size={25}
                  color={isFocused ? Colors.color2 : Colors.color3}
                />
              </TouchableOpacity>
            );
          })}
        </View>
        
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width,
  },
  backgroundCurve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: Colors.color1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  tabButton: {
    width: width / 6,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'teal',
  },
  searchButton: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -30 }],
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.color2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
}); 