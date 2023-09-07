import {
  ImmersiveSessionOrigin,
  NonImmersiveCamera,
  XR,
  useEnterXR,
} from "@coconut-xr/natuerlich/react";
import { XWebPointers } from "@coconut-xr/xinteraction/react";
import { Suspense, useEffect, useRef } from "react";
import { Gltf, Sky } from "@react-three/drei";
import { Steps } from "./steps.js";
import { useFrame } from "@react-three/fiber";
import { useStore } from "./state.js";
import {
  Group,
  LinearSRGBColorSpace,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MirroredRepeatWrapping,
  NoColorSpace,
  Object3D,
  SRGBColorSpace,
  Texture,
  Vector3,
} from "three";
import { Controllers, Hands } from "@coconut-xr/natuerlich/defaults";
import { WindFogEffect } from "./wind-fog-effect.js";

export const spawnPoint = new Vector3(1.4, 0, 0.2);
const yRotation = -(Math.PI * 5) / 4;

const options: XRSessionInit = {
  requiredFeatures: ["local-floor"],
  optionalFeatures: ["hand-tracking"],
};

export default function App() {
  const enterVR = useEnterXR("immersive-vr", options);
  const ref = useRef<Group>(null);
  useEffect(() => {
    const element = document.getElementById("enter-vr");
    if (element == null) {
      return;
    }

    element.addEventListener("click", enterVR);
    return () => element.removeEventListener("click", enterVR);
  }, []);
  useFrame((state, delta, frame) =>
    useStore.getState().update(delta, frame, state.gl.xr.getReferenceSpace())
  );
  useEffect(() => {
    if (ref.current == null) {
      return;
    }
    useStore.getState().setPlayer(ref.current);
    return () => useStore.getState().setPlayer(undefined);
  }, []);
  return (
    <>
      <XR />
      <group position={[1.4, 0, 0.2]} ref={ref}>
        <ImmersiveSessionOrigin>
          <Hands type="grab" />
          <Controllers type="grab" />
        </ImmersiveSessionOrigin>
      </group>
      <WindFogEffect />
      <group rotation-y={yRotation}>
      <directionalLight position={[0, 0.6, -1]} />
      <ambientLight intensity={0.1} />
        <NonImmersiveCamera position={[0, 1.5, 0]} />
        <SceneWithClouds />
        <Steps />
      </group>
      <XWebPointers />
      <Sky />
    </>
  );
}

function SceneWithClouds() {
  const ref = useRef<Object3D>(null);
  const cloudTextureRef = useRef<Texture | null>(null);
  useEffect(() => {
    if (ref.current == null) {
      return;
    }
    const mesh = ref.current.getObjectByName("Plane") as Mesh | undefined;
    const material = mesh?.material as MeshPhysicalMaterial;
    cloudTextureRef.current = material.map;
    if (cloudTextureRef.current == null) {
      return;
    }
    cloudTextureRef.current.wrapS = MirroredRepeatWrapping;
    cloudTextureRef.current.wrapT = MirroredRepeatWrapping;
    cloudTextureRef.current.needsUpdate = true;
  }, []);
  useFrame((state, delta) => {
    if (cloudTextureRef.current == null) {
      return;
    }
    cloudTextureRef.current.offset.x += delta * 0.03;
  });
  return <Gltf ref={ref} src="/klettern/climb.glb" />;
}
