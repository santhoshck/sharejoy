import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { changeUserPassword, deleteUser, getUser } from './storage';
import { verifyPassword } from './crypto';

export default function Account({
  username,
  onDeleted,
  onSignOut,
  navigation,
}: {
  username: string;
  onDeleted: () => void;
  onSignOut?: () => void;
  navigation: NavigationProp<any>;
}) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleChange = async () => {
    if (!current || !newPass) return Alert.alert('Missing Fields', 'Fill both current and new password');
    if (newPass !== confirm) return Alert.alert('Mismatch', 'New password and confirmation do not match');
    setLoading(true);
    try {
      await changeUserPassword(username, current, newPass);
      Alert.alert('Success', 'Password changed successfully');
      setCurrent('');
      setNewPass('');
      setConfirm('');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Change Password Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Permanently',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const u = await getUser(username);
            if (!u) throw new Error('User not found');
            if (!current) {
              setLoading(false);
              return Alert.alert('Verification Required', 'Please enter your current password to confirm deletion.');
            }
            const ok = verifyPassword(current, u.salt, u.hash);
            if (!ok) throw new Error('Password incorrect');
            await deleteUser(username);
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            onDeleted();
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            Alert.alert('Delete Failed', message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    try {
      if (onSignOut) onSignOut();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Sign Out Failed', message);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home', { username });
            }
          }}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Required for any changes"
                placeholderTextColor="#94a3b8"
                value={current}
                onChangeText={setCurrent}
                secureTextEntry
              />

              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#94a3b8"
                value={newPass}
                onChangeText={setNewPass}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor="#94a3b8"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleChange}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={handleSignOut}
                disabled={loading}
              >
                <Text style={styles.outlineButtonText}>Sign Out</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleDelete}
                disabled={loading}
              >
                <Text style={styles.dangerButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    marginTop: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  outlineButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    marginTop: 8,
  },
  dangerButtonText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 16,
  },
});
