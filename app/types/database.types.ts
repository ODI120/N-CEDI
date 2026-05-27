export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      site_stats: {
        Row: {
          id: string
          value: number
          prefix: string | null
          suffix: string | null
          label: string
          icon: string | null
          display_order: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          value: number
          prefix?: string | null
          suffix?: string | null
          label: string
          icon?: string | null
          display_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          value?: number
          prefix?: string | null
          suffix?: string | null
          label?: string
          icon?: string | null
          display_order?: number
          is_published?: boolean
          updated_at?: string
        }
      }
      gallery_items: {
        Row: {
          id: string
          title: string | null
          media_url: string
          media_type: 'image' | 'video'
          alt_text: string | null
          category_id: string | null
          event_id: string | null
          program_id: string | null
          is_published: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          media_url: string
          media_type: 'image' | 'video'
          alt_text?: string | null
          category_id?: string | null
          event_id?: string | null
          program_id?: string | null
          is_published?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          title?: string | null
          media_url?: string
          media_type?: 'image' | 'video'
          alt_text?: string | null
          category_id?: string | null
          event_id?: string | null
          program_id?: string | null
          is_published?: boolean
          display_order?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}