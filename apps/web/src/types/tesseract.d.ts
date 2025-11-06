// Type declarations for Tesseract.js
declare module 'tesseract.js' {
  export interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
      lines: Array<{
        text: string;
        confidence: number;
        words: Array<{
          text: string;
          confidence: number;
        }>;
      }>;
      words: Array<{
        text: string;
        confidence: number;
      }>;
    };
  }

  export interface Worker {
    recognize(image: string | Buffer | Uint8Array): Promise<RecognizeResult>;
    terminate(): Promise<void>;
  }

  export interface WorkerOptions {
    logger?: (message: any) => void;
    workerPath?: string;
    corePath?: string;
    langPath?: string;
  }

  export function createWorker(
    lang?: string,
    oem?: number,
    options?: WorkerOptions
  ): Promise<Worker>;
}