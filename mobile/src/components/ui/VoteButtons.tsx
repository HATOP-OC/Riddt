import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '@/theme';
import { useThemeStore } from '@/store';
import { formatScore } from '@/utils';

interface VoteButtonsProps {
  score: number;
  userVote: number | null;
  onUpvote: () => void;
  onDownvote: () => void;
  vertical?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function VoteButtons({
  score,
  userVote,
  onUpvote,
  onDownvote,
  vertical = true,
  size = 'md',
}: VoteButtonsProps) {
  const { theme } = useThemeStore();
  
  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28,
  };
  
  const iconSize = iconSizes[size];
  
  const getUpvoteColor = () => {
    if (userVote === 1) return colors.upvote;
    return theme.colors.mutedForeground;
  };
  
  const getDownvoteColor = () => {
    if (userVote === -1) return colors.downvote;
    return theme.colors.mutedForeground;
  };
  
  const getScoreColor = () => {
    if (userVote === 1) return colors.upvote;
    if (userVote === -1) return colors.downvote;
    return theme.colors.foreground;
  };
  
  return (
    <View style={[styles.container, vertical && styles.vertical]}>
      <TouchableOpacity
        onPress={onUpvote}
        style={styles.button}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={userVote === 1 ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
          size={iconSize}
          color={getUpvoteColor()}
        />
      </TouchableOpacity>
      
      <Text
        style={[
          styles.score,
          { 
            color: getScoreColor(),
            fontSize: size === 'sm' ? fontSizes.xs : fontSizes.sm,
          },
        ]}
      >
        {formatScore(score)}
      </Text>
      
      <TouchableOpacity
        onPress={onDownvote}
        style={styles.button}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={userVote === -1 ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
          size={iconSize}
          color={getDownvoteColor()}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  vertical: {
    flexDirection: 'column',
  },
  button: {
    padding: spacing[1],
  },
  score: {
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
});
