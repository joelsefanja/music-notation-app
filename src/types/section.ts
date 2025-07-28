import { Line } from './line';

export interface Section {
    type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro' | 'instrumental' | 'solo' | 'coda' | 'tag' | 'note' | 'unknown'; // Voeg 'note' toe voor globale opmerkingen of 'unknown'
    title?: string; // Bijv. "Verse 1:", "Chorus"
    name?: string;
    lines: Line[];
}
