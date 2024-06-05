export type SchemaRecord = {
  Query?: unknown;
  Params?: unknown;
  Headers?: unknown;
  Body?: unknown;
  Output?: unknown;
};

export type OperationsArrayInput = ({
  path: string;
  methods: string[];
} & SchemaRecord)[];

export type OperationsRecordInput = {
  [key: string]: SchemaRecord;
};
