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
import { supabase } from '../lib/supabase';
import { StatusBar } from 'expo-status-bar';

export default function Auth({ onLogin }: { onLogin: (username: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'approver'>('user');
  const [loading, setLoading] = useState(false);

  const clear = () => {
    setPassword('');
  };

  const handleRegister = async () => {
    if (!email || !username || !password) {
      return Alert.alert('Missing Fields', 'Please fill email, username and password');
    }
    setLoading(true);
    try {
      // 1. Sign up user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create the associated profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username,
            role,
          });

        if (profileError) throw profileError;

        Alert.alert('Success', 'Check your email for confirmation!');
        // For development/demo purposes we might navigate directly if email confirmation is off,
        // but let's assume standard flow.
        onLogin(username);
      }
      clear();
    } catch (e: any) {
      console.warn('Register error', e);
      Alert.alert('Register failed', e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Missing Fields', 'Please fill email and password');
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Fetch profile to get username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        onLogin(profile.username);
      }
      clear();
    } catch (e: any) {
      console.warn('Login error', e);
      Alert.alert('Login failed', e.message || String(e));
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
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              {!isLogin && (
                <>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Choose a username"
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </>
              )}

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

