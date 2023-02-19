import { titlecase } from '../utils';
import { v4 as uuid } from 'uuid';

export const Datalist = <T>(data: T) =>
  Object.entries(data)
    .map(([key, value]) => {
      return {
        id: uuid(),
        label: titlecase(key),
        value: value
      }