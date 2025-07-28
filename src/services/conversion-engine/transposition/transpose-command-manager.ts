/**
 * Transpose Command Manager implementation
 * Manages command history and provides undo/redo functionality
 */

import { ITransposeCommandManager, ITransposeCommand } from '../../../types/interfaces/core-interfaces';

/**
 * Command manager that handles transpose command history and undo/redo operations
 */
export class TransposeCommandManager implements ITransposeCommandManager {
  private history: ITransposeCommand[] = [];
  private currentIndex = -1;
  private maxHistorySize: number;

  constructor(maxHistorySize = 50) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Execute a transpose command and add it to history
   */
  async executeCommand(command: ITransposeCommand): Promise<void> {
    // Validate the command before execution
    if (!command) {
      throw new Error('Command cannot be null or undefined');
    }

    try {
      // Execute the command
      await command.execute();

      // Remove any commands after current index (for redo functionality)
      this.history = this.history.slice(0, this.currentIndex + 1);

      // Add the new command to history
      this.history.push(command);
      this.currentIndex++;

      // Maintain history size limit
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentIndex--;
      }
    } catch (error) {
      throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Undo the last executed command
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo()) {
      return false;
    }

    try {
      const command = this.history[this.currentIndex];
      await command.undo();
      this.currentIndex--;
      return true;
    } catch (error) {
      throw new Error(`Failed to undo command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Redo the next command in history
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo()) {
      return false;
    }

    try {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      await command.execute();
      return true;
    } catch (error) {
      this.currentIndex--; // Rollback index on failure
      throw new Error(`Failed to redo command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex >= 0 && 
           this.currentIndex < this.history.length &&
           this.history[this.currentIndex].canUndo();
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get command history descriptions
   */
  getHistory(): string[] {
    return this.history.map(command => command.getDescription());
  }

  /**
   * Clear all command history
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get the current command (last executed)
   */
  getCurrentCommand(): ITransposeCommand | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Get the next command that would be redone
   */
  getNextCommand(): ITransposeCommand | null {
    const nextIndex = this.currentIndex + 1;
    if (nextIndex < this.history.length) {
      return this.history[nextIndex];
    }
    return null;
  }

  /**
   * Get the number of commands in history
   */
  getHistorySize(): number {
    return this.history.length;
  }

  /**
   * Get the current position in history
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get the maximum history size
   */
  getMaxHistorySize(): number {
    return this.maxHistorySize;
  }

  /**
   * Set the maximum history size
   */
  setMaxHistorySize(size: number): void {
    if (size < 1) {
      throw new Error('Maximum history size must be at least 1');
    }

    this.maxHistorySize = size;

    // Trim history if it exceeds new limit
    if (this.history.length > size) {
      const trimAmount = this.history.length - size;
      this.history.splice(0, trimAmount);
      this.currentIndex = Math.max(-1, this.currentIndex - trimAmount);
    }
  }

  /**
   * Get a summary of the command history
   */
  getHistorySummary(): {
    totalCommands: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
    undoDescription?: string;
    redoDescription?: string;
  } {
    const currentCommand = this.getCurrentCommand();
    const nextCommand = this.getNextCommand();

    return {
      totalCommands: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoDescription: currentCommand?.getDescription(),
      redoDescription: nextCommand?.getDescription()
    };
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeCommands(commands: ITransposeCommand[]): Promise<void> {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new Error('Commands array must be non-empty');
    }

    const executedCommands: ITransposeCommand[] = [];

    try {
      for (const command of commands) {
        await this.executeCommand(command);
        executedCommands.push(command);
      }
    } catch (error) {
      // Rollback all executed commands in reverse order
      for (let i = executedCommands.length - 1; i >= 0; i--) {
        try {
          await executedCommands[i].undo();
          // Remove from history
          if (this.history.length > 0 && this.currentIndex >= 0) {
            this.history.pop();
            this.currentIndex--;
          }
        } catch (rollbackError) {
          console.error('Failed to rollback command during batch execution failure:', rollbackError);
        }
      }
      throw error;
    }
  }

  /**
   * Undo multiple commands
   */
  async undoMultiple(count: number): Promise<number> {
    if (count < 1) {
      throw new Error('Count must be at least 1');
    }

    let undoneCount = 0;
    const maxUndo = Math.min(count, this.currentIndex + 1);

    for (let i = 0; i < maxUndo; i++) {
      if (await this.undo()) {
        undoneCount++;
      } else {
        break;
      }
    }

    return undoneCount;
  }

  /**
   * Redo multiple commands
   */
  async redoMultiple(count: number): Promise<number> {
    if (count < 1) {
      throw new Error('Count must be at least 1');
    }

    let redoneCount = 0;
    const maxRedo = Math.min(count, this.history.length - this.currentIndex - 1);

    for (let i = 0; i < maxRedo; i++) {
      if (await this.redo()) {
        redoneCount++;
      } else {
        break;
      }
    }

    return redoneCount;
  }

  /**
   * Get commands that can be undone
   */
  getUndoableCommands(): ITransposeCommand[] {
    return this.history.slice(0, this.currentIndex + 1).reverse();
  }

  /**
   * Get commands that can be redone
   */
  getRedoableCommands(): ITransposeCommand[] {
    return this.history.slice(this.currentIndex + 1);
  }

  /**
   * Find commands by description pattern
   */
  findCommandsByDescription(pattern: string | RegExp): Array<{ index: number; command: ITransposeCommand }> {
    const results: Array<{ index: number; command: ITransposeCommand }> = [];
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;

    for (let i = 0; i < this.history.length; i++) {
      const command = this.history[i];
      if (regex.test(command.getDescription())) {
        results.push({ index: i, command });
      }
    }

    return results;
  }

  /**
   * Create a snapshot of the current state
   */
  createSnapshot(): {
    history: string[];
    currentIndex: number;
    timestamp: string;
  } {
    return {
      history: this.getHistory(),
      currentIndex: this.currentIndex,
      timestamp: new Date().toISOString()
    };
  }
}