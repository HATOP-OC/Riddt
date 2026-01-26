import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Header } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { useCreateSubreddit } from '@/hooks';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore } from '@/store';
import { handleApiError } from '@/api';
import type { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateSubreddit'>;

type SubredditType = 'public' | 'restricted' | 'private';

export function CreateSubredditScreen({ navigation }: Props) {
  const { theme } = useThemeStore();
  const createSubredditMutation = useCreateSubreddit();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SubredditType>('public');
  const [error, setError] = useState('');
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (name.length < 3) {
      setError('Name must be at least 3 characters');
      return;
    }
    
    if (name.length > 21) {
      setError('Name must be at most 21 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError('Name can only contain letters, numbers, and underscores');
      return;
    }
    
    try {
      setError('');
      const subreddit = await createSubredditMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
      });
      
      navigation.replace('Subreddit', { subredditName: subreddit.name });
    } catch (err) {
      setError(handleApiError(err));
    }
  };
  
  const TypeButton = ({ 
    value, 
    label, 
    desc 
  }: { 
    value: SubredditType; 
    label: string; 
    desc: string;
  }) => (
    <Button
      variant={type === value ? 'default' : 'outline'}
      style={styles.typeButton}
      onPress={() => setType(value)}
    >
      <View style={styles.typeButtonContent}>
        <Text 
          style={[
            styles.typeLabel, 
            { color: type === value ? colors.primaryForeground : theme.colors.foreground }
          ]}
        >
          {label}
        </Text>
        <Text 
          style={[
            styles.typeDesc, 
            { color: type === value ? colors.primaryForeground : theme.colors.mutedForeground }
          ]}
        >
          {desc}
        </Text>
      </View>
    </Button>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Create Community" 
        showBack 
        showMenu={false}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.destructive + '20' }]}>
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {error}
              </Text>
            </View>
          )}
          
          {/* Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.foreground }]}>
              Name
            </Text>
            <View style={styles.nameInputContainer}>
              <Text style={[styles.prefix, { color: theme.colors.mutedForeground }]}>
                r/
              </Text>
              <Input
                placeholder="community_name"
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={21}
                containerStyle={styles.nameInput}
              />
            </View>
            <Text style={[styles.hint, { color: theme.colors.mutedForeground }]}>
              Community names cannot be changed later
            </Text>
          </View>
          
          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.foreground }]}>
              Description (optional)
            </Text>
            <Input
              placeholder="What is your community about?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Type */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.foreground }]}>
              Community Type
            </Text>
            <View style={styles.typeButtons}>
              <TypeButton
                value="public"
                label="Public"
                desc="Anyone can view and post"
              />
              <TypeButton
                value="restricted"
                label="Restricted"
                desc="Anyone can view, only approved can post"
              />
              <TypeButton
                value="private"
                label="Private"
                desc="Only approved members can view and post"
              />
            </View>
          </View>
          
          <Button
            onPress={handleSubmit}
            loading={createSubredditMutation.isPending}
            disabled={createSubredditMutation.isPending || !name.trim()}
            style={styles.submitButton}
          >
            Create Community
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
  },
  errorContainer: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  errorText: {
    fontSize: fontSizes.sm,
  },
  field: {
    marginBottom: spacing[5],
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    marginBottom: spacing[1.5],
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginRight: spacing[1],
    marginBottom: spacing[4],
  },
  nameInput: {
    flex: 1,
  },
  hint: {
    fontSize: fontSizes.xs,
    marginTop: -spacing[3],
  },
  typeButtons: {
    gap: spacing[2],
  },
  typeButton: {
    height: 'auto',
    paddingVertical: spacing[3],
    justifyContent: 'flex-start',
  },
  typeButtonContent: {
    alignItems: 'flex-start',
    width: '100%',
  },
  typeLabel: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    marginBottom: spacing[0.5],
  },
  typeDesc: {
    fontSize: fontSizes.sm,
  },
  submitButton: {
    marginTop: spacing[4],
  },
});
