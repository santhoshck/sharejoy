export interface NGO {
    id: string;
    name: string;
    description: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    state: string;
    pin: string;
    website: string;
    createdAt: number;
    status: 'pending' | 'approved' | 'rejected';
    createdBy?: string;
}
