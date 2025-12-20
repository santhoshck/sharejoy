import AsyncStorage from '@react-native-async-storage/async-storage';
import { NGO } from './types';

const NGO_KEY = 'SHAREJOY_NGOS';

export const getNgos = async (): Promise<NGO[]> => {
    try {
        const json = await AsyncStorage.getItem(NGO_KEY);
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.warn('Failed to load NGOs', e);
        return [];
    }
};

export const addNgo = async (ngo: NGO): Promise<void> => {
    try {
        const ngos = await getNgos();
        ngos.unshift(ngo);
        await AsyncStorage.setItem(NGO_KEY, JSON.stringify(ngos));
    } catch (e) {
        console.warn('Failed to save NGO', e);
        throw e;
    }
};

export const updateNgo = async (updatedNgo: NGO): Promise<void> => {
    try {
        const ngos = await getNgos();
        const index = ngos.findIndex((n) => n.id === updatedNgo.id);
        if (index !== -1) {
            ngos[index] = updatedNgo;
            await AsyncStorage.setItem(NGO_KEY, JSON.stringify(ngos));
        } else {
            console.warn('NGO not found for update');
        }
    } catch (e) {
        console.warn('Failed to update NGO', e);
        throw e;
    }
};

export const deleteNgo = async (id: string): Promise<void> => {
    try {
        const ngos = await getNgos();
        const filtered = ngos.filter((n) => n.id !== id);
        await AsyncStorage.setItem(NGO_KEY, JSON.stringify(filtered));
    } catch (e) {
        console.warn('Failed to delete NGO', e);
        throw e;
    }
};
