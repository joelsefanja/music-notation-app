# Code Organization Refactor Design

## Overview

This design outlines the reorganization of the music notation app's file structure to improve maintainability and follow best practices. The refactoring will focus on creating a cleaner, more intuitive folder structure with shorter file names and better organization.

## Architecture

### Current Structure Analysis

```
src/
├── services/
│   ├── __tests__/
│   │   ├── ChordProAnnotationParser.test.ts
│   │   ├── OnSongAnnotationParser.test.ts
│   │   ├── PCOAnnotationParser.test.ts
│   │   ├── SongbookAnnotationParser.test.ts
│   │   └── section-parser.test.ts
│   └── parsers/
│       ├── annotation/
│       │   ├── ChordPro.ts
│       │   ├── GuitarTabs.ts
│       │   ├── OnSong.ts
│       │   ├── PlanningCenter.ts
│       │   └── Songbook.ts
│       └── core/
│           ├── BaseParser.ts
│           ├── IParser.ts
│           └── section-parser.ts
├── types/
│   ├── __tests__/
│   ├── annotation-parser.ts
│   ├── chord.types.ts
│   ├── chordsheet.types.ts
│   ├── error.types.ts
│   ├── format.types.ts
│   ├── index.ts
│   ├── metadata.types.ts
│   └── section.types.ts
```

### Proposed New Structure

```
src/
├── parsers/
│   ├── __tests__/
│   │   ├── annotations/
│   │   │   ├── chord-pro.test.ts
│   │   │   ├── guitar-tabs.test.ts
│   │   │   ├── on-song.test.ts
│   │   │   ├── planning-center.test.ts
│   │   │   └── songbook.test.ts
│   │   └── section-parser.test.ts
│   ├── annotations/
│   │   ├── chord-pro.ts
│   │   ├── guitar-tabs.ts
│   │   ├── on-song.ts
│   │   ├── planning-center.ts
│   │   └── songbook.ts
│   ├── core/
│   │   ├── base-parser.ts
│   │   ├── parser.interface.ts
│   │   └── section-parser.ts
│   └── index.ts
├── types/
│   ├── __tests__/
│   │   ├── chord.test.ts
│   │   ├── chordsheet.test.ts
│   │   ├── error.test.ts
│   │   ├── format.test.ts
│   │   ├── metadata.test.ts
│   │   └── section.test.ts
│   ├── annotation.ts
│   ├── chord.ts
│   ├── chordsheet.ts
│   ├── error.ts
│   ├── format.ts
│   ├── index.ts
│   ├── metadata.ts
│   └── section.ts
```

## Components and Interfaces

### File Naming Conventions

1. **Kebab-case for all files**: `chord-pro.ts`, `section-parser.ts`
2. **Remove redundant suffixes**: `chord.ts` instead of `chord.types.ts`
3. **Descriptive but concise names**: `planning-center.ts` instead of `PlanningCenter.ts`
4. **Consistent test naming**: `chord-pro.test.ts` matches `chord-pro.ts`

### Folder Organization

1. **Move parsers to root level**: `src/parsers/` instead of `src/services/parsers/`
2. **Co-locate tests**: Tests in `__tests__/` folders within their respective domains
3. **Group by functionality**: Annotations, core parsers, types each in their own folders
4. **Minimize nesting**: Avoid deep folder hierarchies

### Import Path Strategy

1. **Barrel exports**: Use `index.ts` files to provide clean import paths
2. **Relative imports**: Use relative paths for internal module imports
3. **Absolute imports**: Use absolute paths from `src/` for cross-domain imports

## Data Models

### File Mapping

| Current Path | New Path | Reason |
|--------------|----------|---------|
| `src/services/parsers/annotation/ChordPro.ts` | `src/parsers/annotations/chord-pro.ts` | Shorter path, kebab-case naming |
| `src/services/parsers/annotation/PlanningCenter.ts` | `src/parsers/annotations/planning-center.ts` | Consistent naming convention |
| `src/services/parsers/core/BaseParser.ts` | `src/parsers/core/base-parser.ts` | Kebab-case naming |
| `src/services/parsers/core/IParser.ts` | `src/parsers/core/parser.interface.ts` | More descriptive interface naming |
| `src/types/chord.types.ts` | `src/types/chord.ts` | Remove redundant suffix |
| `src/services/__tests__/ChordProAnnotationParser.test.ts` | `src/parsers/__tests__/annotations/chord-pro.test.ts` | Co-locate with source, consistent naming |

### Export Strategy

#### Parser Index (`src/parsers/index.ts`)
```typescript
// Annotation parsers
export { ChordProParser } from './annotations/chord-pro';
export { OnSongParser } from './annotations/on-song';
export { PlanningCenterParser } from './annotations/planning-center';
export { SongbookParser } from './annotations/songbook';
export { GuitarTabsParser } from './annotations/guitar-tabs';

// Core parsers
export { SectionParser } from './core/section-parser';
export { BaseParser } from './core/base-parser';
export type { IParser } from './core/parser.interface';
```

#### Types Index (`src/types/index.ts`)
```typescript
// Core types
export * from './chord';
export * from './section';
export * from './metadata';
export * from './chordsheet';
export * from './format';
export * from './error';
export * from './annotation';
```

## Error Handling

### Migration Risks

1. **Broken imports**: All import statements must be updated
2. **Build failures**: TypeScript compilation may fail during transition
3. **Test failures**: Test imports and paths must be updated
4. **IDE confusion**: Development tools may need to refresh

### Mitigation Strategies

1. **Incremental migration**: Move files in logical groups
2. **Automated import updates**: Use find-and-replace for import paths
3. **Validation at each step**: Run build and tests after each group of changes
4. **Rollback plan**: Keep git commits small for easy rollback

## Testing Strategy

### Test Organization

1. **Mirror source structure**: Tests follow the same folder organization as source
2. **Co-location**: Tests are near their corresponding source files
3. **Consistent naming**: Test files match source file names with `.test.ts` suffix

### Validation Steps

1. **Build validation**: `npm run build` must succeed
2. **Test validation**: `npm test` must pass all tests
3. **Type checking**: `tsc --noEmit` must pass
4. **Linting**: `npm run lint` must pass

### Test File Migrations

| Current Test | New Location | Updates Needed |
|--------------|--------------|----------------|
| `src/services/__tests__/ChordProAnnotationParser.test.ts` | `src/parsers/__tests__/annotations/chord-pro.test.ts` | Import paths, class names |
| `src/services/__tests__/section-parser.test.ts` | `src/parsers/__tests__/section-parser.test.ts` | Import paths |
| `src/types/__tests__/chord.types.test.ts` | `src/types/__tests__/chord.test.ts` | File name, import paths |

## Implementation Phases

### Phase 1: Prepare New Structure
- Create new folder structure
- Create index files with barrel exports

### Phase 2: Move Parser Files
- Move annotation parsers with updated names
- Move core parsers with updated names
- Update internal imports within parsers

### Phase 3: Move Type Files
- Move and rename type files
- Update type exports and imports

### Phase 4: Move and Update Tests
- Move test files to new locations
- Update test imports and references
- Validate all tests pass

### Phase 5: Update External References
- Update any remaining imports in other parts of the codebase
- Update barrel exports
- Final validation

### Phase 6: Cleanup
- Remove old empty folders
- Update any documentation or configuration files
- Final build and test validation