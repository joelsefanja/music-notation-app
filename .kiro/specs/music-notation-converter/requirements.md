# Requirements Document

## Introduction

The Music Notation Converter is a React/Next.js web application that allows users to convert music chord sheets between different notation formats while preserving chord extensions, handling annotations, and enabling key transposition. The app supports multiple input/output formats including Nashville Number System, OnSong, Songbook Pro, ChordPro, and Guitar Tabs, with a clean monospace font interface for proper alignment.

## Requirements

### Requirement 1

**User Story:** As a musician, I want to paste chord sheets in any supported format into the app, so that I can quickly convert them to my preferred notation format.

#### Acceptance Criteria

1. WHEN a user pastes text into the input editor THEN the system SHALL automatically detect the format (Nashville, OnSong, Songbook Pro, ChordPro, or Guitar Tabs)
2. WHEN the format is detected THEN the system SHALL display the detected format to the user
3. WHEN the input contains chord notation THEN the system SHALL preserve all chord extensions (sus, sus4, sus2, 7, maj7, etc.)
4. WHEN the input contains slash chords (like 5/7) THEN the system SHALL convert them to proper notation (like G/B) in all output formats

### Requirement 2

**User Story:** As a musician, I want to transpose chord sheets to different keys, so that I can play songs in keys that suit my voice or instrument.

#### Acceptance Criteria

1. WHEN a user selects a source key THEN the system SHALL identify all chords in that key using the standard progression (1, 2m, 3m, 4, 5, 6m, 7)
2. WHEN a user selects a target key THEN the system SHALL transpose all chords to the corresponding positions in the new key
3. WHEN transposing THEN the system SHALL maintain all chord extensions and modifications
4. WHEN processing input THEN the system SHALL automatically detect the key (both major and minor) based on chord progressions
5. IF the system cannot auto-detect the key THEN the system SHALL prompt the user to manually select the key
6. WHEN transposing between keys THEN the system SHALL support all 12 major keys (C, D, E, F, G, A, B, Db, Eb, Gb, Ab, Bb) and their relative minor keys
7. WHEN auto-detecting keys THEN the system SHALL analyze chord progressions to determine if the song is in a major or minor key

### Requirement 3

**User Story:** As a musician, I want to convert between different annotation formats, so that my chord sheets work with different apps and platforms.

#### Acceptance Criteria

1. WHEN converting from OnSong format THEN the system SHALL convert annotations from `*Comment` format to the target format
2. WHEN converting from Songbook Pro format THEN the system SHALL convert annotations from `(Comment)` format to the target format  
3. WHEN converting from Planning Center format THEN the system SHALL convert annotations from `<b>Comment</b>` format to the target format
4. WHEN converting to Songbook Pro THEN the system SHALL place annotations above the verse/chorus/section
5. WHEN converting to Planning Center THEN the system SHALL place annotations next to the section heading

### Requirement 4

**User Story:** As a musician, I want proper spacing and formatting in my converted chord sheets, so that they remain readable and properly aligned.

#### Acceptance Criteria

1. WHEN displaying chord sheets THEN the system SHALL use a monospace font for proper alignment
2. WHEN converting between formats THEN the system SHALL maintain two blank lines between verses, choruses, and other sections
3. WHEN a section has an annotation THEN the system SHALL use three blank lines, then the annotation, then one blank line
4. WHEN converting Guitar Tabs format THEN the system SHALL remove square brackets from section headers and add colons (e.g., [Intro] becomes Intro:)
5. WHEN preserving empty lines in the original THEN the system SHALL maintain them in the output

### Requirement 5

**User Story:** As a musician, I want a clean and intuitive user interface, so that I can efficiently convert chord sheets without confusion.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL display a split-screen interface with input on the left and preview on the right
2. WHEN a user types or pastes content THEN the system SHALL provide real-time preview of the converted output
3. WHEN selecting output format THEN the system SHALL provide dropdown menus for format selection
4. WHEN selecting keys THEN the system SHALL provide dropdown menus with all supported keys
5. WHEN the conversion is complete THEN the system SHALL allow users to copy the output or save as text file

### Requirement 6

**User Story:** As a musician, I want to handle chord positioning accurately, so that chords align properly with lyrics in all formats.

#### Acceptance Criteria

1. WHEN processing chord lines with lyrics THEN the system SHALL store the index position of each chord
2. WHEN converting to inline formats THEN the system SHALL place chords in square brackets at the correct text positions
3. WHEN inserting chords inline THEN the system SHALL account for text position shifts caused by previous chord insertions
4. WHEN processing Intro or Instrumental sections THEN the system SHALL preserve chord-only lines as-is
5. WHEN encountering chord extensions THEN the system SHALL preserve them exactly in all output formats

### Requirement 7

**User Story:** As a developer, I want the codebase to follow best practices, so that the application is maintainable and scalable.

#### Acceptance Criteria

1. WHEN writing code THEN the system SHALL follow KISS (Keep It Simple, Stupid) principles
2. WHEN designing components THEN the system SHALL follow SOLID principles
3. WHEN implementing features THEN the system SHALL follow DRY (Don't Repeat Yourself) principles
4. WHEN organizing code THEN the system SHALL use proper folder structure with separate directories for components, utilities, and types
5. WHEN developing THEN the system SHALL include comprehensive documentation and follow software engineering best practices

### Requirement 8

**User Story:** As a musician, I want to work with metadata and song information, so that I can keep track of song details across different formats.

#### Acceptance Criteria

1. WHEN importing chord sheets THEN the system SHALL preserve any existing metadata (title, artist, key, etc.)
2. WHEN converting formats THEN the system SHALL maintain metadata in the appropriate format for the target notation system
3. WHEN exporting THEN the system SHALL include metadata in the output file
4. IF metadata is missing THEN the system SHALL allow users to add title, artist, and key information
5. WHEN saving files THEN the system SHALL use appropriate file naming conventions based on metadata