import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from '../auth/Auth';
import Account from '../auth/Account';
import { getCurrentUser, removeCurrentUser } from '../auth/storage';
import { getInitialUser as _getInitialUser } from './init';

type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  const signOut = async () => {
    await removeCurrentUser();
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home">
            {() => (
              // Home shows welcome and Account; Account handles password/change/delete
              <Account username={user} onDeleted={() => setUser(null)} onSignOut={signOut} />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth">
            {({ navigation }) => (
              <Auth
                onLogin={(username: string) => {
                  setUser(username);
                  // navigation to Home will happen because user becomes non-null
                }}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// helper for tests / other modules: get the initial current user
// Re-export helper for backwards compatibility
export const getInitialUser = _getInitialUser;
