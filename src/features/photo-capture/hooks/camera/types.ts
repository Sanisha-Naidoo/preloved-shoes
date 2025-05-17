
export type CameraState = {
  capturedImage: string | null;
  isCameraOpen: boolean;
  isLoading: boolean;
  cameraError: string | null;
};

export type CameraActions = {
  capturePhoto: () => void;
  retryCamera: () => void;
  cancelCameraAccess: () => void;
  uploadPhotoManually: () => void;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
};

export type CameraRefs = {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
};
