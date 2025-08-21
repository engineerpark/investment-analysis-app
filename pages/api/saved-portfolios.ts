import { NextApiRequest, NextApiResponse } from 'next'
import { 
  savePortfolio, 
  getSavedPortfolios, 
  updateSavedPortfolio, 
  deleteSavedPortfolio 
} from '../../lib/supabase-data-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        const { userId } = req.query
        
        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({ success: false, error: 'User ID is required' })
        }

        const portfolios = await getSavedPortfolios(userId)
        return res.status(200).json({ success: true, data: portfolios })

      case 'POST':
        const newPortfolio = req.body
        
        if (!newPortfolio.user_id) {
          return res.status(400).json({ success: false, error: 'User ID is required' })
        }

        if (!newPortfolio.portfolio_name || !newPortfolio.portfolio_data) {
          return res.status(400).json({ 
            success: false, 
            error: 'Portfolio name and portfolio data are required' 
          })
        }

        const savedPortfolio = await savePortfolio(newPortfolio)
        return res.status(201).json({ success: true, data: savedPortfolio })

      case 'PUT':
        const { id, ...updates } = req.body
        
        if (!id) {
          return res.status(400).json({ success: false, error: 'Portfolio ID is required' })
        }

        const updatedPortfolio = await updateSavedPortfolio(id, updates)
        return res.status(200).json({ success: true, data: updatedPortfolio })

      case 'DELETE':
        const { portfolioId } = req.query
        
        if (!portfolioId || typeof portfolioId !== 'string') {
          return res.status(400).json({ success: false, error: 'Portfolio ID is required' })
        }

        await deleteSavedPortfolio(portfolioId)
        return res.status(200).json({ success: true, message: 'Portfolio deleted successfully' })

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
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