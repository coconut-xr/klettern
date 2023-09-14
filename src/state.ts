import { ThreeEvent } from "@react-three/fiber";
import { Group, PositionalAudio, Vector3 } from "three";
import { create } from "zustand";
import { combine } from "zustand/middleware";
import { isXIntersection } from "@coconut-xr/xinteraction";
import { useXR } from "@coconut-xr/natuerlich/react";
import { spawnPoint } from "./app.js";

type State = {
  playerRef?: Group;
  grabbingPointerId?: number;
  grabbingPoint?: Vector3;
  velocity: Vector3;
  timeRef: { current: number };
  idle: boolean;
  winAudio?: PositionalAudio;
  score?: number;
};

const gravity = -10;
const dampingFactor = 0.995;

const initialState: State = {
  idle: true,
  velocity: new Vector3(0, 0, 0),
  timeRef: { current: 0 },
};

const helperVector = new Vector3();

export const useStore = create(
  combine(initialState, (set, get) => ({
    setPlayer(player: Group | undefined) {
      set({ playerRef: player });
    },
    setWinAudio(winAudio: PositionalAudio | undefined) {
      set({ winAudio });
    },
    onPointerDown(last: boolean | undefined, e: ThreeEvent<PointerEvent>) {
      if (!isXIntersection(e)) {
        return;
      }
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const { winAudio, score, timeRef } = get();
      if (last) {
        winAudio?.play();
      }
      set({
        grabbingPoint: e.inputDevicePosition,
        grabbingPointerId: e.pointerId,
        idle: last ? true : false,
        score: last
          ? Math.min(timeRef.current, score ?? Number.POSITIVE_INFINITY)
          : score,
      });
    },
    onPointerUp(e: ThreeEvent<PointerEvent>) {
      const state = get();
      if (state.grabbingPointerId != e.pointerId) {
        return;
      }
      set({ grabbingPointerId: undefined, grabbingPoint: undefined });
    },
    onPointerMove(e: ThreeEvent<PointerEvent>) {
      const state = get();
      if (state.grabbingPointerId != e.pointerId) {
        return;
      }
    },
    update(
      delta: number,
      frame: XRFrame | undefined,
      baseSpace: XRSpace | null
    ) {
      const {
        idle,
        velocity,
        grabbingPoint,
        grabbingPointerId,
        playerRef,
        timeRef,
      } = get();
      if (playerRef == null) {
        return;
      }
      if (!idle) {
        timeRef.current += delta * 1000;
      }
      if (grabbingPoint == null || grabbingPointerId == null) {
        if (playerRef.position.y > 0) {
          //player is falling down -> apply gravity to velocity & apply velocity to position
          velocity.y += gravity * delta;
          velocity.multiplyScalar(dampingFactor);
          playerRef.position.add(
            helperVector.copy(velocity).multiplyScalar(delta)
          );
          return;
        }
        if (playerRef.position.y < 0) {
          //player fell down -> reset
          playerRef.position.copy(spawnPoint);
          velocity.set(0, 0, 0);
          timeRef.current = 0;
          set({ idle: true });
          return;
        }
        //player is at origin => nothing to do
        return;
      }

      if (frame == null || baseSpace == null) {
        return;
      }
      const inputSource = useXR.getState().inputSources?.get(grabbingPointerId);
      if (inputSource == null || inputSource.gripSpace == null) {
        return;
      }
      const pose = frame.getPose(inputSource.gripSpace, baseSpace);
      if (pose == null) {
        return;
      }
      const { x, y, z } = pose.transform.position;
      velocity.copy(playerRef.position);
      playerRef.position.set(x, y, z).negate().add(grabbingPoint);
      velocity.negate().add(playerRef.position).divideScalar(delta);
    },
  }))
);
