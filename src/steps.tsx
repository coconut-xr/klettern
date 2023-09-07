import { MeshProps } from "@react-three/fiber";
import { BoxGeometry, MeshPhongMaterial, SphereGeometry } from "three";
import { useStore } from "./state.js";

const geometry = new SphereGeometry();
geometry.scale(0.1, 0.1, 0.1);
const material = new MeshPhongMaterial({ color: "#aa3333" });

export function Steps() {
  return (
    <>
      <Step position={[-0.708, 1.284, 1.532]} />
      <Step position={[-0.708, 2.284, 1.732]} />
      <Step position={[-0.885, 3.063, 1.794]} />
      <Step position={[-1.568, 3.888, 2.178]} />
      <Step position={[-1.586, 4.896, 2.119]} />
      <Step position={[-0.37, 5.244, 1.174]} />
      <Step position={[0.675, 5.669, 0.377]} />
      <Step position={[1.214, 5.743, -0.072]} />
      <Step position={[1.993, 5.765, -0.217]} />
      <Step position={[2.928, 6.26, -0.322]} />
      <Step position={[3.489, 7.512, 0.227]} />
      <Step position={[3.552, 8.154, 0.176]} />
      <Step position={[2.153, 9.018, 0.125]} />
      <Step position={[1.645, 10.159, -0.104]} />
      <Step position={[1.062, 11.208, 0.312]} />
      <Step position={[1.429, 12.371, -0.274]} />
      <Step position={[3.136, 11.525, -0.769]} />
      <Step position={[3.243, 12.535, -0.703]} />
      <Step position={[4.136, 13.192, -0.664]} />
      <Step position={[4.586, 13.556, -1.466]} />
      <Step position={[4.175, 14.395, -2.049]} />
    </>
  );
}

const { onPointerDown, onPointerMove, onPointerUp } = useStore.getState();

function Step(props: MeshProps) {
  return (
    <mesh
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      geometry={geometry}
      material={material}
      {...props}
    />
  );
}
