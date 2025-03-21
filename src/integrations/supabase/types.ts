export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          memory_data: Json | null
          session_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          memory_data?: Json | null
          session_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          memory_data?: Json | null
          session_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
      }
      downloads: {
        Row: {
          id: string
          created_at: string
          user_id: string
          resume_name: string
          format: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          resume_name: string
          format: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          resume_name?: string
          format?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          tier: string
          active: boolean
          expires_at?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          tier: string
          active?: boolean
          expires_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          tier?: string
          active?: boolean
          expires_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_download_limit: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_remaining_downloads: {
        Args: { user_id: string }
        Returns: number
      }
    }
    Enums: {
      subscription_tier: "free" | "premium" | "business"
    }
  }
}
