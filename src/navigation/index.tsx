import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from '../auth/Auth';
import Account from '../auth/Account';
import Home from '../screens/Home';
import NgoForm from '../ngo/NgoForm';
import NgoDetails from '../ngo/NgoDetails';
import { getCurrentUser, removeCurrentUser } from '../auth/storage';
import { getInitialUser as _getInitialUser } from './init';
import { NGO } from '../ngo/types';

type RootStackParamList = {
  Auth: undefined;
  Home: { username: string };
  Account: { username: string };
  NgoForm: { ngo?: NGO };
  NgoDetails: { ngo: NGO };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signOut = async () => {
    await removeCurrentUser();
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={Home} initialParams={{ username: user }} />
            <Stack.Screen name="Account">
              {(props) => <Account {...props} username={user} onSignOut={signOut} onDeleted={() => setUser(null)} />}
            </Stack.Screen>
            <Stack.Screen name="NgoForm" component={NgoForm} />
            <Stack.Screen name="NgoDetails" component={NgoDetails} />
          </>
        ) : (
          <Stack.Screen name="Auth">
            {() => (
              <Auth
                onLogin={(username: string) => {
                  setUser(username);
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
