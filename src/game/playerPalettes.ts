import type { TeamSlug } from '../types/team'
import type { PlayerAnimationName } from './playerSprites'

export interface PlayerPalette {
  shirtPrimary: string
  shirtSecondary: string
  shorts: string
  socks: string
  skinPrimary: string
  skinSecondary: string
  hairPrimary: string
  hairSecondary: string
  boots: string
  pattern: 'band' | 'stripes'
}

export const PLAYER_PALETTES: Record<TeamSlug, PlayerPalette> = {
  brasil: {
    shirtPrimary: '#f7d13d',
    shirtSecondary: '#238c4b',
    shorts: '#2352a2',
    socks: '#f3f2e8',
    skinPrimary: '#cd7d52',
    skinSecondary: '#934b38',
    hairPrimary: '#211a1d',
    hairSecondary: '#3b2928',
    boots: '#181923',
    pattern: 'band',
  },
  argentina: {
    shirtPrimary: '#f5f4ef',
    shirtSecondary: '#75bde8',
    shorts: '#172c4f',
    socks: '#f5f4ef',
    skinPrimary: '#d58b60',
    skinSecondary: '#9c563f',
    hairPrimary: '#241a1b',
    hairSecondary: '#49302c',
    boots: '#171923',
    pattern: 'stripes',
  },
  chile: {
    shirtPrimary: '#dc3c45',
    shirtSecondary: '#f5f4ef',
    shorts: '#1f4f99',
    socks: '#f5f4ef',
    skinPrimary: '#c97850',
    skinSecondary: '#8f4937',
    hairPrimary: '#20191b',
    hairSecondary: '#402a28',
    boots: '#171923',
    pattern: 'band',
  },
}

const SOURCE_COLORS = {
  shirt: 0xeaaded,
  shorts: 0xa884f3,
  hairPrimary: 0x4d9be6,
  hairSecondary: 0x4d65b4,
  skinFacePrimary: 0xcd683d,
  skinFaceSecondary: 0x9e4539,
  skinFaceCoolShadow: 0xc7dcd0,
  limbYellowDark: 0xd5e04b,
  limbYellowLight: 0xfbff86,
  limbOrange: 0xfb6b1d,
  limbRed: 0xe83b3b,
  limbRedDark: 0xae2334,
  limbGreen: 0x1ebc73,
  limbGreenLight: 0x91db69,
  white: 0xffffff,
  outline: 0x2e222f,
  detail: 0x3e3546,
} as const

interface FaceRegion {
  x: number
  y: number
  width: number
  height: number
}

export const FACE_REGION_X = 59
export const FACE_REGION_Y = 33
export const FACE_REGION_WIDTH = 10
export const FACE_REGION_HEIGHT = 5

const DEFAULT_FACE_REGION: FaceRegion = {
  x: FACE_REGION_X,
  y: FACE_REGION_Y,
  width: FACE_REGION_WIDTH,
  height: FACE_REGION_HEIGHT,
}

const FACE_REGIONS: Partial<
  Record<PlayerAnimationName, readonly FaceRegion[]>
> = {
  running: [
    { ...DEFAULT_FACE_REGION, x: 61, y: 32 },
    { ...DEFAULT_FACE_REGION, x: 61, y: 32 },
    { ...DEFAULT_FACE_REGION, y: 34 },
    { ...DEFAULT_FACE_REGION, x: 62, y: 32 },
    { ...DEFAULT_FACE_REGION, x: 62, y: 32 },
    { ...DEFAULT_FACE_REGION, x: 60, y: 34 },
  ],
  sprint: [
    { ...DEFAULT_FACE_REGION, x: 66, y: 34 },
    { ...DEFAULT_FACE_REGION, x: 66, y: 34 },
    { ...DEFAULT_FACE_REGION, x: 64, y: 35 },
    { ...DEFAULT_FACE_REGION, x: 66, y: 34 },
    { ...DEFAULT_FACE_REGION, x: 66, y: 35 },
    { ...DEFAULT_FACE_REGION, x: 63, y: 36 },
  ],
  idle: [
    DEFAULT_FACE_REGION,
    DEFAULT_FACE_REGION,
    { ...DEFAULT_FACE_REGION, y: 34 },
    { ...DEFAULT_FACE_REGION, y: 34 },
    DEFAULT_FACE_REGION,
  ],
  jump: [
    DEFAULT_FACE_REGION,
    { ...DEFAULT_FACE_REGION, x: 60, y: 35 },
    { ...DEFAULT_FACE_REGION, x: 60, y: 36 },
    { ...DEFAULT_FACE_REGION, x: 62, y: 30 },
    { ...DEFAULT_FACE_REGION, x: 62, y: 30 },
    { ...DEFAULT_FACE_REGION, x: 62, y: 30 },
    { ...DEFAULT_FACE_REGION, x: 61, y: 33 },
    { ...DEFAULT_FACE_REGION, x: 61, y: 33 },
    { ...DEFAULT_FACE_REGION, x: 61, y: 33 },
    { ...DEFAULT_FACE_REGION, x: 60, y: 40 },
    { ...DEFAULT_FACE_REGION, x: 60, y: 39 },
  ],
  kick: [
    { ...DEFAULT_FACE_REGION, x: 63, y: 37 },
    { ...DEFAULT_FACE_REGION, x: 63, y: 38 },
    { ...DEFAULT_FACE_REGION, x: 63, y: 38 },
    { ...DEFAULT_FACE_REGION, x: 63, y: 37 },
    { ...DEFAULT_FACE_REGION, x: 63, y: 38 },
    { ...DEFAULT_FACE_REGION, x: 63, y: 38 },
  ],
}

const RECOLORED_SPRITE_CACHE_VERSION = 2
const recoloredSpriteCache = new Map<string, CanvasImageSource>()

function toRgb(color: string) {
  const value = Number.parseInt(color.slice(1), 16)
  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  }
}

function getShirtColor(
  palette: PlayerPalette,
  localX: number,
  y: number,
) {
  const usesSecondary = palette.pattern === 'stripes'
    ? localX % 6 <= 1
    : y % 7 <= 1
  return usesSecondary ? palette.shirtSecondary : palette.shirtPrimary
}

function getReplacementColor(
  sourceColor: number,
  palette: PlayerPalette,
  localX: number,
  y: number,
  faceRegion: FaceRegion | undefined,
) {
  if (
    faceRegion &&
    localX >= faceRegion.x &&
    localX < faceRegion.x + faceRegion.width &&
    y >= faceRegion.y &&
    y < faceRegion.y + faceRegion.height
  ) {
    const faceX = localX - faceRegion.x
    const faceY = y - faceRegion.y
    const hairEdgeWidth = Math.max(0, faceY - 1)
    const isHairEdge =
      (sourceColor === SOURCE_COLORS.hairPrimary ||
        sourceColor === SOURCE_COLORS.hairSecondary) &&
      faceX <= hairEdgeWidth

    if (isHairEdge) {
      return sourceColor === SOURCE_COLORS.hairSecondary
        ? palette.hairSecondary
        : palette.hairPrimary
    }
    if (
      sourceColor === SOURCE_COLORS.outline ||
      sourceColor === SOURCE_COLORS.detail
    ) {
      return null
    }
    if (
      sourceColor === SOURCE_COLORS.skinFaceSecondary ||
      sourceColor === SOURCE_COLORS.skinFaceCoolShadow ||
      sourceColor === SOURCE_COLORS.hairSecondary
    ) {
      return palette.skinSecondary
    }
    return palette.skinPrimary
  }

  if (sourceColor === SOURCE_COLORS.skinFacePrimary) return palette.skinPrimary
  if (sourceColor === SOURCE_COLORS.skinFaceSecondary) {
    return palette.skinSecondary
  }
  if (sourceColor === SOURCE_COLORS.skinFaceCoolShadow) {
    return palette.skinSecondary
  }
  if (
    sourceColor === SOURCE_COLORS.limbYellowLight ||
    sourceColor === SOURCE_COLORS.limbOrange ||
    sourceColor === SOURCE_COLORS.limbGreen
  ) {
    return palette.skinPrimary
  }
  if (
    sourceColor === SOURCE_COLORS.limbYellowDark ||
    sourceColor === SOURCE_COLORS.limbRedDark
  ) {
    return palette.skinSecondary
  }
  if (sourceColor === SOURCE_COLORS.limbGreenLight) return palette.socks
  if (sourceColor === SOURCE_COLORS.limbRed) {
    return y >= 48 ? palette.socks : palette.skinPrimary
  }
  if (sourceColor === SOURCE_COLORS.hairPrimary) return palette.hairPrimary
  if (sourceColor === SOURCE_COLORS.hairSecondary) return palette.hairSecondary
  if (sourceColor === SOURCE_COLORS.shirt) {
    return getShirtColor(palette, localX, y)
  }
  if (sourceColor === SOURCE_COLORS.shorts) return palette.shorts
  if (
    y >= 58 &&
    sourceColor === SOURCE_COLORS.white
  ) {
    return palette.boots
  }
  return null
}

export function getRecoloredPlayerSprite(
  image: HTMLImageElement,
  team: TeamSlug,
  animationName: PlayerAnimationName,
  frameWidth: number,
): CanvasImageSource {
  const cacheKey = [
    RECOLORED_SPRITE_CACHE_VERSION,
    team,
    animationName,
    image.currentSrc || image.src,
    image.naturalWidth,
    image.naturalHeight,
  ].join(':')
  const cached = recoloredSpriteCache.get(cacheKey)
  if (cached) return cached

  try {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return image

    context.drawImage(image, 0, 0)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    const palette = PLAYER_PALETTES[team]

    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] === 0) continue
      const pixelIndex = index / 4
      const x = pixelIndex % canvas.width
      const y = Math.floor(pixelIndex / canvas.width)
      const frameIndex = Math.floor(x / frameWidth)
      const localX = x % frameWidth
      const faceRegion = FACE_REGIONS[animationName]?.[frameIndex]
      const sourceColor =
        (pixels[index] << 16) | (pixels[index + 1] << 8) | pixels[index + 2]
      const replacement = getReplacementColor(
        sourceColor,
        palette,
        localX,
        y,
        faceRegion,
      )
      if (!replacement) continue

      const rgb = toRgb(replacement)
      pixels[index] = rgb.red
      pixels[index + 1] = rgb.green
      pixels[index + 2] = rgb.blue
    }

    context.putImageData(imageData, 0, 0)
    recoloredSpriteCache.set(cacheKey, canvas)
    return canvas
  } catch {
    recoloredSpriteCache.set(cacheKey, image)
    return image
  }
}
