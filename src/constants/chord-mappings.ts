/**
 * Comprehensive chord mapping tables for all 12 major and minor keys
 */

// Chromatic scale with both sharp and flat representations
export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Mapping van noten naar hun positie in de chromatische schaal
export const NOTE_TO_CHROMATIC_INDEX: { [key: string]: number } = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Major keys and their corresponding notes (using sharps/flats as appropriate)
export const MAJOR_KEY_SIGNATURES: Record<string, string[]> = {
  'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
  'C#': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
  'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  'Db': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  'Gb': ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
  'Cb': ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb']
};

// Minor keys and their corresponding notes
export const MINOR_KEY_SIGNATURES: Record<string, string[]> = {
  'Am': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  'Em': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
  'Bm': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
  'F#m': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'],
  'C#m': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'],
  'G#m': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'],
  'D#m': ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#'],
  'A#m': ['A#', 'B#', 'C#', 'D#', 'E#', 'F#', 'G#'],
  'Dm': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
  'Gm': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
  'Cm': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
  'Fm': ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'],
  'Bbm': ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'],
  'Ebm': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'],
  'Abm': ['Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb', 'Gb']
};

// Nashville Number System mappings for major keys
export const NASHVILLE_MAJOR_MAPPINGS: Record<string, Record<string, string>> = {};

// Nashville Number System mappings for minor keys
export const NASHVILLE_MINOR_MAPPINGS: Record<string, Record<string, string>> = {};

// Initialize Nashville mappings for major keys
Object.keys(MAJOR_KEY_SIGNATURES).forEach(key => {
  const scale = MAJOR_KEY_SIGNATURES[key];
  NASHVILLE_MAJOR_MAPPINGS[key] = {
    [scale[0]]: '1',
    [scale[1]]: '2',
    [scale[2]]: '3',
    [scale[3]]: '4',
    [scale[4]]: '5',
    [scale[5]]: '6',
    [scale[6]]: '7'
  };
  // Voeg chromatische noten toe aan de mappings voor majeurtoonsoorten
  CHROMATIC_NOTES.forEach((note, index) => {
    if (!NASHVILLE_MAJOR_MAPPINGS[key][note]) {
      // Bereken het diatonische interval en voeg een accidental toe
      // Dit is een vereenvoudigde logica. De `getChromaticNashvilleNumber` in nashville-converter.ts
      // zal een nauwkeurigere berekening uitvoeren.
      const rootIndex = CHROMATIC_NOTES.indexOf(scale[0]);
      const relativeIndex = (index - rootIndex + 12) % 12;
      let nashvilleNumber = '';
      let accidental = '';

      // Zoek de dichtstbijzijnde diatonische graad
      let closestDegree = 0;
      let minDistance = 12;

      for (let i = 0; i < scale.length; i++) {
        const scaleNoteIndex = CHROMATIC_NOTES.indexOf(scale[i]);
        const distance = (index - scaleNoteIndex + 12) % 12;
        if (distance === 0) { // Exacte match
          nashvilleNumber = (i + 1).toString();
          minDistance = 0;
          break;
        } else if (distance === 1) { // Een halve toon hoger
          if (minDistance > 1) {
            minDistance = 1;
            closestDegree = i + 1;
            accidental = '#';
          }
        } else if (distance === 11) { // Een halve toon lager (of -1)
          if (minDistance > 1) {
            minDistance = 1;
            closestDegree = i + 1;
            accidental = 'b';
          }
        }
      }

      if (minDistance === 0) {
        // Al afgehandeld
      } else if (minDistance === 1) {
        nashvilleNumber = accidental + closestDegree;
      } else {
        // Fallback voor noten die niet direct in de schaal of als #/b van een schaalnoot vallen
        // Dit zou minder vaak moeten voorkomen met de verbeterde getChromaticNashvilleNumber
        // We kunnen hier een generieke mapping toevoegen of het overlaten aan de runtime logica
      }

      if (nashvilleNumber) {
        NASHVILLE_MAJOR_MAPPINGS[key][note] = nashvilleNumber;
      }
    }
  });
});

// Initialize Nashville mappings for minor keys
Object.keys(MINOR_KEY_SIGNATURES).forEach(key => {
  const scale = MINOR_KEY_SIGNATURES[key];
  NASHVILLE_MINOR_MAPPINGS[key] = {
    [scale[0]]: '1m',
    [scale[1]]: '2°',
    [scale[2]]: 'b3', // Natuurlijke mineur 3e graad
    [scale[3]]: '4m',
    [scale[4]]: '5m',
    [scale[5]]: 'b6', // Natuurlijke mineur 6e graad
    [scale[6]]: 'b7'  // Natuurlijke mineur 7e graad
  };
  // Voeg chromatische noten toe aan de mappings voor mineurtoonsoorten
  CHROMATIC_NOTES.forEach((note, index) => {
    if (!NASHVILLE_MINOR_MAPPINGS[key][note]) {
      // Bereken het diatonische interval en voeg een accidental toe
      const rootIndex = CHROMATIC_NOTES.indexOf(scale[0]);
      const relativeIndex = (index - rootIndex + 12) % 12;
      let nashvilleNumber = '';
      let accidental = '';

      let closestDegree = 0;
      let minDistance = 12;

      for (let i = 0; i < scale.length; i++) {
        const scaleNoteIndex = CHROMATIC_NOTES.indexOf(scale[i]);
        const distance = (index - scaleNoteIndex + 12) % 12;
        if (distance === 0) {
          nashvilleNumber = (i + 1).toString();
          minDistance = 0;
          break;
        } else if (distance === 1) {
          if (minDistance > 1) {
            minDistance = 1;
            closestDegree = i + 1;
            accidental = '#';
          }
        } else if (distance === 11) {
          if (minDistance > 1) {
            minDistance = 1;
            closestDegree = i + 1;
            accidental = 'b';
          }
        }
      }

      if (minDistance === 0) {
        // Al afgehandeld
      } else if (minDistance === 1) {
        nashvilleNumber = accidental + closestDegree;
      }

      if (nashvilleNumber) {
        NASHVILLE_MINOR_MAPPINGS[key][note] = nashvilleNumber;
      }
    }
  });
});


// Chord quality mappings
export const CHORD_QUALITIES: Record<string, string> = {
  '': 'maj',
  'maj': 'maj',
  'major': 'maj',
  'M': 'maj',
  'm': 'min',
  'min': 'min',
  'minor': 'min',
  '-': 'min',
  'dim': 'dim',
  '°': 'dim',
  'aug': 'aug',
  '+': 'aug',
  'sus': 'sus4',
  'sus4': 'sus4',
  'sus2': 'sus2'
};

// Common chord extensions
export const CHORD_EXTENSIONS = [
  '7', 'maj7', 'M7', '9', 'maj9', 'M9', '11', 'maj11', 'M11', '13', 'maj13', 'M13',
  'add9', 'add2', 'add4', 'add11', '6', 'maj6', 'M6', '6/9',
  'sus', 'sus2', 'sus4', 'sus9',
  'b5', '#5', 'b9', '#9', '#11', 'b13',
  '7sus4', '7sus2', 'maj7sus4', 'maj7sus2',
  'dim7', 'ø7', 'm7b5', 'aug7', '+7'
];

// Enharmonic equivalents for chord root normalization
export const ENHARMONIC_EQUIVALENTS: Record<string, string> = {
  'C#': 'Db',
  'Db': 'C#',
  'D#': 'Eb',
  'Eb': 'D#',
  'F#': 'Gb',
  'Gb': 'F#',
  'G#': 'Ab',
  'Ab': 'G#',
  'A#': 'Bb',
  'Bb': 'A#',
  'E#': 'F',
  'Fb': 'E',
  'B#': 'C',
  'Cb': 'B'
};
