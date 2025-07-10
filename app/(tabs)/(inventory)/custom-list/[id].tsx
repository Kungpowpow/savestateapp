import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Octicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useCustomLists } from '@/hooks/useCustomLists';

export default function CustomListScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { customLists, updateList, deleteList, reorderListItems, addGameToList, removeGameFromList } = useCustomLists();
  const listId = Number(id);
  const list = customLists.data?.data?.find((l) => l.id === listId);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list?.title || '');
  const [description, setDescription] = useState(list?.description || '');
  const [visibility, setVisibility] = useState(list?.visibility || 'public');
  const [items, setItems] = useState(list?.items || []);
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (list) {
      setTitle(list.title || '');
      setDescription(list.description || '');
      setVisibility(list.visibility || 'public');
      setItems(list.items || []);
    }
  }, [list]);

  const handleSave = () => {
    updateList.mutate({
      listId,
      data: { title, description, visibility },
    });
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete List', 'Are you sure you want to delete this list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deleteList.mutate(listId);
        router.back();
      }},
    ]);
  };

  const handleReorder = (from: number, to: number) => {
    if (from === to) return;
    const newItems = [...items];
    const moved = newItems.splice(from, 1)[0];
    newItems.splice(to, 0, moved);
    setItems(newItems);
    // Send new order to backend
    reorderListItems.mutate({
      listId,
      data: {
        item_orders: newItems.map((item, idx) => ({ id: item.id, order: idx + 1 })),
      },
    });
  };

  const handleAddGame = (gameId: number) => {
    addGameToList.mutate({
      gameId,
      listId,
    }, {
      onSuccess: () => {
        setShowAddGameModal(false);
        setSearchQuery('');
      }
    });
  };

  const handleRemoveGame = (gameId: number) => {
    Alert.alert('Remove Game', 'Are you sure you want to remove this game from the list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        removeGameFromList.mutate({
          listId,
          gameId,
        });
      }},
    ]);
  };

  // Mock games for demonstration - in real app, this would be from IGDB API
  const mockGames = [
    { id: 1, name: 'The Legend of Zelda: Breath of the Wild', cover_url: null },
    { id: 2, name: 'Red Dead Redemption 2', cover_url: null },
    { id: 3, name: 'God of War', cover_url: null },
    { id: 4, name: 'The Witcher 3: Wild Hunt', cover_url: null },
    { id: 5, name: 'Elden Ring', cover_url: null },
  ];

  const filteredGames = mockGames.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item, index }: any) => (
    <View style={styles.gameItem}>
      <Text style={styles.gameTitle}>{item.game?.name || 'Unknown Game'}</Text>
      <View style={styles.gameActions}>
        <TouchableOpacity
          onPress={() => handleReorder(index, index - 1)}
          disabled={index === 0}
        >
          <Octicons name="arrow-up" size={20} color={index === 0 ? Colors.color5 + '40' : Colors.color5} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleReorder(index, index + 1)}
          disabled={index === items.length - 1}
        >
          <Octicons name="arrow-down" size={20} color={index === items.length - 1 ? Colors.color5 + '40' : Colors.color5} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRemoveGame(item.game?.igdb_id || item.game_id)}
        >
          <Octicons name="trash" size={20} color={Colors.color5} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!list) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>List not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.overlay, { paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{editing ? 'Edit List' : list.title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setEditing((e) => !e)}>
              <Octicons name={editing ? 'x' : 'pencil'} size={22} color={Colors.color5} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 16 }}>
              <Octicons name="trash" size={22} color={Colors.color5} />
            </TouchableOpacity>
          </View>
        </View>

        {editing ? (
          <View style={styles.editSection}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={Colors.color5 + '80'}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor={Colors.color5 + '80'}
              multiline
            />
            <View style={styles.visibilityRow}>
              {['public', 'private', 'friends'].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.visibilityButton, visibility === v && styles.visibilityButtonActive]}
                  onPress={() => setVisibility(v as any)}
                >
                  <Octicons name={v === 'public' ? 'globe' : v === 'private' ? 'lock' : 'people'} size={18} color={Colors.color5} />
                  <Text style={styles.visibilityText}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {list.description ? (
              <Text style={styles.description}>{list.description}</Text>
            ) : null}
            <View style={styles.visibilityRow}>
              <Octicons name={list.visibility === 'public' ? 'globe' : list.visibility === 'private' ? 'lock' : 'people'} size={18} color={Colors.color5} />
              <Text style={styles.visibilityText}>{list.visibility.charAt(0).toUpperCase() + list.visibility.slice(1)}</Text>
            </View>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Games in this list</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddGameModal(true)}>
            <Octicons name="plus" size={20} color={Colors.color5} />
            <Text style={styles.addButtonText}>Add Game</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No games in this list yet.</Text>}
        />

        {/* Add Game Modal */}
        <Modal
          visible={showAddGameModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAddGameModal(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Game to List</Text>
              
              <TextInput
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search games..."
                placeholderTextColor={Colors.color5 + '80'}
              />
              
              <FlatList
                data={filteredGames}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gameSearchItem}
                    onPress={() => handleAddGame(item.id)}
                    disabled={addGameToList.isPending}
                  >
                    <Text style={styles.gameSearchTitle}>{item.name}</Text>
                    <Octicons name="plus" size={20} color={Colors.color5} />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ maxHeight: 300 }}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No games found' : 'Search for games to add'}
                  </Text>
                }
              />
              
              <TouchableOpacity
                style={[styles.saveButton, { marginTop: 16 }]}
                onPress={() => setShowAddGameModal(false)}
              >
                <Text style={styles.saveButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  content: {
    backgroundColor: Colors.color1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: Colors.color5,
    fontSize: 22,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editSection: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.color3,
    color: Colors.color5,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  visibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.color3,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  visibilityButtonActive: {
    backgroundColor: Colors.color2,
  },
  visibilityText: {
    color: Colors.color5,
    fontSize: 14,
    marginLeft: 6,
  },
  saveButton: {
    backgroundColor: Colors.color2,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: Colors.color5,
    fontWeight: '600',
    fontSize: 16,
  },
  description: {
    color: Colors.color5 + 'CC',
    fontSize: 15,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    color: Colors.color5,
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.color3,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: Colors.color5,
    fontSize: 15,
    marginLeft: 6,
  },
  listContent: {
    paddingBottom: 40,
  },
  gameItem: {
    backgroundColor: Colors.color3,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gameTitle: {
    color: Colors.color5,
    fontSize: 16,
    flex: 1,
  },
  gameActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyText: {
    color: Colors.color5 + '80',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.color1,
  },
  errorText: {
    color: Colors.color5,
    fontSize: 18,
    fontWeight: '600',
  },
  gameSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.color3,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  gameSearchTitle: {
    color: Colors.color5,
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    backgroundColor: Colors.color1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  modalTitle: {
    color: Colors.color5,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
}); 