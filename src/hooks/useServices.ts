/**
 * React hooks for accessing SOLID architecture services
 * Provides type-safe, convenient access to all services
 */

import { useMemo } from 'react';
import { useContainer } from './useContainer';
import { DI_TOKENS } from '../services/dependency-injection/dependency-container';
import { 
  IConversionEngine,
  IChordFactory,
  IKeyTransposer,
  IEventManager,
  IStorageService
} from '../types/interfaces/core-interfaces';

/**
 * Hook to access the ConversionEngine service
 */
export const useConversionEngine = (): IConversionEngine => {
  const container = useContainer();
  
  return useMemo(() => {
    return container.resolve<IConversionEngine>(DI_TOKENS.CONVERSION_ENGINE);
  }, [container]);
};

/**
 * Hook to access the ChordFactory service
 */
export const useChordFactory = (): IChordFactory => {
  const container = useContainer();
  
  return useMemo(() => {
    return container.resolve<IChordFactory>(DI_TOKENS.CHORD_FACTORY);
  }, [container]);
};

/**
 * Hook to access the KeyTransposer service
 */
export const useKeyTransposer = (): IKeyTransposer => {
  const container = useContainer();
  
  return useMemo(() => {
    return container.resolve<IKeyTransposer>(DI_TOKENS.KEY_TRANSPOSER);
  }, [container]);
};

/**
 * Hook to access the EventManager service
 */
export const useEventManager = (): IEventManager => {
  const container = useContainer();
  
  return useMemo(() => {
    return container.resolve<IEventManager>(DI_TOKENS.EVENT_MANAGER);
  }, [container]);
};

/**
 * Hook to access the StorageService
 */
export const useStorageService = (): IStorageService => {
  const container = useContainer();
  
  return useMemo(() => {
    return container.resolve<IStorageService>(DI_TOKENS.STORAGE_SERVICE);
  }, [container]);
};

/**
 * Hook to access all services at once
 */
export const useServices = () => {
  const conversionEngine = useConversionEngine();
  const chordFactory = useChordFactory();
  const keyTransposer = useKeyTransposer();
  const eventManager = useEventManager();
  const storageService = useStorageService();

  return {
    conversionEngine,
    chordFactory,
    keyTransposer,
    eventManager,
    storageService
  };
};