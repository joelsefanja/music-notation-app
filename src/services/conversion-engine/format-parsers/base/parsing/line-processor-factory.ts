import { LineProcessor, EmptyLineProcessor, AnnotationLineProcessor } from './line-processor';

/**
 * Factory for creating line processors using Chain of Responsibility pattern
 */
export class LineProcessorFactory {
  private static processors: LineProcessor[] = [
    new EmptyLineProcessor(),
    new AnnotationLineProcessor()
  ];

  /**
   * Get the appropriate processor for a line
   */
  static getProcessor(line: string): LineProcessor | null {
    return this.processors.find(processor => processor.canProcess(line)) || null;
  }

  /**
   * Add a custom processor to the chain
   */
  static addProcessor(processor: LineProcessor): void {
    this.processors.unshift(processor); // Add to beginning for priority
  }
}