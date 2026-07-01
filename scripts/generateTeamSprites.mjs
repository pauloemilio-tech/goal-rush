import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync, inflateSync } from 'node:zlib'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = join(rootDir, 'public', 'assets', 'sprites', 'player', 'brazil')
const outputRoot = join(rootDir, 'public', 'assets', 'sprites', 'player')

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const FRAME_WIDTH = 120
const FRAME_HEIGHT = 120

const animations = {
  running: { file: 'running.png', frames: 6 },
  runningJump: { file: 'runningJump.png', frames: 8 },
  kick: { file: 'kick.png', frames: 4 },
  idle: { file: 'idle.png', frames: 4 },
}

const defaultAnimationNames = Object.keys(animations)

const palettes = {
  argentina: {
    shirtPrimary: ['#1A5675', '#237DA8', '#43A9D8', '#75C7EF', '#B7E9FF'],
    shirtSecondary: ['#B9D8E8', '#D7ECF8', '#F6FBFF', '#FFFFFF', '#FFFFFF'],
    shorts: ['#030B1D', '#07172F', '#10264D', '#244A80', '#244A80'],
  },
  chile: {
    shirtPrimary: ['#5F0E19', '#8F1624', '#D92D3A', '#F05A63', '#F05A63'],
    shirtSecondary: ['#B7C6D8', '#D7E2EF', '#F8FBFF', '#FFFFFF', '#FFFFFF'],
    shorts: ['#030B1D', '#07172F', '#10264D', '#244A80', '#244A80'],
  },
}

const profiles = {
  running: {
    yellowHue: [36, 66],
    greenHue: [78, 166],
    blueHue: [190, 236],
    minYellowSaturation: 0.3,
    minGreenSaturation: 0.32,
    minBlueSaturation: 0.25,
    maxYellowBlue: 145,
    maxBlueRed: 130,
    minBlueValue: 60,
  },
  runningJump: {
    yellowHue: [34, 68],
    greenHue: [76, 168],
    blueHue: [188, 238],
    minYellowSaturation: 0.26,
    minGreenSaturation: 0.26,
    minBlueSaturation: 0.22,
    maxYellowBlue: 145,
    maxBlueRed: 135,
    minBlueValue: 55,
  },
  kick: {
    yellowHue: [34, 68],
    greenHue: [76, 168],
    blueHue: [188, 238],
    minYellowSaturation: 0.25,
    minGreenSaturation: 0.28,
    minBlueSaturation: 0.2,
    maxYellowBlue: 140,
    maxBlueRed: 140,
    minBlueValue: 52,
  },
  idle: {
    yellowHue: [34, 68],
    greenHue: [78, 166],
    blueHue: [190, 236],
    minYellowSaturation: 0.28,
    minGreenSaturation: 0.3,
    minBlueSaturation: 0.24,
    maxYellowBlue: 130,
    maxBlueRed: 130,
    minBlueValue: 58,
  },
}

const masks = {
  running: Array.from({ length: 6 }, (_, frame) => ({
    frame,
    regions: [
      rect('shirt', 43, 34, 39, 31),
      rect('shorts', 43, 55, 36, 22),
      rect('shorts', 39, 70, 43, 24),
    ],
  })),
  runningJump: Array.from({ length: 8 }, (_, frame) => ({
    frame,
    regions: [
      rect('shirt', 40, 30, 45, 36),
      rect('shorts', 39, 52, 45, 26),
      rect('shorts', 35, 66, 52, 29),
    ],
  })),
  kick: Array.from({ length: 4 }, (_, frame) => ({
    frame,
    regions: [
      rect('shirt', 38, 34, 52, 35),
      rect('shorts', 36, 54, 56, 25),
      rect('shorts', 35, 67, 68, 28),
    ],
  })),
  idle: Array.from({ length: 4 }, (_, frame) => ({
    frame,
    regions: [
      rect('shirt', 43, 34, 39, 32),
      rect('shorts', 43, 55, 36, 22),
      rect('shorts', 40, 69, 42, 23),
    ],
  })),
}

const crcTable = new Uint32Array(256)
for (let index = 0; index < 256; index += 1) {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }
  crcTable[index] = value >>> 0
}

function rect(part, x, y, width, height) {
  return { part, x, y, width, height }
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  typeBuffer.copy(chunk, 4)
  data.copy(chunk, 8)
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length)
  return chunk
}

function paethPredictor(left, above, upperLeft) {
  const estimate = left + above - upperLeft
  const leftDistance = Math.abs(estimate - left)
  const aboveDistance = Math.abs(estimate - above)
  const upperLeftDistance = Math.abs(estimate - upperLeft)
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left
  if (aboveDistance <= upperLeftDistance) return above
  return upperLeft
}

function decodeScanlines(data, width, height) {
  const bytesPerPixel = 4
  const stride = width * bytesPerPixel
  const pixels = Buffer.alloc(stride * height)
  let inputOffset = 0

  for (let y = 0; y < height; y += 1) {
    const filter = data[inputOffset]
    inputOffset += 1
    const rowOffset = y * stride

    for (let x = 0; x < stride; x += 1) {
      const raw = data[inputOffset]
      inputOffset += 1
      const left = x >= bytesPerPixel ? pixels[rowOffset + x - bytesPerPixel] : 0
      const above = y > 0 ? pixels[rowOffset + x - stride] : 0
      const upperLeft =
        y > 0 && x >= bytesPerPixel
          ? pixels[rowOffset + x - stride - bytesPerPixel]
          : 0

      let value = raw
      if (filter === 1) value = raw + left
      else if (filter === 2) value = raw + above
      else if (filter === 3) value = raw + Math.floor((left + above) / 2)
      else if (filter === 4) value = raw + paethPredictor(left, above, upperLeft)
      else if (filter !== 0) throw new Error(`Unsupported PNG filter ${filter}`)

      pixels[rowOffset + x] = value & 0xff
    }
  }

  return pixels
}

function encodeScanlines(pixels, width, height) {
  const stride = width * 4
  const data = Buffer.alloc((stride + 1) * height)
  let outputOffset = 0
  for (let y = 0; y < height; y += 1) {
    data[outputOffset] = 0
    outputOffset += 1
    pixels.copy(data, outputOffset, y * stride, (y + 1) * stride)
    outputOffset += stride
  }
  return data
}

async function readPng(path) {
  const file = await readFile(path)
  if (!file.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`${path} is not a PNG`)
  }

  let offset = 8
  let width = 0
  let height = 0
  const idat = []

  while (offset < file.length) {
    const length = file.readUInt32BE(offset)
    const type = file.subarray(offset + 4, offset + 8).toString('ascii')
    const data = file.subarray(offset + 8, offset + 8 + length)
    offset += 12 + length

    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      const bitDepth = data[8]
      const colorType = data[9]
      const interlace = data[12]
      if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
        throw new Error(`${path} must be an 8-bit non-interlaced RGBA PNG`)
      }
    } else if (type === 'IDAT') {
      idat.push(data)
    } else if (type === 'IEND') {
      break
    }
  }

  const inflated = inflateSync(Buffer.concat(idat))
  return { width, height, pixels: decodeScanlines(inflated, width, height) }
}

async function writePng(path, image) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(image.width, 0)
  header.writeUInt32BE(image.height, 4)
  header[8] = 8
  header[9] = 6
  header[10] = 0
  header[11] = 0
  header[12] = 0

  const compressed = deflateSync(encodeScanlines(image.pixels, image.width, image.height))
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, Buffer.concat([
    PNG_SIGNATURE,
    makeChunk('IHDR', header),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]))
}

function getHue(red, green, blue) {
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  if (delta === 0) return 0
  let hue
  if (max === red) hue = ((green - blue) / delta) % 6
  else if (max === green) hue = (blue - red) / delta + 2
  else hue = (red - green) / delta + 4
  return (hue * 60 + 360) % 360
}

function getSaturation(red, green, blue) {
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  return max === 0 ? 0 : (max - min) / max
}

function getLightness(red, green, blue) {
  return (Math.max(red, green, blue) + Math.min(red, green, blue)) / 510
}

function getBrazilUniformPart(red, green, blue, profile, preferredPart) {
  const hue = getHue(red, green, blue)
  const saturation = getSaturation(red, green, blue)
  const lightness = getLightness(red, green, blue)
  const minBlueSaturation = preferredPart === 'shorts'
    ? profile.minBlueSaturation
    : profile.minBlueSaturation + 0.06

  if (
    hue >= profile.yellowHue[0] &&
    hue <= profile.yellowHue[1] &&
    saturation >= profile.minYellowSaturation &&
    lightness >= 0.2 &&
    blue <= profile.maxYellowBlue
  ) {
    return 'shirtPrimary'
  }

  if (
    hue >= profile.greenHue[0] &&
    hue <= profile.greenHue[1] &&
    saturation >= profile.minGreenSaturation &&
    lightness >= 0.1
  ) {
    return 'shirtSecondary'
  }

  if (
    hue >= profile.blueHue[0] &&
    hue <= profile.blueHue[1] &&
    saturation >= minBlueSaturation &&
    blue >= profile.minBlueValue &&
    red <= profile.maxBlueRed
  ) {
    return 'shorts'
  }

  return null
}

function getToneIndex(red, green, blue) {
  const lightness = getLightness(red, green, blue)
  if (lightness < 0.2) return 0
  if (lightness < 0.38) return 1
  if (lightness > 0.78) return 4
  if (lightness > 0.66) return 3
  return 2
}

function parseHex(hex) {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function getFrameMaskEntry(animationName, frameIndex, localX, y) {
  for (const region of masks[animationName][frameIndex].regions) {
    if (
      localX >= region.x &&
      localX < region.x + region.width &&
      y >= region.y &&
      y < region.y + region.height
    ) {
      return region
    }
  }
  return null
}

function getFrameUniformRegion(animationName, frameIndex, localX, y) {
  return getFrameMaskEntry(animationName, frameIndex, localX, y)
}

function cloneImage(image) {
  return {
    width: image.width,
    height: image.height,
    pixels: Buffer.from(image.pixels),
  }
}

function getHexColor(red, green, blue) {
  return `#${red.toString(16).padStart(2, '0')}${green
    .toString(16)
    .padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`.toUpperCase()
}

function getRgbKey(red, green, blue) {
  return `${red},${green},${blue}`
}

function getBrazilResidualFamily(red, green, blue, sourceBlueColors) {
  const hue = getHue(red, green, blue)
  const saturation = getSaturation(red, green, blue)
  const lightness = getLightness(red, green, blue)

  if (
    hue >= 38 &&
    hue <= 64 &&
    saturation >= 0.28 &&
    lightness >= 0.22 &&
    blue <= 145 &&
    red >= green
  ) {
    return 'yellow'
  }

  if (
    hue >= 82 &&
    hue <= 158 &&
    saturation >= 0.26 &&
    lightness >= 0.12 &&
    green > red &&
    green > blue
  ) {
    return 'green'
  }

  if (sourceBlueColors.has(getRgbKey(red, green, blue))) {
    return 'brazilShortsBlue'
  }

  return null
}

function collectBrazilSourceBlueColors(source, animationName) {
  const profile = profiles[animationName]
  const colors = new Set()

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const frameIndex = Math.floor(x / FRAME_WIDTH)
      const localX = x % FRAME_WIDTH
      if (!getFrameUniformRegion(animationName, frameIndex, localX, y)) continue

      const pixelOffset = (y * source.width + x) * 4
      if (source.pixels[pixelOffset + 3] === 0) continue

      const red = source.pixels[pixelOffset]
      const green = source.pixels[pixelOffset + 1]
      const blue = source.pixels[pixelOffset + 2]
      const hue = getHue(red, green, blue)
      const saturation = getSaturation(red, green, blue)

      if (
        hue >= profile.blueHue[0] &&
        hue <= profile.blueHue[1] &&
        saturation >= profile.minBlueSaturation &&
        blue >= profile.minBlueValue &&
        red <= profile.maxBlueRed
      ) {
        colors.add(getRgbKey(red, green, blue))
      }
    }
  }

  return colors
}

function createEmptyResidualCounts() {
  return {
    yellow: 0,
    green: 0,
    brazilShortsBlue: 0,
    total: 0,
  }
}

function createFrameResidualStats(frameCount) {
  return Array.from({ length: frameCount }, () => ({
    counts: createEmptyResidualCounts(),
    residues: [],
  }))
}

function detectBrazilUniformResidues(image, animationName, sourceBlueColors) {
  const frameStats = createFrameResidualStats(masks[animationName].length)

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const frameIndex = Math.floor(x / FRAME_WIDTH)
      const localX = x % FRAME_WIDTH
      if (!getFrameUniformRegion(animationName, frameIndex, localX, y)) continue

      const pixelOffset = (y * image.width + x) * 4
      if (image.pixels[pixelOffset + 3] === 0) continue

      const red = image.pixels[pixelOffset]
      const green = image.pixels[pixelOffset + 1]
      const blue = image.pixels[pixelOffset + 2]
      const family = getBrazilResidualFamily(red, green, blue, sourceBlueColors)
      if (!family) continue

      const frame = frameStats[frameIndex]
      frame.counts[family] += 1
      frame.counts.total += 1
      frame.residues.push({
        frame: frameIndex,
        x: localX,
        y,
        color: getHexColor(red, green, blue),
        family,
      })
    }
  }

  return frameStats
}

function sumResidualCounts(frameStats) {
  return frameStats.reduce((totals, frame) => {
    totals.yellow += frame.counts.yellow
    totals.green += frame.counts.green
    totals.brazilShortsBlue += frame.counts.brazilShortsBlue
    totals.total += frame.counts.total
    return totals
  }, createEmptyResidualCounts())
}

function formatResidualCounts(counts) {
  return `total=${counts.total}, yellow=${counts.yellow}, green=${counts.green}, brazilBlue=${counts.brazilShortsBlue}`
}

function formatResidue(residue, team, animationName) {
  return `${team}/${animationName} frame ${residue.frame} at ${residue.x},${residue.y} ${residue.color} ${residue.family}`
}

function applyTeamPalette(source, animationName, team) {
  const result = cloneImage(source)
  const profile = profiles[animationName]
  const palette = palettes[team]
  const frameCount = masks[animationName].length
  const stats = {
    uniformRegionPixels: 0,
    recoloredPixels: 0,
    frameStats: Array.from({ length: frameCount }, () => ({
      uniformRegionPixels: 0,
      recoloredPixels: 0,
    })),
  }

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const frameIndex = Math.floor(x / FRAME_WIDTH)
      const localX = x % FRAME_WIDTH
      const maskEntry = getFrameUniformRegion(animationName, frameIndex, localX, y)
      if (!maskEntry) continue

      const pixelOffset = (y * source.width + x) * 4
      const alpha = source.pixels[pixelOffset + 3]
      if (alpha === 0) continue

      stats.uniformRegionPixels += 1
      stats.frameStats[frameIndex].uniformRegionPixels += 1

      const red = source.pixels[pixelOffset]
      const green = source.pixels[pixelOffset + 1]
      const blue = source.pixels[pixelOffset + 2]
      const part = getBrazilUniformPart(red, green, blue, profile, maskEntry.part)
      if (!part) continue

      const replacement = parseHex(palette[part][getToneIndex(red, green, blue)])
      result.pixels[pixelOffset] = replacement[0]
      result.pixels[pixelOffset + 1] = replacement[1]
      result.pixels[pixelOffset + 2] = replacement[2]
      stats.recoloredPixels += 1
      stats.frameStats[frameIndex].recoloredPixels += 1
    }
  }

  validateImage(source, result, animationName, team)
  return { image: result, stats }
}

function validateImage(source, result, animationName, team) {
  if (source.width !== result.width || source.height !== result.height) {
    throw new Error(`${team}/${animationName}: dimensions changed`)
  }

  const profile = profiles[animationName]
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const frameIndex = Math.floor(x / FRAME_WIDTH)
      const localX = x % FRAME_WIDTH
      const maskEntry = getFrameUniformRegion(animationName, frameIndex, localX, y)
      const pixelOffset = (y * source.width + x) * 4
      const sourceAlpha = source.pixels[pixelOffset + 3]
      const resultAlpha = result.pixels[pixelOffset + 3]
      if (sourceAlpha !== resultAlpha) {
        throw new Error(`${team}/${animationName}: alpha changed at ${x},${y}`)
      }

      if (!maskEntry) {
        for (let channel = 0; channel < 4; channel += 1) {
          if (source.pixels[pixelOffset + channel] !== result.pixels[pixelOffset + channel]) {
            throw new Error(`${team}/${animationName}: outside-mask pixel changed at ${x},${y}`)
          }
        }
        continue
      }

      const red = result.pixels[pixelOffset]
      const green = result.pixels[pixelOffset + 1]
      const blue = result.pixels[pixelOffset + 2]
      const sourcePart = getBrazilUniformPart(
        source.pixels[pixelOffset],
        source.pixels[pixelOffset + 1],
        source.pixels[pixelOffset + 2],
        profile,
        maskEntry.part,
      )
      if (
        sourcePart &&
        red === source.pixels[pixelOffset] &&
        green === source.pixels[pixelOffset + 1] &&
        blue === source.pixels[pixelOffset + 2]
      ) {
        const color = getHexColor(red, green, blue)
        throw new Error(
          `${team}/${animationName}: unchanged uniform pixel at frame ${frameIndex}, ${localX},${y} (${color})`,
        )
      }

      if (!sourcePart) {
        for (let channel = 0; channel < 4; channel += 1) {
          if (source.pixels[pixelOffset + channel] !== result.pixels[pixelOffset + channel]) {
            throw new Error(`${team}/${animationName}: non-uniform pixel changed at ${x},${y}`)
          }
        }
      }
    }
  }
}

function parseAnimationFilter() {
  const argument = process.argv.find((value) => value.startsWith('--animations='))
  if (!argument) return defaultAnimationNames

  const requested = argument
    .slice('--animations='.length)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  if (requested.length === 0) {
    throw new Error('--animations must include at least one animation name')
  }

  for (const animationName of requested) {
    if (!animations[animationName]) {
      throw new Error(`Unknown animation "${animationName}"`)
    }
  }

  return requested
}

async function main() {
  const totals = {}
  const animationNames = parseAnimationFilter()

  for (const animationName of animationNames) {
    const animation = animations[animationName]
    const sourcePath = join(sourceDir, animation.file)
    const source = await readPng(sourcePath)
    if (source.width !== FRAME_WIDTH * animation.frames || source.height !== FRAME_HEIGHT) {
      throw new Error(`${animation.file}: unexpected dimensions ${source.width}x${source.height}`)
    }

    const sourceBlueColors = collectBrazilSourceBlueColors(source, animationName)

    for (const team of Object.keys(palettes)) {
      const { image, stats } = applyTeamPalette(source, animationName, team)
      const outputPath = join(outputRoot, team, animation.file)
      const existing = await readPng(outputPath)
      const residualBeforeFrames = detectBrazilUniformResidues(
        existing,
        animationName,
        sourceBlueColors,
      )
      const residualAfterFrames = detectBrazilUniformResidues(
        image,
        animationName,
        sourceBlueColors,
      )
      const residualBefore = sumResidualCounts(residualBeforeFrames)
      const residualAfter = sumResidualCounts(residualAfterFrames)

      if (residualAfter.total > 0) {
        const residues = residualAfterFrames
          .flatMap((frame) => frame.residues)
          .map((residue) => formatResidue(residue, team, animationName))
          .join('\n')
        throw new Error(
          `${team}/${animationName}: residualAfter=${residualAfter.total}\n${residues}`,
        )
      }

      await writePng(outputPath, image)
      totals[`${team}/${animationName}`] = {
        ...stats,
        residualBefore,
        residualAfter,
        residualBeforeFrames,
        residualAfterFrames,
      }
    }
  }

  Object.entries(totals).forEach(([key, stats]) => {
    console.log(
      `${key}: uniformRegion=${stats.uniformRegionPixels}, recolored=${stats.recoloredPixels}, residualBefore=${formatResidualCounts(stats.residualBefore)}, residualAfter=${formatResidualCounts(stats.residualAfter)}`,
    )
    stats.frameStats.forEach((frameStats, frameIndex) => {
      console.log(
        `${key} frame ${frameIndex}: uniformRegion=${frameStats.uniformRegionPixels}, recolored=${frameStats.recoloredPixels}, residualBefore=${formatResidualCounts(stats.residualBeforeFrames[frameIndex].counts)}, residualAfter=${formatResidualCounts(stats.residualAfterFrames[frameIndex].counts)}`,
      )
    })
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
