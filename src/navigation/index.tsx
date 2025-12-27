import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from '../auth/Auth';
import Account from '../auth/Account';
import Home from '../screens/Home';
import NgoForm from '../ngo/NgoForm';
import NgoDetails from '../ngo/NgoDetails';
// Migrated to Supabase Auth directly in navigator
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

import { supabase } from '../lib/supabase';
import { getProfileById } from '../auth/storage';

export default function RootNavigator() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check initial session
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getProfileById(session.user.id);
        setUser(profile?.username || null);
      }
      setLoading(false);
    };
    checkInitialSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const profile = await getProfileById(session.user.id);
        setUser(profile?.username || null);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
              {(props) => <Account {...props} username={user} onDeleted={() => setUser(null)} />}
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

// Re-export helper for backwards compatibility
export const getInitialUser = _getInitialUser;

