
export type CameraState = {
  capturedImage: string | null;
  isCameraOpen: boolean;
  isLoading: boolean;
  cameraError: string | null;
  isPhotoApproved: boolean;
};

export type CameraActions = {
  capturePhoto: () => void;
  retryCamera: () => void;
  cancelCameraAccess: () => void;
  uploadPhotoManually: () => void;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  approvePhoto: () => void;
};

export type CameraRefs = {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
};
