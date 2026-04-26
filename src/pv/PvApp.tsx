import { useEffect } from 'react'
import styled from 'styled-components'
import { usePvStore } from './pvStore'
import PvMap from './map/PvMap'
import PvPanel from './panel/PvPanel'

const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #f7efe2;
  overflow: hidden;
`

export default function PvApp() {
  useEffect(() => {
    return () => usePvStore.getState().reset()
  }, [])

  return (
    <Wrapper>
      <PvMap />
      <PvPanel />
    </Wrapper>
  )
}
