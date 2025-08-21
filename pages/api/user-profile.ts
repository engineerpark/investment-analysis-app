import { NextApiRequest, NextApiResponse } from 'next'
import { saveUserProfile, getUserProfile, updateUserProfile } from '../../lib/supabase-data-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        const { userId } = req.query
        
        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({ success: false, error: 'User ID is required' })
        }

        const profile = await getUserProfile(userId)
        return res.status(200).json({ success: true, data: profile })

      case 'POST':
        const newProfile = req.body
        
        if (!newProfile.user_id) {
          return res.status(400).json({ success: false, error: 'User ID is required' })
        }

        const savedProfile = await saveUserProfile(newProfile)
        return res.status(201).json({ success: true, data: savedProfile })

      case 'PUT':
        const { user_id, ...updates } = req.body
        
        if (!user_id) {
          return res.status(400).json({ success: false, error: 'User ID is required' })
        }

        const updatedProfile = await updateUserProfile(user_id, updates)
        return res.status(200).json({ success: true, data: updatedProfile })

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT'])
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