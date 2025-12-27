import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { NGO } from '../ngo/types';
import { getNgos, deleteNgo } from '../ngo/storage';
import { getProfileById, getCurrentUser, getCurrentUserId, UserRole } from '../auth/storage';
import { supabase } from '../lib/supabase';

interface HomeProps {
    navigation: NavigationProp<any>;
    route: { params?: { username: string } };
}

export default function Home({ navigation, route }: HomeProps) {
    console.log('[Home] Rendering...');
    const [username, setUsername] = useState(route.params?.username || '');

    const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
    const [ngos, setNgos] = useState<NGO[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>('user');

    const fetchNgos = useCallback(async () => {
        setLoading(true);
        try {
            console.log('[Home] fetchNgos starting...');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('[Home] No session, skipping fetch');
                return;
            }

            const userId = session.user.id;
            setCurrentUserIdState(userId);

            // Fetch NGOs
            const ngoData = await getNgos();
            setNgos(ngoData);

            // Only fetch profile if we don't have a username yet
            // or if we need the role (standard case)
            if (!username || userRole === 'user') {
                console.log('[Home] Fetching profile for role/username update');
                const profileData = await getProfileById(userId);
                if (profileData) {
                    setUserRole(profileData.role || 'user');
                    if (profileData.username && profileData.username !== username) {
                        setUsername(profileData.username);
                    }
                }
            } else {
                console.log('[Home] Using existing username/role, skipping profile fetch');
            }

        } catch (e) {
            console.error('Fetch home data error:', e);
        } finally {
            console.log('[Home] Loading complete');
            setLoading(false);
        }
    }, [navigation, username, userRole]);


    useFocusEffect(
        useCallback(() => {
            fetchNgos();
        }, [fetchNgos])
    );

    const handleDelete = async (id: string) => {
        Alert.alert('Delete NGO', 'Are you sure you want to delete this NGO?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteNgo(id);
                    fetchNgos();
                },
            },
        ]);
    };

    const filteredNgos = ngos.filter(ngo => {
        if (userRole === 'approver') return ngo.status === 'pending';
        return ngo.createdBy === currentUserId;
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.username}>{username}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={async () => {
                            await supabase.auth.signOut();
                        }}
                        style={{ padding: 8 }}
                    >
                        <Text style={{ color: '#6366f1', fontWeight: '600' }}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {userRole === 'approver' ? 'Approver Dashboard' : 'Your Dashboard'}
                    </Text>
                    <Text style={styles.cardText}>
                        {userRole === 'approver'
                            ? 'Review and approve pending NGO submissions.'
                            : 'Welcome to ShareJoy! This is your personal space.'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('NgoForm')}
                >
                    <View style={[styles.menuIconPlaceholder, { backgroundColor: '#e0e7ff' }]}>
                        <Text style={{ fontSize: 20 }}>🏢</Text>
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>Register New NGO</Text>
                        <Text style={styles.menuSubtitle}>Add NGO details to the database</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Account', { username })}
                >
                    <View style={styles.menuIconPlaceholder} />
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuTitle}>Account Settings</Text>
                        <Text style={styles.menuSubtitle}>Manage password and profile</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {userRole === 'approver' ? 'Pending Approvals' : 'My NGOs'}
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator color="#6366f1" size="large" style={{ marginTop: 20 }} />
                ) : filteredNgos.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            {userRole === 'approver' ? 'No pending approvals.' : 'You haven’t added any NGOs yet.'}
                        </Text>
                    </View>
                ) : (
                    filteredNgos.map((ngo) => (
                        <TouchableOpacity
                            key={ngo.id}
                            style={styles.ngoCard}
                            onPress={() => navigation.navigate('NgoDetails', { ngo })}
                        >
                            <View style={styles.ngoCardContent}>
                                <Text style={styles.ngoName}>{ngo.name}</Text>
                                <View style={styles.statusRow}>
                                    <Text style={styles.ngoDetails}>{ngo.address}, {ngo.state}</Text>
                                    <View style={[
                                        styles.badge,
                                        userRole === 'approver' ? { backgroundColor: '#fff7ed', borderColor: '#fdba74' } :
                                            ngo.status === 'approved' ? { backgroundColor: '#dcfce7', borderColor: '#86efac' } :
                                                ngo.status === 'rejected' ? { backgroundColor: '#fee2e2', borderColor: '#fca5a5' } :
                                                    { backgroundColor: '#fff7ed', borderColor: '#fdba74' }
                                    ]}>
                                        <Text style={[
                                            styles.badgeText,
                                            userRole === 'approver' ? { color: '#c2410c' } :
                                                ngo.status === 'approved' ? { color: '#166534' } :
                                                    ngo.status === 'rejected' ? { color: '#991b1b' } :
                                                        { color: '#c2410c' }
                                        ]}>
                                            {userRole === 'approver' ? 'Pending' : ngo.status.charAt(0).toUpperCase() + ngo.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.ngoContact}>Contact: {ngo.contactPerson} ({ngo.phone})</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(ngo.id)} style={styles.deleteButton}>
                                <Text style={styles.deleteButtonText}>🗑️</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    greeting: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    username: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
        marginTop: 4,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
        gap: 16,
    },
    card: {
        backgroundColor: '#6366f1',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 8,
    },
    cardTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    cardText: {
        color: '#e0e7ff',
        fontSize: 15,
        lineHeight: 22,
    },
    menuItem: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuIconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 2,
    },
    chevron: {
        fontSize: 24,
        color: '#cbd5e1',
        fontWeight: '300',
    },
    sectionHeader: {
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#334155',
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
    },
    emptyStateText: {
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    ngoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    ngoCardContent: {
        flex: 1,
    },
    ngoName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    ngoDetails: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 2,
    },
    ngoContact: {
        fontSize: 12,
        color: '#94a3b8',
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    deleteButtonText: {
        fontSize: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    badge: {
        backgroundColor: '#fff7ed',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fdba74',
    },
    badgeText: {
        fontSize: 10,
        color: '#c2410c',
        fontWeight: '700',
    },
});
