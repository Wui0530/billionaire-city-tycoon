import Building from "./Building";
import buildings from "../data/buildings";

export default function City() {
  return (
    <>
      {buildings.map((b, i) => (
        <Building
          key={i}
          position={b.position}
          height={b.height}
          color={b.color}
        />
      ))}
    </>
  );
}