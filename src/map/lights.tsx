export default function Lights() {
  return (
    <>
      <ambientLight intensity={2.1} color="#ffffff" />
      <directionalLight intensity={11} position={[0, 200, 20]} color="#ffffff" />
    </>
  );
}
