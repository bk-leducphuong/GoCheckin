export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  timestamp: string;
}
