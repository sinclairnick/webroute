import { ReasonPhrases, StatusCodes } from "http-status-codes";

export class HttpException extends Error {
  public name: string;
  public status: number;

  constructor(public code: keyof typeof StatusCodes) {
    super();
    this.name = ReasonPhrases[code];
    this.status = StatusCodes[code];
  }

  toJson() {
    return JSON.stringify(this.toPlain());
  }

  toPlain() {
    return {
      code: this.code,
      name: this.name,
      status: this.status,
    };
  }
}

export const createHttpException = (type: keyof typeof StatusCodes) => {
  return class extends HttpException {
    constructor(
      public message: string,
      public extra?: Record<PropertyKey, any>
    ) {
      super(type);
    }

    toPlain() {
      return {
        ...this.extra,
        status: this.status,
        code: this.code,
        name: this.name,
        message: this.message,
      };
    }
  };
};
