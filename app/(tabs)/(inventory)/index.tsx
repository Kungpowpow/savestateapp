import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Link } from 'expo-router';

export default function InventoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Inventory screen</Text>     
      <Link push style={styles.text} href={"/(tabs)/(inventory)/(game)/123"}>Link to game2 screen</Link>
      <Text style={styles.text}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>         
      <Text style={styles.text}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 20,
    color: Colors.color5,
  },
}); 