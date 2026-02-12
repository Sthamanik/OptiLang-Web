class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  meta: any;

  constructor(
    statusCode: number, data: T, message: string = "success", meta:any = null
  ){
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400 ? true : false;

    if (meta)
      this.meta = meta
  }
}

export {ApiResponse}