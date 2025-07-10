import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { useIGDBToken } from '@/hooks/useIGDBToken';
import { searchUsers } from '@/lib/api';
import { useFollowing } from './following';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'games' | 'users';
  setActiveTab: (tab: 'games' | 'users') => void;
  games: Game[];
  setGames: Dispatch<SetStateAction<Game[]>>;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  handleSearch: () => void;
  handleClear: () => void;
}

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  rating?: number;
}

interface User {
  id: number;
  name: string;
  username: string;
  slug: string;
  created_at: string;
  isFollowing: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'games' | 'users'>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: tokens, refetch: refetchTokens } = useIGDBToken();
  const { setFollowing } = useFollowing();

  const searchGames = async (query: string) => {
    if (!query.trim() || !tokens) return;
    setLoading(true);
    try {
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': tokens.client_id,
          'Authorization': `Bearer ${tokens.access_token}`,
        },
        body: `search "${query}"; fields name,rating,cover.url; limit 20; where version_parent = null;`
      });
      if (!response.ok) {
        if (response.status === 401) {
          await refetchTokens();
          return;
        }
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsersData = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchUsers(query);
      setUsers(data);
      // Update global following state for all users in search results
      data.forEach((user: User) => {
        setFollowing(user.id, user.isFollowing);
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === 'games') {
      searchGames(searchQuery);
    } else {
      searchUsersData(searchQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setGames([]);
    setUsers([]);
  };

  const value = {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    games,
    setGames,
    users,
    setUsers,
    loading,
    setLoading,
    handleSearch,
    handleClear,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 