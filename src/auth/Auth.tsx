import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { getUser, addUser, setCurrentUser } from './storage';
import { generateSalt, hashPassword, verifyPassword } from './crypto';
import { StatusBar } from 'expo-status-bar';

export default function Auth({ onLogin }: { onLogin: (username: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'approver'>('user');
  const [loading, setLoading] = useState(false);

  const clear = () => {
    setPassword('');
  };

  const handleRegister = async () => {
    if (!username || !password) return Alert.alert('Missing Fields', 'Please fill username and password');
    setLoading(true);
    try {
      const existing = await getUser(username);
      if (existing) {
        setLoading(false);
        return Alert.alert('User exists', 'Choose a different username or log in.');
      }

      const salt = await generateSalt();
      const hash = hashPassword(password, salt);
      await addUser({ username, salt, hash, role });
      await setCurrentUser(username);
      onLogin(username);
      clear();
    } catch (e) {
      console.warn('Register error', e);
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Register failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('Missing Fields', 'Please fill username and password');
    setLoading(true);
    try {
      const u = await getUser(username);
      if (!u) {
        setLoading(false);
        return Alert.alert('Account not found', 'No user found with that username.');
      }
      const ok = verifyPassword(password, u.salt, u.hash);
      if (!ok) {
        setLoading(false);
        return Alert.alert('Authentication Failed', 'Invalid credentials.');
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

  const isLogin = mode === 'login';

  return (
    <View style={styles.background}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.appName}>ShareJoy</Text>
              <Text style={styles.subtitle}>{isLogin ? 'Welcome Back' : 'Create an Account'}</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {!isLogin && (
                <View style={styles.roleContainer}>
                  <Text style={styles.label}>I am a:</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity
                      style={[styles.roleOption, role === 'user' && styles.roleOptionSelected]}
                      onPress={() => setRole('user')}
                    >
                      <Text style={[styles.roleText, role === 'user' && styles.roleTextSelected]}>User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleOption, role === 'approver' && styles.roleOptionSelected]}
                      onPress={() => setRole('approver')}
                    >
                      <Text style={[styles.roleText, role === 'approver' && styles.roleTextSelected]}>Approver</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#6366f1" />
                </View>
              ) : (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={isLogin ? handleLogin : handleRegister}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isLogin ? 'Log In' : 'Sign Up'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.line} />
                  </View>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setMode(isLogin ? 'register' : 'login');
                      clear();
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {isLogin ? 'Create an Account' : 'I already have an account'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    width: '100%',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6366f1',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actions: {
    marginTop: 24,
    gap: 16,
  },
  loaderContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '600',
  },
  roleContainer: {
    marginTop: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginTop: 6,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleOptionSelected: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  roleTextSelected: {
    color: '#6366f1',
  },
});
