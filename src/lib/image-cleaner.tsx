'use client'
import React, { useState, useEffect } from 'react'

const cleanedUrlCache = new Map<string, string>()
const pendingPromises = new Map<string, Promise<string>>()

/**
 * Removes an accidental black background box from bottle product photos.
 * Uses edge-connected boundary flood-fill starting strictly from the outer borders.
 * This preserves dark bottle caps, labels, and perfume contents in the interior.
 */
export function removeBlackBackgroundFromCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean {
  try {
    const imgData = ctx.getImageData(0, 0, width, height)
    const data = imgData.data
    const totalPixels = width * height

    // Check if outer corners have black pixels (r,g,b < 30, alpha > 180)
    const corners = [0, width - 1, (height - 1) * width, (height - 1) * width + (width - 1)]
    let hasBlackCorners = false
    for (const c of corners) {
      const r = data[c * 4]
      const g = data[c * 4 + 1]
      const b = data[c * 4 + 2]
      const a = data[c * 4 + 3]
      if (a > 180 && r < 35 && g < 35 && b < 35) {
        hasBlackCorners = true
        break
      }
    }

    if (!hasBlackCorners) return false

    const visited = new Uint8Array(totalPixels)
    const queue: number[] = []

    const isBlackBg = (idx: number) => {
      const a = data[idx * 4 + 3]
      if (a === 0) return true // already transparent
      const r = data[idx * 4]
      const g = data[idx * 4 + 1]
      const b = data[idx * 4 + 2]
      // Matches dark background near edges (with tolerance for compression noise)
      return r < 35 && g < 35 && b < 35
    }

    // Seed queue from outer boundaries
    for (let x = 0; x < width; x++) {
      const top = x
      const bottom = (height - 1) * width + x
      if (isBlackBg(top) && !visited[top]) {
        visited[top] = 1
        queue.push(top)
      }
      if (isBlackBg(bottom) && !visited[bottom]) {
        visited[bottom] = 1
        queue.push(bottom)
      }
    }

    for (let y = 0; y < height; y++) {
      const left = y * width
      const right = y * width + (width - 1)
      if (isBlackBg(left) && !visited[left]) {
        visited[left] = 1
        queue.push(left)
      }
      if (isBlackBg(right) && !visited[right]) {
        visited[right] = 1
        queue.push(right)
      }
    }

    if (queue.length === 0) return false

    let head = 0
    while (head < queue.length) {
      const curr = queue[head++]
      data[curr * 4 + 3] = 0 // Clear alpha to transparent

      const x = curr % width
      const y = Math.floor(curr / width)

      if (x > 0) {
        const n = curr - 1
        if (!visited[n] && isBlackBg(n)) { visited[n] = 1; queue.push(n) }
      }
      if (x < width - 1) {
        const n = curr + 1
        if (!visited[n] && isBlackBg(n)) { visited[n] = 1; queue.push(n) }
      }
      if (y > 0) {
        const n = curr - width
        if (!visited[n] && isBlackBg(n)) { visited[n] = 1; queue.push(n) }
      }
      if (y < height - 1) {
        const n = curr + width
        if (!visited[n] && isBlackBg(n)) { visited[n] = 1; queue.push(n) }
      }
    }

    ctx.putImageData(imgData, 0, 0)
    return true
  } catch (err) {
    console.warn('Black background removal warning:', err)
    return false
  }
}

/**
 * Checks an image URL or dataURL and cleans off any accidental black background box,
 * returning a transparent PNG dataURL.
 */
export function cleanProductImageAsync(src: string): Promise<string> {
  if (!src) return Promise.resolve(src)
  if (cleanedUrlCache.has(src)) return Promise.resolve(cleanedUrlCache.get(src)!)
  if (pendingPromises.has(src)) return pendingPromises.get(src)!

  if (typeof window === 'undefined') return Promise.resolve(src)

  const promise = new Promise<string>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          cleanedUrlCache.set(src, src)
          resolve(src)
          return
        }

        ctx.drawImage(img, 0, 0)
        const modified = removeBlackBackgroundFromCanvas(ctx, img.width, img.height)
        if (modified) {
          const cleanedUrl = canvas.toDataURL('image/png')
          cleanedUrlCache.set(src, cleanedUrl)
          resolve(cleanedUrl)
        } else {
          cleanedUrlCache.set(src, src)
          resolve(src)
        }
      } catch {
        cleanedUrlCache.set(src, src)
        resolve(src)
      }
    }
    img.onerror = () => {
      cleanedUrlCache.set(src, src)
      resolve(src)
    }
    img.src = src
  }).finally(() => {
    pendingPromises.delete(src)
  })

  pendingPromises.set(src, promise)
  return promise
}

/**
 * React Component for displaying product bottle images cleanly without black background boxes.
 */
export function CleanProductImage({
  src,
  alt,
  className,
  draggable = false,
  id,
}: {
  src: string
  alt: string
  className?: string
  draggable?: boolean
  id?: string
}) {
  const [displaySrc, setDisplaySrc] = useState<string>(() => cleanedUrlCache.get(src) || src)

  useEffect(() => {
    let isMounted = true
    if (!src) {
      setDisplaySrc('')
      return
    }

    if (cleanedUrlCache.has(src)) {
      setDisplaySrc(cleanedUrlCache.get(src)!)
      return
    }

    cleanProductImageAsync(src).then((cleaned) => {
      if (isMounted) {
        setDisplaySrc(cleaned)
      }
    })

    return () => {
      isMounted = false
    }
  }, [src])

  return (
    <img
      id={id}
      src={displaySrc}
      alt={alt}
      className={className}
      draggable={draggable}
    />
  )
}

