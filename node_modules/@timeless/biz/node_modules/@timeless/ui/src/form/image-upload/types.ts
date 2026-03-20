export interface Uploader {
  upload(file: File): void;
  onStart(cb: () => void): void;
  onProgress(cb: (data: { percent: number }) => void): void;
  onSuccess(cb: (data: { key: string }) => void): void;
  onCompleted(cb: () => void): void;
  onError(cb: (err: Error) => void): void;
}
