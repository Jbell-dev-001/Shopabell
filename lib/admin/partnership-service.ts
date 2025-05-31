import { createClient } from '@/lib/supabase/client'

export interface PartnershipApplication {
  id: string
  business_name: string
  contact_person: string
  email: string
  phone: string
  business_type: 'individual' | 'small_business' | 'enterprise' | 'influencer'
  business_category: string
  business_description: string
  website_url?: string
  social_media_links: {
    instagram?: string
    facebook?: string
    youtube?: string
    whatsapp?: string
  }
  expected_monthly_sales: number
  commission_preference: number // percentage
  referral_code?: string
  documents: {
    business_registration?: string
    tax_certificate?: string
    bank_statement?: string
    identity_proof?: string
  }
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  admin_notes?: string
  created_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface Partner {
  id: string
  partnership_application_id: string
  partner_code: string
  commission_rate: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  total_sales: number
  total_commission: number
  monthly_sales: number
  referral_count: number
  performance_score: number
  features_enabled: {
    advanced_analytics: boolean
    priority_support: boolean
    custom_branding: boolean
    api_access: boolean
    bulk_operations: boolean
  }
  created_at: string
  updated_at: string
}

export interface CommissionTier {
  tier: string
  minMonthlySales: number
  commissionRate: number
  features: string[]
  benefits: string[]
}

export const COMMISSION_TIERS: CommissionTier[] = [
  {
    tier: 'bronze',
    minMonthlySales: 0,
    commissionRate: 2,
    features: ['Basic Analytics', 'Standard Support'],
    benefits: ['2% commission on sales', 'Access to seller dashboard']
  },
  {
    tier: 'silver',
    minMonthlySales: 50000,
    commissionRate: 3,
    features: ['Enhanced Analytics', 'Priority Support', 'Bulk Operations'],
    benefits: ['3% commission on sales', 'Priority customer support', 'Bulk product upload']
  },
  {
    tier: 'gold',
    minMonthlySales: 200000,
    commissionRate: 4,
    features: ['Advanced Analytics', 'Priority Support', 'Custom Branding', 'API Access'],
    benefits: ['4% commission on sales', 'Custom store branding', 'API integration access']
  },
  {
    tier: 'platinum',
    minMonthlySales: 500000,
    commissionRate: 5,
    features: ['All Features', 'Dedicated Account Manager'],
    benefits: ['5% commission on sales', 'Dedicated account manager', 'Custom integrations']
  }
]

export class PartnershipService {
  private supabase = createClient()

  async submitApplication(applicationData: Omit<PartnershipApplication, 'id' | 'status' | 'created_at'>): Promise<PartnershipApplication> {
    try {
      const { data, error } = await this.supabase
        .from('partnership_applications')
        .insert({
          ...applicationData,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error submitting partnership application:', error)
      throw new Error('Failed to submit partnership application')
    }
  }

  async getApplications(status?: string): Promise<PartnershipApplication[]> {
    try {
      let query = this.supabase
        .from('partnership_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching applications:', error)
      throw new Error('Failed to fetch applications')
    }
  }

  async reviewApplication(
    applicationId: string, 
    decision: 'approved' | 'rejected', 
    adminNotes?: string,
    adminId?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('partnership_applications')
        .update({
          status: decision,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId
        })
        .eq('id', applicationId)

      if (error) throw error

      // If approved, create partner record
      if (decision === 'approved') {
        await this.createPartner(applicationId)
      }
    } catch (error) {
      console.error('Error reviewing application:', error)
      throw new Error('Failed to review application')
    }
  }

  private async createPartner(applicationId: string): Promise<Partner> {
    try {
      // Get application details
      const { data: application, error: appError } = await this.supabase
        .from('partnership_applications')
        .select('*')
        .eq('id', applicationId)
        .single()

      if (appError) throw appError

      // Generate unique partner code
      const partnerCode = this.generatePartnerCode(application.business_name)

      // Determine initial tier based on expected sales
      const tier = this.calculateTier(application.expected_monthly_sales)
      const tierInfo = COMMISSION_TIERS.find(t => t.tier === tier)!

      const partnerData = {
        partnership_application_id: applicationId,
        partner_code: partnerCode,
        commission_rate: tierInfo.commissionRate,
        tier: tier as Partner['tier'],
        total_sales: 0,
        total_commission: 0,
        monthly_sales: 0,
        referral_count: 0,
        performance_score: 100,
        features_enabled: {
          advanced_analytics: tier === 'gold' || tier === 'platinum',
          priority_support: tier !== 'bronze',
          custom_branding: tier === 'gold' || tier === 'platinum',
          api_access: tier === 'gold' || tier === 'platinum',
          bulk_operations: tier !== 'bronze'
        }
      }

      const { data, error } = await this.supabase
        .from('partners')
        .insert(partnerData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating partner:', error)
      throw new Error('Failed to create partner')
    }
  }

  async getPartners(): Promise<Partner[]> {
    try {
      const { data, error } = await this.supabase
        .from('partners')
        .select(`
          *,
          partnership_application:partnership_applications(
            business_name,
            contact_person,
            email,
            phone,
            business_category
          )
        `)
        .order('total_sales', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching partners:', error)
      throw new Error('Failed to fetch partners')
    }
  }

  async updatePartnerTier(partnerId: string): Promise<void> {
    try {
      const { data: partner, error } = await this.supabase
        .from('partners')
        .select('monthly_sales')
        .eq('id', partnerId)
        .single()

      if (error) throw error

      const newTier = this.calculateTier(partner.monthly_sales)
      const tierInfo = COMMISSION_TIERS.find(t => t.tier === newTier)!

      await this.supabase
        .from('partners')
        .update({
          tier: newTier,
          commission_rate: tierInfo.commissionRate,
          features_enabled: {
            advanced_analytics: newTier === 'gold' || newTier === 'platinum',
            priority_support: newTier !== 'bronze',
            custom_branding: newTier === 'gold' || newTier === 'platinum',
            api_access: newTier === 'gold' || newTier === 'platinum',
            bulk_operations: newTier !== 'bronze'
          }
        })
        .eq('id', partnerId)
    } catch (error) {
      console.error('Error updating partner tier:', error)
      throw new Error('Failed to update partner tier')
    }
  }

  async updatePartnerSales(partnerId: string, salesAmount: number): Promise<void> {
    try {
      const { data: partner, error } = await this.supabase
        .from('partners')
        .select('total_sales, monthly_sales, commission_rate, total_commission')
        .eq('id', partnerId)
        .single()

      if (error) throw error

      const commission = salesAmount * (partner.commission_rate / 100)

      await this.supabase
        .from('partners')
        .update({
          total_sales: partner.total_sales + salesAmount,
          monthly_sales: partner.monthly_sales + salesAmount,
          total_commission: partner.total_commission + commission
        })
        .eq('id', partnerId)

      // Check if tier update is needed
      await this.updatePartnerTier(partnerId)
    } catch (error) {
      console.error('Error updating partner sales:', error)
      throw new Error('Failed to update partner sales')
    }
  }

  async getPartnerByCode(partnerCode: string): Promise<Partner | null> {
    try {
      const { data, error } = await this.supabase
        .from('partners')
        .select('*')
        .eq('partner_code', partnerCode)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Error fetching partner by code:', error)
      throw new Error('Failed to fetch partner')
    }
  }

  async resetMonthlyStats(): Promise<void> {
    try {
      await this.supabase
        .from('partners')
        .update({ monthly_sales: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all records
    } catch (error) {
      console.error('Error resetting monthly stats:', error)
      throw new Error('Failed to reset monthly stats')
    }
  }

  private generatePartnerCode(businessName: string): string {
    const prefix = businessName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3)
    
    const timestamp = Date.now().toString(36).toUpperCase()
    return `${prefix}${timestamp}`
  }

  private calculateTier(monthlySales: number): string {
    if (monthlySales >= 500000) return 'platinum'
    if (monthlySales >= 200000) return 'gold'
    if (monthlySales >= 50000) return 'silver'
    return 'bronze'
  }

  async getAdminStats(): Promise<{
    totalApplications: number
    pendingApplications: number
    approvedApplications: number
    rejectedApplications: number
    activePartners: number
    totalCommissionPaid: number
    topPartners: Array<{
      id: string
      businessName: string
      tier: string
      totalSales: number
      commission: number
    }>
  }> {
    try {
      // Get application stats
      const { data: applications } = await this.supabase
        .from('partnership_applications')
        .select('status')

      const totalApplications = applications?.length || 0
      const pendingApplications = applications?.filter(a => a.status === 'pending').length || 0
      const approvedApplications = applications?.filter(a => a.status === 'approved').length || 0
      const rejectedApplications = applications?.filter(a => a.status === 'rejected').length || 0

      // Get partner stats
      const { data: partners } = await this.supabase
        .from('partners')
        .select(`
          *,
          partnership_application:partnership_applications(business_name)
        `)

      const activePartners = partners?.length || 0
      const totalCommissionPaid = partners?.reduce((sum, p) => sum + p.total_commission, 0) || 0

      const topPartners = partners
        ?.sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          businessName: p.partnership_application?.business_name || 'Unknown',
          tier: p.tier,
          totalSales: p.total_sales,
          commission: p.total_commission
        })) || []

      return {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        activePartners,
        totalCommissionPaid,
        topPartners
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      throw new Error('Failed to fetch admin stats')
    }
  }
}

export const partnershipService = new PartnershipService()