import type { PlatformSettings } from '@/types'
import { DEFAULT_PLATFORM_SETTINGS } from '@/types'
import { supabaseAdmin } from './supabase-admin'

/**
 * Reads platform settings from Supabase `platform_settings` table.
 * Falls back to DEFAULT_PLATFORM_SETTINGS if table/row doesn't exist.
 */
export async function getPlatformSettingsServer(): Promise<PlatformSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from('platform_settings')
      .select('settings')
      .eq('id', 1)
      .single()

    if (error || !data) {
      console.warn('Settings row not found in Supabase, using defaults:', error?.message)
      return { ...DEFAULT_PLATFORM_SETTINGS }
    }

    const parsed = typeof data.settings === 'string' ? JSON.parse(data.settings) : data.settings
    return { ...DEFAULT_PLATFORM_SETTINGS, ...parsed }
  } catch (err) {
    console.warn('Error reading platform settings from Supabase, falling back to defaults:', err)
    return { ...DEFAULT_PLATFORM_SETTINGS }
  }
}

/**
 * Saves (upserts) platform settings to Supabase `platform_settings` table.
 */
export async function savePlatformSettingsServer(newSettings: Partial<PlatformSettings>): Promise<PlatformSettings> {
  try {
    const current = await getPlatformSettingsServer()
    const merged: PlatformSettings = { ...current, ...newSettings }

    const { error } = await supabaseAdmin
      .from('platform_settings')
      .upsert({
        id: 1,
        settings: merged,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Supabase upsert error:', error.message)
      throw new Error(error.message)
    }

    return merged
  } catch (err) {
    console.error('Error writing platform settings to Supabase:', err)
    throw err
  }
}
