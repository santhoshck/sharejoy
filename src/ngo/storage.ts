import { supabase } from '../lib/supabase';
import { NGO } from './types';

// Helper to map DB row to NGO interface
const mapFromDb = (row: any): NGO => ({
    id: row.id,
    name: row.name,
    description: row.description,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    address: row.address,
    state: row.state,
    pin: row.pin,
    website: row.website,
    createdAt: row.created_at,
    status: row.status,
    createdBy: row.created_by,
});

// Helper to map NGO interface to DB row (Omit auto-generated fields for insert)
const mapToDb = (ngo: Partial<NGO>) => ({
    name: ngo.name,
    description: ngo.description,
    contact_person: ngo.contactPerson,
    phone: ngo.phone,
    email: ngo.email,
    address: ngo.address,
    state: ngo.state,
    pin: ngo.pin,
    website: ngo.website,
    status: ngo.status,
    created_by: ngo.createdBy,
});

export const getNgos = async (): Promise<NGO[]> => {
    try {
        const { data, error } = await supabase
            .from('ngos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapFromDb);
    } catch (e) {
        console.warn('Failed to load NGOs from Supabase', e);
        return [];
    }
};

export const addNgo = async (ngo: Partial<NGO>): Promise<void> => {
    try {
        const { error } = await supabase
            .from('ngos')
            .insert(mapToDb(ngo));
        if (error) throw error;
    } catch (e) {
        console.warn('Failed to save NGO to Supabase', e);
        throw e;
    }
};

export const updateNgo = async (updatedNgo: NGO): Promise<void> => {
    try {
        const { error } = await supabase
            .from('ngos')
            .update(mapToDb(updatedNgo))
            .eq('id', updatedNgo.id);
        if (error) throw error;
    } catch (e) {
        console.warn('Failed to update NGO in Supabase', e);
        throw e;
    }
};

export const deleteNgo = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('ngos')
            .delete()
            .eq('id', id);
        if (error) throw error;
    } catch (e) {
        console.warn('Failed to delete NGO from Supabase', e);
        throw e;
    }
};

