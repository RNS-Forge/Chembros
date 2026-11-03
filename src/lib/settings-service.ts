import fs from 'fs'
import path from 'path'
import type { PlatformSettings } from '@/types'
import { DEFAULT_PLATFORM_SETTINGS } from '@/types'

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'platform_settings.json')

export function getPlatformSettingsServer(): PlatformSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_PLATFORM_SETTINGS, ...parsed }
    }
  } catch (err) {
    console.warn('Error reading platform_settings.json, falling back to defaults:', err)
  }
  return { ...DEFAULT_PLATFORM_SETTINGS }
}

export function savePlatformSettingsServer(newSettings: Partial<PlatformSettings>): PlatformSettings {
  try {
    const current = getPlatformSettingsServer()
    const merged: PlatformSettings = { ...current, ...newSettings }
    
    const dir = path.dirname(SETTINGS_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(merged, null, 2), 'utf8')
    return merged
  } catch (err) {
    console.error('Error writing platform_settings.json:', err)
    throw err
  }
}

