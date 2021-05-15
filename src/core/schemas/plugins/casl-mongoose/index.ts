import {
  AccessibleFieldsModel,
  AccessibleFieldsDocument,
} from './accessible-fields';
import { AccessibleRecordModel } from './accessible-records';

export type AccessibleModel<
  T extends AccessibleFieldsDocument
> = AccessibleRecordModel<T> & AccessibleFieldsModel<T>;

export * from './accessible-records';
export * from './accessible-fields';
export * from './mongo';
