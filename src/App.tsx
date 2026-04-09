import { useEffect } from "react";
import styled from "styled-components";
import { useAppStore } from "./stores";
import Map from "./map";
import Panel from "./panel";
import EnterpriseDetail from "./panel/enterpriseDetail";

const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: var(--color-bg);
  overflow: hidden;
`;

export default function App() {
  useEffect(() => {
    return () => useAppStore.getState().reset();
  }, []);

  return (
    <Wrapper>
      <Map />
      <Panel />
      <EnterpriseDetail />
    </Wrapper>
  );
}
