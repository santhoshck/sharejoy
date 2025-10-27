import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import Auth from './src/auth/Auth';
import { getCurrentUser, removeCurrentUser } from './src/auth/storage';

export default function App() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
    })();
  }, []);

  const handleLogout = async () => {
    await removeCurrentUser();
    setUser(null);
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.content}>
          <Text style={styles.welcome}>Welcome, {user}!</Text>
          <Button title="Log out" onPress={handleLogout} />
        </View>
      ) : (
        <Auth onLogin={(username: string) => setUser(username)} />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  content: { width: '100%', maxWidth: 420, alignItems: 'center' },
  welcome: { fontSize: 20, marginBottom: 12 },
});
