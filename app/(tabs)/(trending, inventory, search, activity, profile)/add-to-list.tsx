import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  KeyboardAvoidingView, 
  FlatList, 
  ActivityIndicator, 
  TextInput,
  Alert,
  Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Octicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useCustomLists } from '@/hooks/useCustomLists';

export default function AddToListScreen() {
  const { gameId, gameTitle } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { customLists, addGameToList, createList } = useCustomLists();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVisibility, setNewVisibility] = useState<'public' | 'private' | 'friends'>('private');
  const [titleError, setTitleError] = useState('');
  const titleInputRef = useRef<TextInput>(null);

  // Auto-focus title input when create modal opens
  useEffect(() => {
    if (showCreateModal) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [showCreateModal]);

  const handleAddToList = (listId: number) => {
    addGameToList.mutate({
      gameId: Number(gameId),
      listId,
    }, {
      onSuccess: () => {
        router.back();
      }
    });
  };

  const handleCreateList = () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      setTitleError('Title is required');
      return;
    }
    if (trimmedTitle.length > 255) {
      setTitleError('Title must be less than 255 characters');
      return;
    }
    
    setTitleError('');
    createList.mutate({
      title: trimmedTitle,
      description: newDescription.trim(),
      visibility: newVisibility,
    }, {
      onSuccess: (response: any) => {
        // Immediately add the game to the newly created list
        const newListId = response.data.id;
        addGameToList.mutate({
          gameId: Number(gameId),
          listId: newListId,
        }, {
          onSuccess: () => {
            setShowCreateModal(false);
            setNewTitle('');
            setNewDescription('');
            setNewVisibility('private');
            setTitleError('');
            router.back();
          }
        });
      },
      onError: (error: any) => {
        console.error('Failed to create list:', error);
      }
    });
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewVisibility('private');
    setTitleError('');
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Octicons name="x" size={24} color={Colors.color5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Add to Custom List
          {gameTitle && (
            <Text style={styles.gameTitle}> • {gameTitle}</Text>
          )}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {customLists.isLoading ? (
          <ActivityIndicator size="large" color={Colors.color5} style={{ marginTop: 40 }} />
        ) : customLists.isError ? (
          <Text style={styles.errorText}>Failed to load lists</Text>
        ) : (
          <>
            <FlatList
              data={customLists.data?.data || []}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => handleAddToList(item.id)}
                  disabled={addGameToList.isPending}
                >
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{item.title}</Text>
                    <Text style={styles.listItemCount}>
                      {item.items?.length || 0} games
                    </Text>
                  </View>
                  <Octicons name="plus" size={20} color={Colors.color5} />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No custom lists yet.
                </Text>
              }
            />
            
            <TouchableOpacity
              style={styles.createListButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Octicons name="plus" size={20} color={Colors.color5} />
              <Text style={styles.createListButtonText}>Create New List</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Create List Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={handleCancelCreate}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New List</Text>
            
            {createList.isError && (
              <Text style={styles.errorText}>
                Failed to create list. Please try again.
              </Text>
            )}
            
            <TextInput
              ref={titleInputRef}
              style={[styles.input, titleError && styles.inputError]}
              value={newTitle}
              onChangeText={(text) => {
                setNewTitle(text);
                if (titleError) setTitleError('');
              }}
              placeholder="Title"
              placeholderTextColor={Colors.color5 + '80'}
              maxLength={255}
            />
            {titleError && <Text style={styles.fieldError}>{titleError}</Text>}
            
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Description (optional)"
              placeholderTextColor={Colors.color5 + '80'}
              multiline
              maxLength={1000}
            />
            
            <View style={styles.visibilityRow}>
              {['public', 'private', 'friends'].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.visibilityButton, newVisibility === v && styles.visibilityButtonActive]}
                  onPress={() => setNewVisibility(v as any)}
                >
                  <Octicons name={v === 'public' ? 'globe' : v === 'private' ? 'lock' : 'people'} size={18} color={Colors.color5} />
                  <Text style={styles.visibilityText}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, marginRight: 8 }, (createList.isPending || addGameToList.isPending) && styles.saveButtonDisabled]}
                onPress={handleCreateList}
                disabled={createList.isPending || addGameToList.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {(createList.isPending || addGameToList.isPending) ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, backgroundColor: Colors.color3 }]}
                onPress={handleCancelCreate}
                disabled={createList.isPending || addGameToList.isPending}
              >
                <Text style={styles.saveButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.color3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.color5,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  gameTitle: {
    color: Colors.color5 + '80',
    fontSize: 16,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.color3,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    color: Colors.color5,
    fontSize: 16,
    fontWeight: '500',
  },
  listItemCount: {
    color: Colors.color5 + '80',
    fontSize: 14,
    marginTop: 2,
  },
  createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.color2,
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
  },
  createListButtonText: {
    color: Colors.color5,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  emptyText: {
    color: Colors.color5 + '80',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.color1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: Colors.color5,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.color3,
    color: Colors.color5,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  fieldError: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  visibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  visibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.color5,
    borderRadius: 8,
  },
  visibilityButtonActive: {
    backgroundColor: Colors.color5,
  },
  visibilityText: {
    color: Colors.color5,
    fontSize: 14,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: Colors.color3,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.color5,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
}); 