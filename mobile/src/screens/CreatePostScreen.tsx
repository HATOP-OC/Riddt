import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';

import { Header } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { useSubreddits, useCreatePost } from '@/hooks';
import { colors, spacing, fontSizes, borderRadius } from '@/theme';
import { useThemeStore } from '@/store';
import { handleApiError } from '@/api';
import type { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;

export function CreatePostScreen({ route, navigation }: Props) {
  const initialSubredditId = route.params?.subredditId;
  const { theme } = useThemeStore();
  
  const { data: subreddits } = useSubreddits();
  const createPostMutation = useCreatePost();
  
  const [subredditId, setSubredditId] = useState<number | undefined>(initialSubredditId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsString, setTagsString] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async () => {
    if (!subredditId) {
      setError('Please select a subreddit');
      return;
    }
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    
    try {
      setError('');
      await createPostMutation.mutateAsync({
        title: title.trim(),
        content: content.trim() || undefined,
        subredditId,
        tagsString: tagsString.trim() || undefined,
      });
      
      navigation.goBack();
    } catch (err) {
      setError(handleApiError(err));
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Create Post" 
        showBack 
        showMenu={false}
        rightAction={
          <Button
            size="sm"
            onPress={handleSubmit}
            loading={createPostMutation.isPending}
            disabled={createPostMutation.isPending || !title.trim() || !subredditId}
          >
            Post
          </Button>
        }
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
          
          {/* Subreddit selector */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.foreground }]}>
              Community
            </Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border }]}>
              <Picker
                selectedValue={subredditId}
                onValueChange={(value) => setSubredditId(value)}
                style={[styles.picker, { color: theme.colors.foreground }]}
              >
                <Picker.Item label="Choose a community..." value={undefined} />
                {subreddits?.map((sub) => (
                  <Picker.Item key={sub.id} label={`r/${sub.name}`} value={sub.id} />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Title */}
          <Input
            label="Title"
            placeholder="An interesting title"
            value={title}
            onChangeText={setTitle}
            maxLength={300}
          />
          
          {/* Content */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.foreground }]}>
              Text (optional)
            </Text>
            <View 
              style={[
                styles.textAreaContainer, 
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                }
              ]}
            >
              <Input
                placeholder="What's on your mind?"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                style={styles.textArea}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
          </View>
          
          {/* Tags */}
          <Input
            label="Tags (optional)"
            placeholder="e.g., discussion, question, news (comma-separated)"
            value={tagsString}
            onChangeText={setTagsString}
          />
          
          <Text style={[styles.hint, { color: theme.colors.mutedForeground }]}>
            Separate multiple tags with commas
          </Text>
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
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    marginBottom: spacing[1.5],
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 0,
  },
  hint: {
    fontSize: fontSizes.xs,
    marginTop: -spacing[3],
  },
});
