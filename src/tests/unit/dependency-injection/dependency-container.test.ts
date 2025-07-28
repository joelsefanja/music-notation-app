/**
 * Unit tests for Dependency Injection Container
 * Tests constructor injection pattern and service lifecycle
 */

import { DependencyContainer } from '../../../services/dependency-injection/dependency-container';

// Mock classes for testing
class MockService {
  constructor(public name: string = 'MockService') {}
  
  getName(): string {
    return this.name;
  }
}

class MockDependentService {
  constructor(private dependency: MockService) {}
  
  getDependencyName(): string {
    return this.dependency.getName();
  }
}

class MockDisposableService {
  public disposed = false;
  
  dispose(): void {
    this.disposed = true;
  }
}

describe('DependencyContainer', () => {
  let container: DependencyContainer;

  beforeEach(() => {
    container = new DependencyContainer();
  });

  afterEach(() => {
    container.dispose();
  });

  describe('register', () => {
    it('should register transient services', () => {
      container.register('MockService', () => new MockService());
      
      expect(container.isRegistered('MockService')).toBe(true);
    });

    it('should throw error when registering duplicate token', () => {
      container.register('MockService', () => new MockService());
      
      expect(() => {
        container.register('MockService', () => new MockService());
      }).toThrow("Token 'MockService' is already registered");
    });

    it('should create new instances for transient services', () => {
      container.register('MockService', () => new MockService());
      
      const instance1 = container.resolve<MockService>('MockService');
      const instance2 = container.resolve<MockService>('MockService');
      
      expect(instance1).not.toBe(instance2);
      expect(instance1.getName()).toBe('MockService');
      expect(instance2.getName()).toBe('MockService');
    });
  });

  describe('registerSingleton', () => {
    it('should register singleton services', () => {
      container.registerSingleton('MockService', () => new MockService());
      
      expect(container.isRegistered('MockService')).toBe(true);
    });

    it('should return same instance for singleton services', () => {
      container.registerSingleton('MockService', () => new MockService());
      
      const instance1 = container.resolve<MockService>('MockService');
      const instance2 = container.resolve<MockService>('MockService');
      
      expect(instance1).toBe(instance2);
    });

    it('should throw error when registering duplicate singleton token', () => {
      container.registerSingleton('MockService', () => new MockService());
      
      expect(() => {
        container.registerSingleton('MockService', () => new MockService());
      }).toThrow("Token 'MockService' is already registered");
    });
  });

  describe('resolve', () => {
    it('should resolve registered services', () => {
      container.register('MockService', () => new MockService('TestService'));
      
      const instance = container.resolve<MockService>('MockService');
      
      expect(instance).toBeInstanceOf(MockService);
      expect(instance.getName()).toBe('TestService');
    });

    it('should throw error for unregistered services', () => {
      expect(() => {
        container.resolve('UnregisteredService');
      }).toThrow("No registration found for token 'UnregisteredService'");
    });

    it('should handle dependency injection', () => {
      container.registerSingleton('MockService', () => new MockService('Dependency'));
      container.register('MockDependentService', () => {
        const dependency = container.resolve<MockService>('MockService');
        return new MockDependentService(dependency);
      });
      
      const instance = container.resolve<MockDependentService>('MockDependentService');
      
      expect(instance.getDependencyName()).toBe('Dependency');
    });
  });

  describe('isRegistered', () => {
    it('should return true for registered services', () => {
      container.register('MockService', () => new MockService());
      
      expect(container.isRegistered('MockService')).toBe(true);
    });

    it('should return false for unregistered services', () => {
      expect(container.isRegistered('UnregisteredService')).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should unregister services', () => {
      container.register('MockService', () => new MockService());
      
      expect(container.isRegistered('MockService')).toBe(true);
      
      const result = container.unregister('MockService');
      
      expect(result).toBe(true);
      expect(container.isRegistered('MockService')).toBe(false);
    });

    it('should return false for unregistered services', () => {
      const result = container.unregister('UnregisteredService');
      
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all registrations', () => {
      container.register('Service1', () => new MockService());
      container.registerSingleton('Service2', () => new MockService());
      
      expect(container.getRegisteredTokens()).toHaveLength(2);
      
      container.clear();
      
      expect(container.getRegisteredTokens()).toHaveLength(0);
    });
  });

  describe('getRegisteredTokens', () => {
    it('should return all registered tokens', () => {
      container.register('Service1', () => new MockService());
      container.registerSingleton('Service2', () => new MockService());
      
      const tokens = container.getRegisteredTokens();
      
      expect(tokens).toContain('Service1');
      expect(tokens).toContain('Service2');
      expect(tokens).toHaveLength(2);
    });

    it('should return empty array when no services registered', () => {
      const tokens = container.getRegisteredTokens();
      
      expect(tokens).toEqual([]);
    });
  });

  describe('registerValue', () => {
    it('should register values directly', () => {
      const value = { name: 'TestValue' };
      container.registerValue('TestValue', value);
      
      const resolved = container.resolve('TestValue');
      
      expect(resolved).toBe(value);
    });
  });

  describe('registerClass', () => {
    it('should register class constructors without dependencies', () => {
      container.registerClass('MockService', MockService);
      
      const instance = container.resolve<MockService>('MockService');
      
      expect(instance).toBeInstanceOf(MockService);
    });

    it('should register class constructors with dependencies', () => {
      container.registerSingleton('MockService', () => new MockService('Dependency'));
      container.registerClass('MockDependentService', MockDependentService, ['MockService']);
      
      const instance = container.resolve<MockDependentService>('MockDependentService');
      
      expect(instance.getDependencyName()).toBe('Dependency');
    });

    it('should register as singleton when specified', () => {
      container.registerClass('MockService', MockService, [], true);
      
      const instance1 = container.resolve<MockService>('MockService');
      const instance2 = container.resolve<MockService>('MockService');
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('createChild', () => {
    it('should create child container with inherited registrations', () => {
      container.register('MockService', () => new MockService('Parent'));
      
      const child = container.createChild();
      
      expect(child.isRegistered('MockService')).toBe(true);
      
      const instance = child.resolve<MockService>('MockService');
      expect(instance.getName()).toBe('Parent');
    });

    it('should allow child to override parent registrations', () => {
      container.register('MockService', () => new MockService('Parent'));
      
      const child = container.createChild();
      child.unregister('MockService');
      child.register('MockService', () => new MockService('Child'));
      
      const parentInstance = container.resolve<MockService>('MockService');
      const childInstance = child.resolve<MockService>('MockService');
      
      expect(parentInstance.getName()).toBe('Parent');
      expect(childInstance.getName()).toBe('Child');
    });
  });

  describe('dispose', () => {
    it('should dispose singleton instances with dispose method', () => {
      const disposableService = new MockDisposableService();
      container.registerValue('DisposableService', disposableService);
      
      expect(disposableService.disposed).toBe(false);
      
      container.dispose();
      
      expect(disposableService.disposed).toBe(true);
    });

    it('should clear all registrations on dispose', () => {
      container.register('Service1', () => new MockService());
      container.registerSingleton('Service2', () => new MockService());
      
      expect(container.getRegisteredTokens()).toHaveLength(2);
      
      container.dispose();
      
      expect(container.getRegisteredTokens()).toHaveLength(0);
    });

    it('should not throw when disposing services without dispose method', () => {
      container.registerSingleton('MockService', () => new MockService());
      
      expect(() => container.dispose()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle factory function errors', () => {
      container.register('FailingService', () => {
        throw new Error('Factory failed');
      });
      
      expect(() => {
        container.resolve('FailingService');
      }).toThrow('Factory failed');
    });

    it('should handle circular dependencies gracefully', () => {
      container.register('ServiceA', () => {
        const serviceB = container.resolve('ServiceB');
        return { name: 'A', dependency: serviceB };
      });
      
      container.register('ServiceB', () => {
        const serviceA = container.resolve('ServiceA');
        return { name: 'B', dependency: serviceA };
      });
      
      expect(() => {
        container.resolve('ServiceA');
      }).toThrow(); // Should throw due to circular dependency
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple levels of dependencies', () => {
      container.registerSingleton('Level1', () => ({ level: 1 }));
      container.register('Level2', () => ({
        level: 2,
        dependency: container.resolve('Level1')
      }));
      container.register('Level3', () => ({
        level: 3,
        dependency: container.resolve('Level2')
      }));
      
      const level3 = container.resolve<any>('Level3');
      
      expect(level3.level).toBe(3);
      expect(level3.dependency.level).toBe(2);
      expect(level3.dependency.dependency.level).toBe(1);
    });

    it('should maintain singleton behavior across complex dependency graphs', () => {
      container.registerSingleton('SharedService', () => new MockService('Shared'));
      container.register('ServiceA', () => ({
        name: 'A',
        shared: container.resolve<MockService>('SharedService')
      }));
      container.register('ServiceB', () => ({
        name: 'B',
        shared: container.resolve<MockService>('SharedService')
      }));
      
      const serviceA = container.resolve<any>('ServiceA');
      const serviceB = container.resolve<any>('ServiceB');
      
      expect(serviceA.shared).toBe(serviceB.shared);
    });
  });
});