export interface UploadedImageData {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadedImageData;
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: UploadedImageData[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  result: {
    result: string;
  };
}

export interface ErrorResponse {
  error: string;
}