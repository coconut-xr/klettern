import { PositionalAudio } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Fog, PositionalAudio as PositionalAudioImpl } from "three";

export function WindFogEffect() {
  const audioRef = useRef<PositionalAudioImpl>(null);
  const fogRef = useRef<Fog>(null);
  useFrame((state) => {
    if (audioRef.current == null || fogRef.current == null) {
      return;
    }
    const t = state.clock.getElapsedTime();
    const x = Math.sin(t * 0.5) * Math.cos(t * 0.1);
    const y = x * x + 0.2;
    audioRef.current.setVolume(y * 0.2);
    fogRef.current.near = y * -200;
  });
  useEffect(() => {
    const listener = () => {
      audioRef.current?.play();
    };
    window.addEventListener("click", listener);
    return () => window.removeEventListener("click", listener);
  }, []);
  return (
    <>
      <fog attach="fog" ref={fogRef} args={["#ddd", 0, 500]} />
      <PositionalAudio distance={1000} url="/klettern/wind.mp3" ref={audioRef} />
    </>
  );
}
