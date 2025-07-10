import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FollowingContextType {
  followingUsers: Set<number>;
  toggleFollowing: (userId: number) => void;
  setFollowing: (userId: number, isFollowing: boolean) => void;
  isFollowing: (userId: number) => boolean;
}

const FollowingContext = createContext<FollowingContextType | undefined>(undefined);

export function FollowingProvider({ children }: { children: ReactNode }) {
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());

  const toggleFollowing = (userId: number) => {
    setFollowingUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const setFollowing = (userId: number, isFollowing: boolean) => {
    setFollowingUsers(prev => {
      const newSet = new Set(prev);
      if (isFollowing) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const isFollowing = (userId: number): boolean => {
    return followingUsers.has(userId);
  };

  const value = {
    followingUsers,
    toggleFollowing,
    setFollowing,
    isFollowing,
  };

  return (
    <FollowingContext.Provider value={value}>
      {children}
    </FollowingContext.Provider>
  );
}

export function useFollowing() {
  const context = useContext(FollowingContext);
  if (context === undefined) {
    throw new Error('useFollowing must be used within a FollowingProvider');
  }
  return context;
} 