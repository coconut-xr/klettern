import {
  ImmersiveSessionOrigin,
  NonImmersiveCamera,
  XR,
  useEnterXR,
  useInputSources,
} from "@coconut-xr/natuerlich/react";
import { XWebPointers } from "@coconut-xr/xinteraction/react";
import { Suspense, startTransition, useEffect, useRef, useState } from "react";
import { Gltf, PositionalAudio, Sky, Text } from "@react-three/drei";
import { Steps } from "./steps.js";
import { MeshProps, useFrame } from "@react-three/fiber";
import { useStore } from "./state.js";
import {
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MirroredRepeatWrapping,
  Object3D,
  Texture,
  Vector3,
} from "three";
import { GrabController, GrabHand } from "@coconut-xr/natuerlich/defaults";
import { WindFogEffect } from "./wind-fog-effect.js";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import { PositionalAudio as PositionalAudioImpl } from "three";

export const spawnPoint = new Vector3(1.4, 0, 0.2);
const yRotation = -(Math.PI * 5) / 4;

const options: XRSessionInit = {
  requiredFeatures: ["local-floor"],
  optionalFeatures: ["hand-tracking"],
};

const { setPlayer, setWinAudio } = useStore.getState();

export default function App() {
  const enterVR = useEnterXR("immersive-vr", options);
  const ref = useRef<Group>(null);
  useEffect(() => {
    const element = document.getElementById("enter-vr");
    if (element == null) {
      return;
    }
    element.style.display = "block";
    element.addEventListener("click", enterVR);
    return () => element.removeEventListener("click", enterVR);
  }, []);
  useFrame((state, delta, frame) =>
    useStore.getState().update(delta, frame, state.gl.xr.getReferenceSpace())
  );
  const audioRef = useRef<PositionalAudioImpl>(null);
  useEffect(() => {
    if (ref.current == null || audioRef.current == null) {
      return;
    }

    setPlayer(ref.current);
    setWinAudio(audioRef.current);
    return () => {
      setPlayer(undefined);
      setWinAudio(undefined);
    };
  }, []);
  return (
    <>
      <XR />
      <group position={[1.4, 0, 0.2]} ref={ref}>
        <ImmersiveSessionOrigin>
          <InputSources />
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
      <PositionalAudio
        loop={false}
        distance={1000}
        url="/klettern/win.mp3"
        ref={audioRef}
      />
      <Sky />
    </>
  );
}

function InputSources() {
  const inputSources = useInputSources();
  return (
    <>
      {inputSources.map((is) =>
        is.hand != null ? (
          <GrabHand
            hand={is.hand}
            id={getInputSourceId(is)}
            key={getInputSourceId(is)}
            inputSource={is}
            pressSoundUrl="/klettern/grab.mp3"
          >
            <Suspense>
              <Time
                position-z={-0.01}
                position-y={0.02}
                rotation-x={-Math.PI / 2}
                scale={0.01}
              />
            </Suspense>
          </GrabHand>
        ) : (
          <GrabController
            id={getInputSourceId(is)}
            key={getInputSourceId(is)}
            inputSource={is}
            pressSoundUrl="/klettern/grab.mp3"
          >
            {is.handedness === "left" && (
              <Suspense>
                <Time
                  position-z={-0.01}
                  position-y={0.02}
                  rotation-x={-Math.PI / 2}
                  scale={0.01}
                />
              </Suspense>
            )}
          </GrabController>
        )
      )}
    </>
  );
}

function Time(props: MeshProps) {
  const [time, setTime] = useState("00:00:00");
  useEffect(() => {
    const intervalRef = setInterval(
      () =>
        startTransition(() => {
          const state = useStore.getState();
          const time = state.timeRef.current;
          const millis = Math.floor(time % 1000);
          const seconds = Math.floor((time / 1000) % 60);
          const minutes = Math.floor((time / 60000) % 60);
          setTime(
            `${state.won ? "final time:\n" : ""}${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${millis
              .toString()
              .padStart(3, "0")}`
          );
        }),
      50
    ); //20 times per second
    return () => clearInterval(intervalRef);
  }, []);
  return (
    <Text textAlign="center" {...props}>
      {time}
    </Text>
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
