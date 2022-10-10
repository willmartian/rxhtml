export type Serializable =
  | string
  | number
  | boolean
  | { [x: string]: Serializable }
  | Array<Serializable>;
