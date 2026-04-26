export type MouseEvent<T = any> = {
  target: T;
};

export interface MountedEvent<T = any> {
  reason?: string;
  target: T;
  error?: Error;
}

export type ScrollEvent<T = any> = {
  scrollTop: number;
};
