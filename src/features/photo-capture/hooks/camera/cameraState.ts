
import { useState, useRef } from "react";
import { CameraState, CameraStateSetters, CameraRefs } from "./types";

export const useCameraState = (): CameraState & CameraStateSetters & CameraRefs & {
  streamRef: React.MutableRefObject<MediaStream | null>;
  timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  initAttemptRef: React.MutableRefObject<number>;
} => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPhotoApproved, setIsPhotoApproved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initAttemptRef = useRef<number>(0);

  return {
    capturedImage,
    setCapturedImage,
    isCameraOpen,
    setIsCameraOpen,
    isLoading,
    setIsLoading,
    cameraError,
    setCameraError,
    isPhotoApproved,
    setIsPhotoApproved,
    videoRef,
    canvasRef,
    streamRef,
    timeoutRef,
    initAttemptRef,
  };
};
