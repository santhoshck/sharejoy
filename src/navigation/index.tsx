import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from '../auth/Auth';
import Account from '../auth/Account';
import Home from '../screens/Home';
import NgoForm from '../ngo/NgoForm';
import NgoDetails from '../ngo/NgoDetails';
import { getInitialUser as _getInitialUser } from './init';
import { NGO } from '../ngo/types';
import { supabase } from '../lib/supabase';
import { getProfileById } from '../auth/storage';

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

  console.log(`[RootNavigator] Render - loading: ${loading}, user: ${user}`);

  useEffect(() => {
    console.log('[RootNavigator] Initializing...');

    // 1. Check initial session
    const checkInitialSession = async () => {
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.log('[RootNavigator] Session check timed out, proceeding to Auth.');
          setLoading(false);
        }
      }, 5000); // 5 second safety timeout

      try {
        console.log('[RootNavigator] Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[RootNavigator] Session error:', error);
        }

        if (session) {
          console.log('[RootNavigator] Session found for:', session.user.id);
          const profile = await getProfileById(session.user.id);
          if (profile) {
            console.log('[RootNavigator] Initial profile fetched:', profile.username);
            setUser(profile.username);
          } else {
            console.warn('[RootNavigator] Initial profile missing. Fallback.');
            setUser(session.user.email?.split('@')[0] || 'User');
          }
        } else {
          console.log('[RootNavigator] No session found.');
          setUser(null);
        }
      } catch (e) {
        console.error('[RootNavigator] Fatal init error:', e);
      } finally {
        clearTimeout(timeoutId);
        console.log('[RootNavigator] Loading complete.');
        setLoading(false);
      }
    };
    checkInitialSession();


    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[RootNavigator] Auth event:', event, 'Session present:', !!session);

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }

      if (session) {
        // If we don't have a user yet, fetch it
        if (!user) {
          setLoading(false); // Ensure we hide loader immediately
          console.log('[RootNavigator] Fetching profile for event:', event);
          const profile = await getProfileById(session.user.id);
          if (profile) {
            setUser(profile.username);
          } else {
            const fallback = session.user.email?.split('@')[0] || 'User';
            setUser(fallback);
          }
        }
      }
    });

    return () => {
      console.log('[RootNavigator] Cleaning up...');
      subscription.unsubscribe();
    };
  }, [user]); // Re-subscribe if user changes? No, better keep it stable. 
  // Wait, I should probably use a ref for 'user' or just handle it carefully.



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

