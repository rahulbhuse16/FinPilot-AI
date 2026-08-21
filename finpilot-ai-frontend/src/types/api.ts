export interface Paginated<T> {
  items: T[];
  total?: number;
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}

export interface ApiErrorShape {
  message: string;
  status?: number;
}
