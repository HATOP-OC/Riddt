import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

import { colors, spacing, fontSizes } from '@/theme';
import { useThemeStore } from '@/store';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ 
  title = 'Riddt', 
  showBack = false, 
  showMenu = true,
  rightAction,
}: HeaderProps) {
  const navigation = useNavigation();
  const { theme, colorScheme } = useThemeStore();
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  return (
    <SafeAreaView 
      edges={['top']} 
      style={[styles.safeArea, { backgroundColor: theme.colors.card }]}
    >
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.card}
      />
      <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
        {/* Left side */}
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={theme.colors.foreground} 
              />
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity onPress={handleMenu} style={styles.iconButton}>
              <Ionicons 
                name="menu" 
                size={24} 
                color={theme.colors.foreground} 
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>
        
        {/* Title */}
        <View style={styles.center}>
          <Text 
            style={[styles.title, { color: theme.colors.foreground }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        
        {/* Right side */}
        <View style={styles.right}>
          {rightAction || <View style={styles.iconPlaceholder} />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    height: 56,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
  },
  iconButton: {
    padding: spacing[2],
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
});
