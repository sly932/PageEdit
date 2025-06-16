import { Modification, ModificationMethod } from './index';

export interface Eddy {
    id: string;
    name: string;
    domain: string;
    modifications: Modification[];
    lastUsed: boolean;
    createdAt: number;
    updatedAt: number;
} 