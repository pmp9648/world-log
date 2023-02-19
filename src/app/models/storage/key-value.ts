export class KeyValue<T> {
    readonly key: string;
    readonly value: T;
  
    constructor(key: string, value: T) {
      this.key = key;
      this.value = value;
    }