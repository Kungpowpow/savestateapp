import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Octicons } from '@expo/vector-icons';
import { useCustomLists } from '@/hooks/useCustomLists';

interface CustomListCardProps {
  list: {
    id: number;
    title: string;
    description?: string;
    visibility: 'public' | 'private' | 'friends';
    items?: Array<{ id: number; game?: any }>;
    created_at: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CustomListCard({ list, onEdit, onDelete }: CustomListCardProps) {
  const router = useRouter();
  const { updateList } = useCustomLists();
  const gameCount = list.items?.length || 0;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [titleError, setTitleError] = useState('');
  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setEditTitle(list.title);
  }, [list.title]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isEditing]);

  const handlePress = () => {
    if (isEditing) return; // Don't navigate when editing
    router.push({
      pathname: '/(tabs)/(inventory)/custom-list/[id]' as any,
      params: { id: list.id.toString() }
    });
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setTitleError('Title is required');
      return;
    }
    if (trimmedTitle.length > 255) {
      setTitleError('Title must be less than 255 characters');
      return;
    }

    setTitleError('');
    updateList.mutate({
      listId: list.id,
      data: { 
        title: trimmedTitle, 
        description: list.description || '', 
        visibility: list.visibility 
      }
    }, {
      onSuccess: () => {
        setIsEditing(false);
        setTitleError('');
      },
      onError: (error) => {
        console.error('Failed to update list:', error);
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(list.title);
    setTitleError('');
  };

  const getVisibilityIcon = () => {
    switch (list.visibility) {
      case 'public':
        return 'globe';
      case 'private':
        return 'lock';
      case 'friends':
        return 'people';
      default:
        return 'globe';
    }
  };

  const getVisibilityText = () => {
    switch (list.visibility) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      case 'friends':
        return 'Friends';
      default:
        return 'Public';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                ref={titleInputRef}
                style={[styles.titleInput, titleError && styles.titleInputError]}
                value={editTitle}
                onChangeText={(text) => {
                  setEditTitle(text);
                  if (titleError) setTitleError('');
                }}
                placeholder="List title"
                placeholderTextColor={Colors.color5 + '80'}
                maxLength={255}
              />
              {titleError && <Text style={styles.titleError}>{titleError}</Text>}
            </View>
          ) : (
            <Text style={styles.title} numberOfLines={1}>
              {list.title}
            </Text>
          )}
          <View style={styles.visibilityContainer}>
            <Octicons name={getVisibilityIcon()} size={12} color={Colors.color5 + '80'} />
            <Text style={styles.visibilityText}>{getVisibilityText()}</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          {isEditing ? (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleSave}
                disabled={updateList.isPending}
              >
                <Octicons name="check" size={16} color={Colors.color5} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleCancel}
                disabled={updateList.isPending}
              >
                <Octicons name="x" size={16} color={Colors.color5} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {onEdit && (
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleEdit}
                >
                  <Octicons name="pencil" size={16} color={Colors.color5} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Octicons name="trash" size={16} color={Colors.color5} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {list.description && !isEditing && (
        <Text style={styles.description} numberOfLines={2}>
          {list.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.gameCount}>
          <Octicons name="number" size={16} color={Colors.color5 + '80'} />
          <Text style={styles.gameCountText}>
            {gameCount} {gameCount === 1 ? 'game' : 'games'}
          </Text>
        </View>
        
        <Text style={styles.dateText}>
          Created {formatDate(list.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.color3,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.color5,
    marginBottom: 4,
  },
  editContainer: {
    marginBottom: 4,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.color5,
    backgroundColor: Colors.color1,
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.color5 + '40',
  },
  titleInputError: {
    borderColor: '#ff6b6b',
  },
  titleError: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
  visibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityText: {
    fontSize: 12,
    color: Colors.color5 + '80',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.color5 + 'CC',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameCountText: {
    fontSize: 14,
    color: Colors.color5 + '80',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: Colors.color5 + '60',
  },
}); 