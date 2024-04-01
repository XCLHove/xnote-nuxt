/**
 * 分页数据
 */
export interface PageDTO<T> {
  current: number;
  size: number;
  total?: number;
  list?: T[];
}
