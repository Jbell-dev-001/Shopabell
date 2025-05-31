'use client'

import { useState, useEffect } from 'react'
import { partnershipService, PartnershipApplication, Partner } from '@/lib/admin/partnership-service'
import type { PartnerWithApplication } from '@/types/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Eye, 
  TrendingUp,
  DollarSign,
  Award,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function AdminPartnershipsPage() {
  const [applications, setApplications] = useState<PartnershipApplication[]>([])
  const [partners, setPartners] = useState<PartnerWithApplication[]>([])
  const [stats, setStats] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState<'applications' | 'partners'>('applications')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [applicationsData, partnersData, statsData] = await Promise.all([
        partnershipService.getApplications(),
        partnershipService.getPartners(),
        partnershipService.getAdminStats()
      ])
      
      setApplications(applicationsData)
      setPartners(partnersData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load partnership data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewApplication = async (
    applicationId: string, 
    decision: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      await partnershipService.reviewApplication(applicationId, decision, notes, 'admin-user-id')
      toast.success(`Application ${decision} successfully`)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error reviewing application:', error)
      toast.error(`Failed to ${decision} application`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800'
      case 'silver':
        return 'bg-gray-100 text-gray-800'
      case 'gold':
        return 'bg-yellow-100 text-yellow-800'
      case 'platinum':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = !filterStatus || app.status === filterStatus
    const matchesSearch = !searchQuery || 
      app.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = !searchQuery || 
      partner.partnership_application?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.partner_code.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading partnership data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Partnership Management</h1>
        <p className="text-gray-600 mt-2">Manage partnership applications and partners</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Partners</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activePartners}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Commission Paid</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{stats.totalCommissionPaid.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setSelectedTab('applications')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            selectedTab === 'applications'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          Applications ({applications.length})
        </button>
        <button
          onClick={() => setSelectedTab('partners')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            selectedTab === 'partners'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          Active Partners ({partners.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by business name, contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {selectedTab === 'applications' && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </div>

      {/* Applications Tab */}
      {selectedTab === 'applications' && (
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No applications found</p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{application.business_name}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Contact Person</p>
                          <p className="font-medium">{application.contact_person}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Email</p>
                          <p className="font-medium">{application.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p className="font-medium">{application.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Business Type</p>
                          <p className="font-medium capitalize">{application.business_type}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Category</p>
                          <p className="font-medium">{application.business_category}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expected Sales</p>
                          <p className="font-medium">₹{application.expected_monthly_sales.toLocaleString()}/month</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-gray-600 text-sm">Business Description</p>
                        <p className="text-sm">{application.business_description}</p>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Applied: {format(new Date(application.created_at), 'PPp')}
                      </div>
                    </div>
                    
                    {application.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleReviewApplication(application.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReviewApplication(application.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Partners Tab */}
      {selectedTab === 'partners' && (
        <div className="space-y-4">
          {filteredPartners.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No active partners found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPartners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {partner.partnership_application?.business_name || 'Unknown Business'}
                        </h3>
                        <Badge className={getTierColor(partner.tier)}>
                          {partner.tier.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {partner.commission_rate}% Commission
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Partner Code</p>
                          <p className="font-mono font-medium">{partner.partner_code}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Sales</p>
                          <p className="font-medium">₹{partner.total_sales.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly Sales</p>
                          <p className="font-medium">₹{partner.monthly_sales.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Commission Earned</p>
                          <p className="font-medium text-green-600">₹{partner.total_commission.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {partner.features_enabled.advanced_analytics && (
                          <Badge variant="secondary">Advanced Analytics</Badge>
                        )}
                        {partner.features_enabled.priority_support && (
                          <Badge variant="secondary">Priority Support</Badge>
                        )}
                        {partner.features_enabled.custom_branding && (
                          <Badge variant="secondary">Custom Branding</Badge>
                        )}
                        {partner.features_enabled.api_access && (
                          <Badge variant="secondary">API Access</Badge>
                        )}
                        {partner.features_enabled.bulk_operations && (
                          <Badge variant="secondary">Bulk Operations</Badge>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Partner since: {format(new Date(partner.created_at), 'PPP')}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Top Partners */}
      {stats && stats.topPartners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Performing Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topPartners.map((partner: any, index: number) => (
                <div key={partner.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{partner.businessName}</h4>
                      <Badge className={getTierColor(partner.tier)} variant="secondary">
                        {partner.tier.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{partner.totalSales.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">₹{partner.commission.toLocaleString()} commission</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}