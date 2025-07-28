import { Section } from './section';
import { Metadata } from './metadata';

export interface Chordsheet {
    id: string; // Unieke ID voor het lied
    title: string;
    artist?: string;
    originalKey: string; // Originele toonsoort van het lied (e.g., 'C', 'Am')
    sections: Section[];
    metadata?: Metadata; // Voor algemene liedinformatie (src/types/metadata.ts)
}
