import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database type definitions for investment analysis
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          age?: number
          risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
          investment_experience: 'beginner' | 'intermediate' | 'advanced'
          investment_goals: string[]
          monthly_investment?: number
          investment_period?: number
          financial_situation?: string
          preferred_sectors?: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number
          risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
          investment_experience: 'beginner' | 'intermediate' | 'advanced'
          investment_goals: string[]
          monthly_investment?: number
          investment_period?: number
          financial_situation?: string
          preferred_sectors?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive'
          investment_experience?: 'beginner' | 'intermediate' | 'advanced'
          investment_goals?: string[]
          monthly_investment?: number
          investment_period?: number
          financial_situation?: string
          preferred_sectors?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_recommendations: {
        Row: {
          id: string
          user_id: string
          recommendation_data: any
          risk_score: number
          expected_return: number
          allocation_percentages: any
          recommended_assets: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recommendation_data: any
          risk_score: number
          expected_return: number
          allocation_percentages: any
          recommended_assets: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recommendation_data?: any
          risk_score?: number
          expected_return?: number
          allocation_percentages?: any
          recommended_assets?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      saved_portfolios: {
        Row: {
          id: string
          user_id: string
          portfolio_name: string
          portfolio_data: any
          is_active: boolean
          performance_data?: any
          last_rebalanced?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          portfolio_name: string
          portfolio_data: any
          is_active?: boolean
          performance_data?: any
          last_rebalanced?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          portfolio_name?: string
          portfolio_data?: any
          is_active?: boolean
          performance_data?: any
          last_rebalanced?: string
          created_at?: string
          updated_at?: string
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
  }
}

// Type helpers
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type PortfolioRecommendation = Database['public']['Tables']['portfolio_recommendations']['Row']
export type SavedPortfolio = Database['public']['Tables']['saved_portfolios']['Row']