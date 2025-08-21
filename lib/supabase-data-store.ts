import { supabase, UserProfile, PortfolioRecommendation, SavedPortfolio } from './supabase'

// User Profile Operations
export const saveUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error saving user profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to save user profile:', error)
    throw error
  }
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return null
      }
      console.error('Error getting user profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to get user profile:', error)
    throw error
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to update user profile:', error)
    throw error
  }
}

// Portfolio Recommendation Operations
export const savePortfolioRecommendation = async (
  recommendation: Omit<PortfolioRecommendation, 'id' | 'created_at' | 'updated_at'>
): Promise<PortfolioRecommendation> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_recommendations')
      .insert([{
        ...recommendation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error saving portfolio recommendation:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to save portfolio recommendation:', error)
    throw error
  }
}

export const getPortfolioRecommendations = async (userId: string): Promise<PortfolioRecommendation[]> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting portfolio recommendations:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to get portfolio recommendations:', error)
    throw error
  }
}

export const getLatestPortfolioRecommendation = async (userId: string): Promise<PortfolioRecommendation | null> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No recommendations found
        return null
      }
      console.error('Error getting latest portfolio recommendation:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to get latest portfolio recommendation:', error)
    throw error
  }
}

// Saved Portfolio Operations
export const savePortfolio = async (portfolio: Omit<SavedPortfolio, 'id' | 'created_at' | 'updated_at'>): Promise<SavedPortfolio> => {
  try {
    const { data, error } = await supabase
      .from('saved_portfolios')
      .insert([{
        ...portfolio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error saving portfolio:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to save portfolio:', error)
    throw error
  }
}

export const getSavedPortfolios = async (userId: string): Promise<SavedPortfolio[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting saved portfolios:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to get saved portfolios:', error)
    throw error
  }
}

export const updateSavedPortfolio = async (
  portfolioId: string, 
  updates: Partial<SavedPortfolio>
): Promise<SavedPortfolio> => {
  try {
    const { data, error } = await supabase
      .from('saved_portfolios')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', portfolioId)
      .select()
      .single()

    if (error) {
      console.error('Error updating saved portfolio:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to update saved portfolio:', error)
    throw error
  }
}

export const deleteSavedPortfolio = async (portfolioId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('saved_portfolios')
      .delete()
      .eq('id', portfolioId)

    if (error) {
      console.error('Error deleting saved portfolio:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to delete saved portfolio:', error)
    throw error
  }
}