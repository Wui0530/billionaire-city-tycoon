export default function Building({
  position,
  height,
  color
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[2, height, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}