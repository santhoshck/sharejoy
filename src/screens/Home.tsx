import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp } from '@react-navigation/native';

interface HomeProps {
    navigation: NavigationProp<any>;
    route: { params: { username: string } };
}

export default function Home({ navigation, route }: HomeProps) {
    const { username } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello,</Text>
                <Text style={styles.username}>{username}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Your Dashboard</Text>
                    <Text style={styles.cardText}>
                        Welcome to ShareJoy! This is your personal space.
                    </Text>
                </View>

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
            </View>
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
        marginBottom: 16,
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
});
