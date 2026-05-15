import { RepeatWrapping, SRGBColorSpace } from 'three'
import loadTexture from '@/map/loadTexture'
import ringUrl from '@/assets/guangquan01.png'
import glowUrl from '@/assets/huiguang.png'

export const pvTexturesPromise = Promise.all([
  loadTexture(ringUrl),
  loadTexture(glowUrl, (tex) => {
    tex.colorSpace = SRGBColorSpace
    tex.wrapS = tex.wrapT = RepeatWrapping
  }),
])
