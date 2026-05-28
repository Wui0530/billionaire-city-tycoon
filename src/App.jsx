import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";

import Ground from "./components/Ground";
import Player from "./components/Player";
import City from "./components/City";
import UI from "./components/UI";

export default function App() {
  return (
    <>
      <UI />

      <Canvas camera={{ position: [15, 15, 15], fov: 60 }}>
        <Sky sunPosition={[100, 20, 100]} />

        <ambientLight intensity={1} />

        <directionalLight
          position={[10, 20, 10]}
          intensity={2}
        />

        <Ground />

        <City />

        <Player />

        <OrbitControls />
      </Canvas>
    </>
  );
}