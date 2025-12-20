import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationProp } from '@react-navigation/native';
import { NGO } from './types';
import { addNgo, updateNgo } from './storage';

export default function NgoForm({ navigation, route }: { navigation: NavigationProp<any>, route: any }) {
    const existingNgo: NGO | undefined = route.params?.ngo;
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: existingNgo?.name || '',
        description: existingNgo?.description || '',
        contactPerson: existingNgo?.contactPerson || '',
        phone: existingNgo?.phone || '',
        email: existingNgo?.email || '',
        address: existingNgo?.address || '',
        state: existingNgo?.state || '',
        pin: existingNgo?.pin || '',
        website: existingNgo?.website || '',
    });

    const updateForm = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!form.name || !form.phone) {
            return Alert.alert('Missing Fields', 'Name and Phone are required.');
        }
        setLoading(true);
        try {
            if (existingNgo) {
                const updatedNgo = {
                    ...existingNgo,
                    ...form,
                };
                await updateNgo(updatedNgo);
                Alert.alert('Success', 'NGO updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                const newNgo = {
                    id: Date.now().toString(),
                    createdAt: Date.now(),
                    ...form,
                };
                await addNgo(newNgo);
                Alert.alert('Success', 'NGO added successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to save NGO');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{existingNgo ? 'Edit NGO' : 'Add New NGO'}</Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Basic Info</Text>
                        <Input label="NGO Name *" value={form.name} onChange={(v) => updateForm('name', v)} />
                        <Input label="Description" value={form.description} onChange={(v) => updateForm('description', v)} multiline />
                        <Input label="Website" value={form.website} onChange={(v) => updateForm('website', v)} autoCapitalize="none" />

                        <Text style={styles.sectionTitle}>Contact Details</Text>
                        <Input label="Contact Person" value={form.contactPerson} onChange={(v) => updateForm('contactPerson', v)} />
                        <Input label="Phone *" value={form.phone} onChange={(v) => updateForm('phone', v)} keyboardType="phone-pad" />
                        <Input label="Email" value={form.email} onChange={(v) => updateForm('email', v)} keyboardType="email-address" autoCapitalize="none" />

                        <Text style={styles.sectionTitle}>Location</Text>
                        <Input label="Address" value={form.address} onChange={(v) => updateForm('address', v)} multiline />
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Input label="State" value={form.state} onChange={(v) => updateForm('state', v)} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Input label="PIN Code" value={form.pin} onChange={(v) => updateForm('pin', v)} keyboardType="number-pad" />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>{existingNgo ? 'Update NGO' : 'Save NGO'}</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Reusable Input Component
const Input = ({
    label,
    value,
    onChange,
    multiline,
    keyboardType,
    autoCapitalize,
}: {
    label: string;
    value: string;
    onChange: (t: string) => void;
    multiline?: boolean;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
            value={value}
            onChangeText={onChange}
            multiline={multiline}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        padding: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
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
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 16,
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#0f172a',
    },
    row: {
        flexDirection: 'row',
    },
    saveButton: {
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
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
