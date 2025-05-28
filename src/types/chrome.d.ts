/// <reference types="chrome"/>

declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | object | null): Promise<{ [key: string]: any }>;
      set(items: object): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    }
    
    const local: StorageArea;
  }
} 