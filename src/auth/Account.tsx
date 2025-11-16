import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { changeUserPassword, deleteUser, getUser, removeCurrentUser } from './storage';
import { verifyPassword } from './crypto';

export default function Account({ username, onDeleted, onSignOut }: { username: string; onDeleted: () => void; onSignOut?: () => void }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!current || !newPass) return Alert.alert('Fill both current and new password');
    if (newPass !== confirm) return Alert.alert('New password and confirm do not match');
    setLoading(true);
    try {
      await changeUserPassword(username, current, newPass);
      Alert.alert('Success', 'Password changed');
      setCurrent('');
      setNewPass('');
      setConfirm('');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Change password failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete account', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            // ask for current password validation
            const u = await getUser(username);
            if (!u) throw new Error('User not found');
            // prompt current password must match current state
            // We'll reuse current state input for password verification here
            if (!current) {
              setLoading(false);
              return Alert.alert('Enter current password to confirm deletion');
            }
            const ok = verifyPassword(current, u.salt, u.hash);
            if (!ok) throw new Error('Password incorrect');
            await deleteUser(username);
            Alert.alert('Deleted', 'Your account has been deleted');
            onDeleted();
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            Alert.alert('Delete failed', message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    try {
      await removeCurrentUser();
      if (onSignOut) onSignOut();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Sign out failed', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account ({username})</Text>

      <TextInput
        style={styles.input}
        placeholder="Current password"
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="New password"
        value={newPass}
        onChangeText={setNewPass}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      <View style={styles.buttons}>
        <Button title="Change password" onPress={handleChange} disabled={loading} />
        <Button title="Sign out" onPress={handleSignOut} disabled={loading} />
        <Button title="Delete account" onPress={handleDelete} color="#c00" disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 420 },
  title: { fontSize: 18, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 6 },
  buttons: { gap: 8 },
});

