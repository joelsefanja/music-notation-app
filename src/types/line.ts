
export enum LineType {
  TEXT = 'TEXT',
  EMPTY = 'EMPTY',
  ANNOTATION = 'ANNOTATION',
  CHORD_LYRICS = 'CHORD_LYRICS',
  METADATA = 'METADATA',
  SECTION_HEADER = 'SECTION_HEADER'
}

export interface BaseLine {
  type: LineType;
  id: string;
  content: string;
}

export interface TextLine extends BaseLine {
  type: LineType.TEXT;
  chords?: Array<{
    position: number;
    chord: string;
  }>;
}

export interface EmptyLine extends BaseLine {
  type: LineType.EMPTY;
  count?: number;
}

export interface AnnotationLine extends BaseLine {
  type: LineType.ANNOTATION;
  annotationType: 'comment' | 'directive' | 'instruction' | 'title' | 'artist' | 'key' | 'tempo' | 'capo';
}

export interface ChordLyricsLine extends BaseLine {
  type: LineType.CHORD_LYRICS;
  lyrics: string;
  chords: Array<{
    position: number;
    chord: string;
  }>;
}

export interface MetadataLine extends BaseLine {
  type: LineType.METADATA;
  key: string;
  value: string;
}

export interface SectionHeaderLine extends BaseLine {
  type: LineType.SECTION_HEADER;
  sectionName: string;
  sectionType: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'instrumental' | 'solo' | 'pre-chorus' | 'tag' | 'coda';
}

export type Line = TextLine | EmptyLine | AnnotationLine | ChordLyricsLine | MetadataLine | SectionHeaderLine;

export interface LineRenderProps {
  line: Line;
  className?: string;
  showChords?: boolean;
  transposeKey?: string;
}
