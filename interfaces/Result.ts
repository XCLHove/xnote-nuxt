import ResultStatus from "../enums/ResultStatus.ts";

export interface Result<T> {
  status: ResultStatus;
  message: string;
  data: T;
}
