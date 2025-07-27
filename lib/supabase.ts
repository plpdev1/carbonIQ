import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      farms: {
        Row: {
          id: string
          user_id: string
          name: string
          land_size: number
          coordinates: any
          boundary_data: any
          crop_types: string[]
          farming_practices: string[]
          planting_date: string
          verification_status: 'pending' | 'verified' | 'rejected'
          carbon_credits: number | null
          confidence_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          land_size: number
          coordinates: any
          boundary_data: any
          crop_types: string[]
          farming_practices: string[]
          planting_date: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          carbon_credits?: number | null
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          land_size?: number
          coordinates?: any
          boundary_data?: any
          crop_types?: string[]
          farming_practices?: string[]
          planting_date?: string
          verification_status?: 'pending' | 'verified' | 'rejected'
          carbon_credits?: number | null
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      farm_photos: {
        Row: {
          id: string
          farm_id: string
          photo_url: string
          photo_type: 'soil' | 'crops' | 'trees' | 'general'
          uploaded_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          photo_url: string
          photo_type: 'soil' | 'crops' | 'trees' | 'general'
          uploaded_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          photo_url?: string
          photo_type?: 'soil' | 'crops' | 'trees' | 'general'
          uploaded_at?: string
        }
      }
    }
  }
}