import { useContext, createContext } from 'react';
import { DependencyContainer } from '../services/dependency-injection/dependency-container';
import { createConfiguredContainer } from '../services/dependency-injection/container-setup';

// Create the context for the DependencyContainer.
// It can hold a DependencyContainer instance or be null initially.
const ContainerContext = createContext<DependencyContainer | null>(null);

/**
 * Provides a DependencyContainer to its children components.
 * If a container is not provided, it creates a default configured container.
 *
 * NOTE TO USER: If you are seeing unusual TypeScript errors like "Operator '>' cannot be applied to types..."
 * or "Operator '<' cannot be applied to types 'boolean' and 'RegExp'",
 * these errors are typically NOT caused by this code's syntax, which is standard.
 * Instead, please check your development environment:
 * 1. Restart your IDE/code editor.
 * 2. Ensure your tsconfig.json is correctly configured for a React project (e.g., "jsx": "react-jsx").
 * 3. Delete node_modules and package-lock.json/yarn.lock, then run npm install/yarn install again.
 * 4. Perform a clean build of your project.
 */
export const ContainerProvider = ({
  children,
  container
}: {
  children: React.ReactNode;
  container?: DependencyContainer;
}) => {
  const defaultContainer = container || createConfiguredContainer({
    storageType: 'memory',
    errorRecoveryLevel: 'permissive'
  });

  return (
    <ContainerContext.Provider value={defaultContainer}>
      {children}
    </ContainerContext.Provider>
  );
};


/**
 * A custom hook to access the DependencyContainer from the context.
 * Throws an error if used outside of a ContainerProvider.
 */
export const useContainer = (): DependencyContainer => {
  // Attempt to get the container from the context.
  const container = useContext(ContainerContext);

  // If no container is found in the context, it means the hook was used outside the provider.
  if (!container) {
    throw new Error('useContainer must be used within a ContainerProvider');
  }

  // Return the found DependencyContainer.
  return container;
};
