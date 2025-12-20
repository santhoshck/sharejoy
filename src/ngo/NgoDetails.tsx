import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NGO } from './types';
import { getNgos } from './storage';

type RootStackParamList = {
    NgoDetails: { ngo: NGO };
    NgoForm: { ngo: NGO };
};

type NgoDetailsRouteProp = RouteProp<RootStackParamList, 'NgoDetails'>;

interface NgoDetailsProps {
    navigation: NavigationProp<any>;
    route: NgoDetailsRouteProp;
}

export default function NgoDetails({ navigation, route }: NgoDetailsProps) {
    // Initialize with param, but we might want to refresh from storage if it was edited
    const [ngo, setNgo] = useState<NGO>(route.params.ngo);

    // Refresh data when screen comes into focus in case it was edited
    useFocusEffect(
        React.useCallback(() => {
            const refreshNgo = async () => {
                const ngos = await getNgos();
                const updated = ngos.find(n => n.id === ngo.id);
                if (updated) {
                    setNgo(updated);
                }
            };
            refreshNgo();
        }, [ngo.id])
    );

    const handleEdit = () => {
        navigation.navigate('NgoForm', { ngo });
    };

    const openLink = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", `Cannot open URL: ${url}`);
            }
        } catch (error) {
            console.error("Failed to open link:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{ngo.name}</Text>
                <TouchableOpacity
                    onPress={handleEdit}
                    style={styles.editButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>{ngo.name}</Text>
                    {ngo.website ? (
                        <TouchableOpacity onPress={() => openLink(ngo.website)}>
                            <Text style={styles.heroWebsite}>{ngo.website}</Text>
                        </TouchableOpacity>
                    ) : null}
                    <View style={styles.tagContainer}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{ngo.state}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.sectionText}>{ngo.description || "No description provided."}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    <InfoRow label="Person" value={ngo.contactPerson} icon="👤" />
                    <InfoRow label="Phone" value={ngo.phone} icon="📞" onPress={() => openLink(`tel:${ngo.phone}`)} />
                    <InfoRow label="Email" value={ngo.email} icon="✉️" onPress={() => openLink(`mailto:${ngo.email}`)} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <Text style={styles.addressText}>{ngo.address}</Text>
                    <Text style={styles.addressText}>{ngo.state} - {ngo.pin}</Text>
                </View>

                <Text style={styles.footerText}>Added on {new Date(ngo.createdAt).toLocaleDateString()}</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const InfoRow = ({ label, value, icon, onPress }: { label: string, value: string, icon: string, onPress?: () => void }) => {
    if (!value) return null;

    return (
        <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress}>
            <View style={styles.infoIcon}>
                <Text style={{ fontSize: 18 }}>{icon}</Text>
            </View>
            <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={[styles.infoValue, onPress && styles.linkText]}>{value}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        backgroundColor: '#f1f5f9',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    backButtonText: {
        color: '#64748b',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    editButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    editButtonText: {
        color: '#6366f1',
        fontWeight: '600',
        fontSize: 16,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: '#6366f1',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    heroWebsite: {
        color: '#e0e7ff',
        fontSize: 16,
        textDecorationLine: 'underline',
        marginBottom: 16,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
    },
    tagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 16,
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#475569',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    linkText: {
        color: '#6366f1',
    },
    addressText: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
    },
    footerText: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 13,
        marginTop: 16,
    }
});
