
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { AvatarModel } from './AvatarModel';
import { SpeechBubble } from './SpeechBubble';
import { AvatarControls } from './AvatarControls';
import { AvatarCustomization } from './AvatarTypes';

export type AvatarMood = 'happy' | 'sad' | 'stressed' | 'excited' | 'thinking' | 'confused' | 'surprised' | 'neutral';
export type AvatarPose = 'clap' | 'nod' | 'thumbsUp' | 'shrug' | 'facepalm' | 'crossArms' | 'idle' | 'wave' | 'pointing';
export type AvatarSize = 'full' | 'half' | 'mini';
export type AvatarPosition = 'left' | 'right' | 'center';

export interface AvatarProps {
  mood?: AvatarMood;
  pose?: AvatarPose;
  size?: AvatarSize;
  position?: AvatarPosition;
  showSpeechBubble?: boolean;
  speechText?: string;
  customization?: AvatarCustomization;
  onAvatarReact?: () => void;
  onUserChoice?: (choice: string) => void;
  onSummaryStage?: () => void;
  className?: string;
  fallback?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({
  mood = 'neutral',
  pose = 'idle',
  size = 'half',
  position = 'left',
  showSpeechBubble = false,
  speechText = '',
  customization,
  onAvatarReact,
  className,
  fallback,
}) => {
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      setIsWebGLSupported(!!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      ));
    } catch (e) {
      setIsWebGLSupported(false);
    }
  }, []);

  // Calculate avatar dimensions based on size prop
  const getDimensions = () => {
    switch (size) {
      case 'full':
        return { height: '500px', width: '300px' };
      case 'half':
        return { height: '300px', width: '200px' };
      case 'mini':
        return { height: '150px', width: '100px' };
      default:
        return { height: '300px', width: '200px' };
    }
  };

  // Calculate position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'relative' as const,
      zIndex: 10,
    };

    switch (position) {
      case 'left':
        return { ...baseStyles, alignSelf: 'flex-start' };
      case 'right':
        return { ...baseStyles, alignSelf: 'flex-end' };
      case 'center':
        return { ...baseStyles, alignSelf: 'center' };
      default:
        return { ...baseStyles, alignSelf: 'flex-start' };
    }
  };

  const dimensions = getDimensions();
  const positionStyles = getPositionStyles();

  if (!isWebGLSupported) {
    // Fallback for browsers without WebGL support
    return fallback ? (
      <div style={{ ...dimensions, ...positionStyles }} className={className}>
        {fallback}
      </div>
    ) : (
      <div 
        style={{ ...dimensions, ...positionStyles }} 
        className={`bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-lg flex items-center justify-center border border-white/10 ${className || ''}`}
      >
        <div className="text-white text-center p-4">
          <p className="text-lg font-bold">3D Avatar</p>
          <p className="text-sm opacity-70">Your browser doesn't support 3D graphics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-container" style={{ ...dimensions, ...positionStyles }}>
      <div 
        className={`relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 ${className || ''}`}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 2], fov: 50 }}
          style={{ touchAction: 'none' }}
        >
          <Suspense fallback={
            <mesh>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial color="#7c3aed" wireframe />
            </mesh>
          }>
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 10]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <AvatarModel 
              mood={mood} 
              pose={pose} 
              customization={customization} 
              onLoad={() => setIsLoading(false)}
              onAvatarReact={onAvatarReact}
            />
            <ContactShadows
              opacity={0.4}
              scale={10}
              blur={2}
              far={10}
              resolution={256}
              color="#000000"
            />
            <Environment preset="sunset" />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 2 - 0.5}
              maxPolarAngle={Math.PI / 2 + 0.5}
            />
          </Suspense>
        </Canvas>
        
        {showSpeechBubble && speechText && !isLoading && (
          <SpeechBubble text={speechText} position={position} />
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-500/30 flex items-center justify-center mb-2">
                <div className="h-6 w-6 rounded-full bg-indigo-500 animate-bounce" />
              </div>
              <div className="text-white text-sm">Loading avatar...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Avatar;
