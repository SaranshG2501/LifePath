
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarMood, AvatarPose } from './Avatar';
import { AvatarCustomization } from './AvatarTypes';
import { EMOTION_PARAMETERS, POSE_ANIMATIONS } from './AvatarUtils';

interface AvatarModelProps {
  mood?: AvatarMood;
  pose?: AvatarPose;
  customization?: AvatarCustomization;
  onLoad?: () => void;
  onAvatarReact?: () => void;
}

// Default avatar model URL - replace with your actual model URL
const DEFAULT_AVATAR_URL = '/models/stylized-avatar.glb';

export const AvatarModel: React.FC<AvatarModelProps> = ({
  mood = 'neutral',
  pose = 'idle',
  customization,
  onLoad,
  onAvatarReact
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(DEFAULT_AVATAR_URL);
  const { actions, names } = useAnimations(animations, group);
  const [loaded, setLoaded] = useState(false);
  const [currentPose, setCurrentPose] = useState<string>(pose);
  const [blinking, setBlinking] = useState<boolean>(false);

  const previousMood = useRef<AvatarMood>(mood);
  const previousPose = useRef<AvatarPose>(pose);

  // Apply customizations to the avatar
  useEffect(() => {
    if (!scene || !customization) return;

    // Example: Apply skin tone 
    if (customization.skinTone) {
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh &&
          object.name.includes('Skin') &&
          object.material
        ) {
          const material = object.material as THREE.MeshStandardMaterial;
          material.color.set(customization.skinTone!);
        }
      });
    }

    // Apply hair style - this would involve showing/hiding different hair meshes
    if (customization.hairStyle) {
      scene.traverse((object) => {
        if (object.name.includes('Hair')) {
          object.visible = object.name.includes(customization.hairStyle!);
        }
      });
    }

    // Apply outfit - this would involve showing/hiding different clothing meshes
    if (customization.outfit) {
      scene.traverse((object) => {
        if (object.name.includes('Outfit')) {
          object.visible = object.name.includes(customization.outfit!);
        }
      });
    }

    // Apply accessories
    if (customization.accessories && customization.accessories.length > 0) {
      scene.traverse((object) => {
        if (object.name.includes('Accessory')) {
          const accessoryType = object.name.split('_')[1]; // e.g., "Accessory_Glasses"
          object.visible = customization.accessories!.includes(accessoryType);
        }
      });
    }
  }, [scene, customization]);

  // When model is loaded
  useEffect(() => {
    if (scene && !loaded) {
      setLoaded(true);
      if (onLoad) onLoad();
    }
  }, [scene, loaded, onLoad]);

  // Handle mood changes
  useEffect(() => {
    if (!scene || mood === previousMood.current) return;

    // Apply facial expressions based on mood
    const emotionParams = EMOTION_PARAMETERS[mood] || EMOTION_PARAMETERS.neutral;
    
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary) {
        Object.entries(emotionParams).forEach(([param, value]) => {
          const index = object.morphTargetDictionary[param];
          if (index !== undefined) {
            object.morphTargetInfluences![index] = value;
          }
        });
      }
    });

    previousMood.current = mood;
    if (onAvatarReact) onAvatarReact();
  }, [scene, mood, onAvatarReact]);

  // Handle pose changes
  useEffect(() => {
    if (!actions || !names.length || pose === previousPose.current) return;

    // Get animation name from pose
    const animationName = POSE_ANIMATIONS[pose] || POSE_ANIMATIONS.idle;
    setCurrentPose(animationName);
    
    // Reset all animations
    Object.values(actions).forEach(action => action.stop());
    
    // Play the new animation
    if (actions[animationName]) {
      actions[animationName]
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .play();
        
      // For non-looping animations, go back to idle afterwards
      if (pose !== 'idle') {
        const duration = actions[animationName].getClip().duration;
        setTimeout(() => {
          Object.values(actions).forEach(action => action.stop());
          setCurrentPose(POSE_ANIMATIONS.idle);
          actions[POSE_ANIMATIONS.idle]
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .play();
          previousPose.current = 'idle';
        }, duration * 1000);
      }
    }

    previousPose.current = pose;
  }, [actions, names, pose]);

  // Blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => {
        setBlinking(false);
      }, 200);
    }, Math.random() * 3000 + 2000); // Random blink every 2-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  useFrame(() => {
    // Apply blink if needed
    if (scene && blinking) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.morphTargetDictionary) {
          const blinkIndex = object.morphTargetDictionary['eyesClosed'];
          if (blinkIndex !== undefined) {
            object.morphTargetInfluences![blinkIndex] = 1;
          }
        }
      });
    } else if (scene && !blinking) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.morphTargetDictionary) {
          const blinkIndex = object.morphTargetDictionary['eyesClosed'];
          if (blinkIndex !== undefined) {
            object.morphTargetInfluences![blinkIndex] = 0;
          }
        }
      });
    }
  });

  // Clone the scene to avoid mutations
  const clonedScene = scene?.clone();

  return (
    <group ref={group} dispose={null}>
      <primitive object={clonedScene} scale={1} position={[0, -1, 0]} />
    </group>
  );
};

useGLTF.preload(DEFAULT_AVATAR_URL);
