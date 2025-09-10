declare module 'redlock' {
  import { EventEmitter } from 'events';
  import type { Redis } from 'ioredis';

  export interface RedlockOptions {
    driftFactor?: number;
    retryCount?: number;
    retryDelay?: number;
    retryJitter?: number;
  }

  export interface Lock {
    value: string;
    expiration: number;
    unlock: () => Promise<void>;
    extend: (ttl: number) => Promise<void>;
  }

  export default class Redlock extends EventEmitter {
    constructor(clients: Redis[], options?: RedlockOptions);
    acquire(resources: string[], ttl: number): Promise<Lock>;
    using<T>(resources: string[], ttl: number, handler: () => Promise<T>): Promise<T>;
  }
}
