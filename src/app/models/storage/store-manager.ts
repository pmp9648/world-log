import { BehaviorSubject } from 'rxjs';

export class StoreManager<T> {
  private data = new BehaviorSubject<T[]>([]);

  readonly prefix: string;
  readonly restore: (data: any) => T;

  data$ = this.data.asObservable();

  constructor(
    prefix: string,
    restore: (data: any) => T
  ) {
    this.prefix = prefix;
    this.restore = restore;
  }

  private urlEncode = (value: string): string => {
    const regex = /[^a-zA-Z0-9-.]/gi;
    let newValue = value.replace(/\s/g, '-').toLowerCase();
    newValue = newValue.replace(regex, '');
    return newValue;
  }

  private processKey = (value: string): string =>
    value = value.startsWith(this.prefix)
      ? this.urlEncode(value)
      : this.urlEncode(`${this.prefix}-${value}`);

  private revive = (value: string): T =>
    this.restore(JSON.parse(value));

  private entries = () =>
    Object.entries(localStorage)
      .filter(([key]) => key.startsWith(this.prefix));

  private encode = () =>
    encodeURIComponent(JSON.stringify(this.entries()));

  private verify = (data: ([key: string, value: string])[]) =>
    data.every((d: [key: string, value: string]) => this.revive(d[1]));

  private store = (data: ([key: string, value: string])[]) =>
    data.forEach((d: [key: string, value: string]) =>
      localStorage.setItem(d[0], d[1])
    );

  exists = (key: string): boolean =>
    Object.keys(localStorage)
      .some(x => x === this.processKey(key));

  getAll = (): T[] =>
    this.entries()
      .map(([key, value]) => this.revive(value));

  get = (key: string): T | null => {
    const item = localStorage.getItem(
      this.processKey(key)
    );

    return item
      ? this.revive(item)
      : null
  }

  save = (key: string, data: T) => {
    localStorage.setItem(
      this.processKey(key),
      JSON.stringify(data)
    );

    this.data.next(this.getAll());
  }

  clear = () => {
    this.entries()
      .forEach(save => this.delete(save[0]));

    this.data.next(this.getAll());
  }

  delete = (key: string) => {
    localStorage.removeItem(
      this.processKey(key)
    );

    this.data.next(this.getAll());
  }

  download = () => {
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${this.encode()}`;
    link.download = `data.${this.prefix}`;
    link.target = '_blank';
    link.click();
  }

  upload = (json: string) => {
    const data = JSON.parse(json);

    try {
      if (this.verify(data)) {
        this.store(data);

        this.data.next(this.getAll());
      }
    } catch (ex: any) {
      throw ex;
    }
  }
}