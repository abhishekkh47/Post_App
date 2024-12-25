export type MongooseModel<T> = T & IBase;

export interface IBase {
  readonly _id: string;
  readonly createAt: Date;
  readonly updatedAt: Date;
}
