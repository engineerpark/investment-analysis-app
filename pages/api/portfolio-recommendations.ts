import { NextApiRequest, NextApiResponse } from 'next'
import { 
  savePortfolioRecommendation, 
  getPortfolioRecommendations, 
  getLatestPortfolioRecommendation 
} from '../../lib/supabase-data-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        const { userId, latest } = req.query
        
        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({ success: false, error: 'User ID is required' })
        }

        if (latest === 'true') {
          const latestRecommendation = await getLatestPortfolioRecommendation(userId)
          return res.status(200).json({ success: true, data: latestRecommendation })
        } else {
          const recommendations = await getPortfolioRecommendations(userId)
          return res.status(200).json({ success: true, data: recommendations })
        }

      case 'POST':
        const newRecommendation = req.body
        
        if (!newRecommendation.user_id) {
          return res.status(400).json({ success: false, error: 'User ID is required' })
        }

        if (!newRecommendation.recommendation_data || !newRecommendation.risk_score || 
            !newRecommendation.expected_return || !newRecommendation.allocation_percentages || 
            !newRecommendation.recommended_assets) {
          return res.status(400).json({ 
            success: false, 
            error: 'Required fields: recommendation_data, risk_score, expected_return, allocation_percentages, recommended_assets' 
          })
        }

        const savedRecommendation = await savePortfolioRecommendation(newRecommendation)
        return res.status(201).json({ success: true, data: savedRecommendation })

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}