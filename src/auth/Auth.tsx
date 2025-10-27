import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getUser, addUser, setCurrentUser } from './storage';
import { generateSalt, hashPassword, verifyPassword } from './crypto';

export default function Auth({ onLogin }: { onLogin: (username: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const clear = () => {
    setPassword('');
  };

  const handleRegister = async () => {
    if (!username || !password) return Alert.alert('Please fill username and password');
    setLoading(true);
    try {
      const existing = await getUser(username);
      if (existing) {
        setLoading(false);
        return Alert.alert('User exists', 'Choose a different username');
      }

  const salt = await generateSalt();
  const hash = hashPassword(password, salt);
      await addUser({ username, salt, hash });
      await setCurrentUser(username);
      onLogin(username);
      clear();
    } catch (e) {
      console.warn('Register error', e);
      // Show an actionable error message to help debugging
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Register failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('Please fill username and password');
    setLoading(true);
    try {
      const u = await getUser(username);
      if (!u) {
        setLoading(false);
        return Alert.alert('No such user');
      }
      const ok = verifyPassword(password, u.salt, u.hash);
      if (!ok) {
        setLoading(false);
        return Alert.alert('Invalid credentials');
      }
      await setCurrentUser(username);
      onLogin(username);
      clear();
    } catch (e) {
      console.warn('Login error', e);
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? 'Log in' : 'Register'}</Text>

      <TextInput
        style={styles.input}
        placeholder="username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.buttons}>
          <Button title={mode === 'login' ? 'Log in' : 'Register'} onPress={mode === 'login' ? handleLogin : handleRegister} />
          <Button
            title={mode === 'login' ? "Switch to Register" : 'Switch to Log in'}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 420, alignItems: 'stretch' },
  title: { fontSize: 22, marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 6 },
  buttons: { flexDirection: 'column', gap: 8 },
});
