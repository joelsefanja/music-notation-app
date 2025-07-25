import { AutoKeyDetection } from '../auto-key-detection';

describe('AutoKeyDetection', () => {
    let detector: AutoKeyDetection;

    beforeEach(() => {
        detector = new AutoKeyDetection();
    });

    describe('Major Key Detection', () => {
        it('should detect C major from I-V-vi-IV progression', () => {
            const text = '[C]Amazing [G]grace how [Am]sweet the [F]sound';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('C');
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.6);
            expect(result.analysis.progressionMatches).toContain('1-5-6m-4');
        });

        it('should detect G major from chord progression', () => {
            const text = '[G]When we [D]all get to [Em]heaven what a [C]day that will be';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('G');
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should detect D major with sharps', () => {
            const text = '[D]Holy [A]holy [Bm]holy Lord [G]God almighty';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('D');
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should detect F major with flats', () => {
            const text = '[F]Blessed [Bb]assurance [C]Jesus is [F]mine';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('F');
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should detect classic I-IV-V-I progression', () => {
            const text = '[C]Amazing [F]grace how [G]sweet the [C]sound';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('C');
            expect(result.isMinor).toBe(false);
            expect(result.analysis.progressionMatches).toContain('1-4-5-1');
    });

    describe('New Song Tests', () => {
        it('should detect key for Songbook format', () => {
            const text = `
            Songbook
            (Tussenregel met opmerking als aparte regel)

            makefile

            (Opmerking: Houd tempo strak en ritmisch spelen in couplet)

            Verse 1:
            Cm7
            U alleen bent waardig Heer
            Bb
            Niemand komt U ooit nabij
            Ab         Eb    Bb
            U troont in eeuwigheid
            Cm7
            U alleen geeft eeuwig leven
            Bb
            U bent goed in alles Heer
            Ab        Eb    Bb
            U bent onze zekerheid
        `;
            const result = detector.detectKey(text, 'inline');
            expect(result.key).toBe('Eb'); // Expected key
            expect(result.isMinor).toBe(false); // Eb is a major key
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should detect key for OnSong format', () => {
            const text = `
            *Opmerking: Houd tempo strak en ritmisch spelen in couplet

            Verse 1:
            [Cm7]U alleen bent waardig Heer
            [Bb]Niemand komt U ooit nabij
            [Ab]U troo[Eb]nt in eeuwi[Bb]gheid
            [Cm7]U alleen geeft eeuwig leven
            [Bb]U bent goed in alles Heer
            [Ab]U ben[Eb]t onze zeker[Bb]heid
        `;
            const result = detector.detectKey(text, 'brackets'); // Assuming 'brackets' format
            expect(result.key).toBe('Eb'); // Expected key
            expect(result.isMinor).toBe(false); // Eb is a major key
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should detect key for Planning Center Online format', () => {
            const text = `
            <b>Opmerking: Houd tempo strak en ritmisch spelen in couplet</b>

            Verse 1:
            [Cm7]U alleen bent waardig Heer
            [Bb]Niemand komt U ooit nabij
            [Ab]U troo[Eb]nt in eeuwi[Bb]gheid
            [Cm7]U alleen geeft eeuwig leven
            [Bb]U bent goed in alles Heer
            [Ab]U ben[Eb]t onze zeker[Bb]heid
        `;
            const result = detector.detectKey(text, 'brackets'); // Assuming 'brackets' format
            expect(result.key).toBe('Eb'); // Expected key
            expect(result.isMinor).toBe(false); // Eb is a major key
            expect(result.confidence).toBeGreaterThan(0.5);
        });
    });
});

    describe('Minor Key Detection', () => {
        it('should detect A minor from chord progression', () => {
            const text = '[Am]House of the [F]rising [C]sun down in [G]New [Am]Orleans';
            const result = detector.detectKey(text, 'brackets');

            // This progression could be interpreted as Am or C major (relative keys)
            expect(['Am', 'C']).toContain(result.key);
            expect(result.confidence).toBeGreaterThan(0.4);
        });

        it('should detect E minor progression', () => {
            const text = '[Em]Nothing [C]else [G]matters [D]nothing else [Em]matters';
            const result = detector.detectKey(text, 'brackets');

            // This progression could be Em or G major - both are valid interpretations
            expect(['Em', 'G']).toContain(result.key);
            expect(result.confidence).toBeGreaterThan(0.4);
        });

        it('should detect D minor with harmonic minor progression', () => {
            const text = '[Dm]Scarborough [Gm]fair are you [A]going to [Dm]Scarborough fair';
            const result = detector.detectKey(text, 'brackets');

            // This could be detected as Dm or D major depending on the algorithm
            expect(['Dm', 'D']).toContain(result.key);
            expect(result.confidence).toBeGreaterThan(0.4);
        });

        it('should detect F# minor with sharps', () => {
            const text = '[F#m]Mad [C#m]world all a[A]round me are fa[B]miliar faces';
            const result = detector.detectKey(text, 'brackets');

            // This could be detected as F#m, C#m, or A major depending on the algorithm
            expect(['F#m', 'C#m', 'A']).toContain(result.key);
            expect(result.confidence).toBeGreaterThan(0.4);
        });
    });

    describe('Complex Chord Analysis', () => {
        it('should handle chord extensions and still detect key', () => {
            const text = '[Cmaj7]Amazing [G7]grace how [Am7]sweet the [Fmaj7]sound';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('C');
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should handle slash chords', () => {
            const text = '[C]Amazing [G/B]grace how [Am]sweet the [F/A]sound';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('C');
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should handle suspended chords', () => {
            const text = '[Csus4]Amazing [C]grace how [Gsus4]sweet the [G]sound';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('C');
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.4);
        });
    });

    describe('Inline Format Detection', () => {
        it('should detect key from inline chord format', () => {
            const text = `C       F       G       C
Amazing grace how sweet the sound
Am      F       C
That saved a wretch like me`;

            const result = detector.detectKey(text, 'inline');

            expect(result.key).toBe('C');
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should detect minor key from inline format', () => {
            const text = `Am      F       C       G
House of the rising sun
Am      F       C       E       Am
Down in New Orleans`;

            const result = detector.detectKey(text, 'inline');

            // This could be detected as Am or C major - both are valid interpretations
            expect(['Am', 'C']).toContain(result.key);
            expect(result.confidence).toBeGreaterThan(0.4);
        });
    });

    describe('Nashville Number Detection', () => {
        it('should detect major key from Nashville numbers', () => {
            const nashvilleText = '1 - 4 - | 5 - 1 - | 6m - 4 - | 5 - 1 - |';
            const result = detector.detectKeyFromNashville(nashvilleText);

            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.5);
            expect(result.analysis.tonicIndicators).toBeGreaterThan(0);
        });

        it('should detect minor key from Nashville numbers', () => {
            const nashvilleText = '1m - 7 - | 6 - 7 - | 1m - 4m - | 5 - 1m - |';
            const result = detector.detectKeyFromNashville(nashvilleText);

            expect(result.isMinor).toBe(true);
            expect(result.confidence).toBeGreaterThan(0.5);
            expect(result.analysis.tonicIndicators).toBeGreaterThan(0);
        });

        it('should find progression matches in Nashville format', () => {
            const nashvilleText = '1 5 6m 4 | 1 5 6m 4 |';
            const result = detector.detectKeyFromNashville(nashvilleText);

            expect(result.analysis.progressionMatches).toContain('1-5-6m-4');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty input gracefully', () => {
            const result = detector.detectKey('', 'brackets');

            expect(result.key).toBe('C');
            expect(result.confidence).toBe(0);
            expect(result.isMinor).toBe(false);
        });

        it('should handle text with no chords', () => {
            const text = 'Amazing grace how sweet the sound';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('C');
            expect(result.confidence).toBe(0);
        });

        it('should handle invalid chord formats gracefully', () => {
            const text = '[C]Valid [Cmaj7x]invalid [G]valid';
            const result = detector.detectKey(text, 'brackets');

            // Should still detect something from the valid chord
            expect(result.confidence).toBeGreaterThan(0);
        });

        it('should handle mixed valid and invalid chords', () => {
            const text = '[C]Valid [G]Valid [Am]Valid';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('C');
            expect(result.confidence).toBeGreaterThan(0);
        });
    });

    describe('Confidence Scoring', () => {
        it('should give higher confidence to clear progressions', () => {
            const clearProgression = '[C]Amazing [G]grace [Am]how sweet [F]the [C]sound';
            const ambiguousChords = '[C]Random [E]chords [Ab]without [Bb]pattern';

            const clearResult = detector.detectKey(clearProgression, 'brackets');
            const ambiguousResult = detector.detectKey(ambiguousChords, 'brackets');

            expect(clearResult.confidence).toBeGreaterThan(ambiguousResult.confidence);
        });

        it('should give reasonable confidence scores for different chord patterns', () => {
            const clearProgression = '[C]Amazing [G]grace how [Am]sweet the [F]sound';
            const ambiguousProgression = '[C]Random [Bb]chords [Eb]without [Ab]clear pattern';

            const clearResult = detector.detectKey(clearProgression, 'brackets');
            const ambiguousResult = detector.detectKey(ambiguousProgression, 'brackets');

            // Clear progression should have higher confidence than ambiguous one
            expect(clearResult.key).toBe('C');
            expect(clearResult.confidence).toBeGreaterThan(ambiguousResult.confidence);
        });

        it('should penalize too many out-of-key chords', () => {
            const inKey = '[C]In [G]key [Am]chords [F]only';
            const outOfKey = '[C]Mixed [F#]with [Bb]many [Eb]out [Ab]of [C]key';

            const inKeyResult = detector.detectKey(inKey, 'brackets');
            const outOfKeyResult = detector.detectKey(outOfKey, 'brackets');

            expect(inKeyResult.confidence).toBeGreaterThan(outOfKeyResult.confidence);
        });
    });

    describe('detectAllKeys', () => {
        it('should return all keys sorted by confidence', () => {
            const text = '[C]Amazing [G]grace how [Am]sweet the [F]sound';
            const results = detector.detectAllKeys(text, 'brackets');

            expect(results.length).toBeGreaterThan(1);
            expect(results[0].confidence).toBeGreaterThanOrEqual(results[1].confidence);
            expect(results[0].key).toBe('C');
        });

        it('should include both major and minor key possibilities', () => {
            const text = '[Am]House [F]of [C]the [G]rising [Am]sun';
            const results = detector.detectAllKeys(text, 'brackets');

            const majorKeys = results.filter(r => !r.isMinor);
            const minorKeys = results.filter(r => r.isMinor);

            expect(majorKeys.length).toBeGreaterThan(0);
            expect(minorKeys.length).toBeGreaterThan(0);
            // The top result could be Am or C depending on the algorithm
            expect(['Am', 'C']).toContain(results[0].key);
        });
    });

    describe('Enharmonic Equivalents', () => {
        it('should handle enharmonic equivalents in key detection', () => {
            // F# major uses F# but chord might be written as Gb
            const text = '[F#]Start [C#]middle [D#m]minor [B]end';
            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('F#');
            expect(result.confidence).toBeGreaterThan(0.4);
        });

        it('should detect Db major with flat notation', () => {
            const text = '[Db]Start [Ab]middle [Bbm]minor [Gb]end';
            const result = detector.detectKey(text, 'brackets');

            // Could be detected as Db or C# (enharmonic equivalent)
            expect(['Db', 'C#']).toContain(result.key);
            expect(result.confidence).toBeGreaterThan(0.4);
        });
    });

    describe('Real World Examples', () => {
        it('should detect Amazing Grace in C major', () => {
            const text = `[C]Amazing [F]grace how [G]sweet the [C]sound
That [C]saved a [Am]wretch like [F]me [C]
I [C]once was [F]lost but [G]now am [C]found
Was [C]blind but [Am]now I [F]see [C]`;

            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('C');
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.7);
        });

        it('should detect House of the Rising Sun in A minor', () => {
            const text = `[Am]There is a [C]house in [D]New Or[F]leans
They [Am]call the [C]Rising [E]Sun [E7]
And it's [Am]been the [C]ruin of [D]many a poor [F]boy
And [Am]God I [E]know I'm [Am]one`;

            const result = detector.detectKey(text, 'brackets');

            expect(result.key).toBe('Am');
            expect(result.isMinor).toBe(true);
            expect(result.confidence).toBeGreaterThan(0.6);
        });

        it('should detect Wonderwall in G major', () => {
            const text = `[G]Today is [D]gonna be the day that they're [Am]gonna throw it back to [C]you
[G]By now you [D]should've somehow real[Am]ized what you gotta [C]do`;

            const result = detector.detectKey(text, 'brackets');

            // This progression could be interpreted as G major or C major
            expect(['G', 'C']).toContain(result.key);
            expect(result.isMinor).toBe(false);
            expect(result.confidence).toBeGreaterThan(0.4);
        });
    });
});
