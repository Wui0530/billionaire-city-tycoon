import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Player() {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;

    if (window.keys?.w) {
      ref.current.position.z -= 0.1;
    }

    if (window.keys?.s) {
      ref.current.position.z += 0.1;
    }

    if (window.keys?.a) {
      ref.current.position.x -= 0.1;
    }

    if (window.keys?.d) {
      ref.current.position.x += 0.1;
    }
  });

  window.onkeydown = (e) => {
    window.keys = window.keys || {};
    window.keys[e.key.toLowerCase()] = true;
  };

  window.onkeyup = (e) => {
    window.keys[e.key.toLowerCase()] = false;
  };

  return (
    <mesh ref={ref} position={[0, 1, 5]}>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}