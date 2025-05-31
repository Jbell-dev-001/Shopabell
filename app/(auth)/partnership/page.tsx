'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { partnershipService, COMMISSION_TIERS } from '@/lib/admin/partnership-service'
import { toast } from 'sonner'
import { Handshake, Star, TrendingUp, Users, Shield, CheckCircle } from 'lucide-react'

const partnershipSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  contact_person: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  business_type: z.enum(['individual', 'small_business', 'enterprise', 'influencer']),
  business_category: z.string().min(2, 'Business category is required'),
  business_description: z.string().min(10, 'Please provide a detailed business description'),
  website_url: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  whatsapp: z.string().optional(),
  expected_monthly_sales: z.number().min(0, 'Expected monthly sales must be positive'),
  commission_preference: z.number().min(1).max(10),
  referral_code: z.string().optional()
})

type PartnershipFormData = z.infer<typeof partnershipSchema>

export default function PartnershipPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PartnershipFormData>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: {
      commission_preference: 3,
      expected_monthly_sales: 0
    }
  })

  const expectedSales = watch('expected_monthly_sales') || 0

  // Calculate which tier user would be in
  const calculateUserTier = (sales: number) => {
    if (sales >= 500000) return 'platinum'
    if (sales >= 200000) return 'gold'
    if (sales >= 50000) return 'silver'
    return 'bronze'
  }

  const userTier = calculateUserTier(expectedSales)

  const onSubmit = async (data: PartnershipFormData) => {
    setIsSubmitting(true)
    try {
      const applicationData = {
        business_name: data.business_name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        business_type: data.business_type,
        business_category: data.business_category,
        business_description: data.business_description,
        website_url: data.website_url || undefined,
        social_media_links: {
          instagram: data.instagram,
          facebook: data.facebook,
          youtube: data.youtube,
          whatsapp: data.whatsapp
        },
        expected_monthly_sales: data.expected_monthly_sales,
        commission_preference: data.commission_preference,
        referral_code: data.referral_code,
        documents: {}
      }

      await partnershipService.submitApplication(applicationData)
      toast.success('Partnership application submitted successfully!')
      router.push('/login?message=partnership_submitted')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Handshake className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Partner with ShopAbell</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our partnership program and grow your business with our social commerce platform. 
            Earn commissions, access exclusive features, and get dedicated support.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Earn Higher Commissions</h3>
              <p className="text-gray-600">Up to 5% commission on all sales with tier-based increases</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Priority Support</h3>
              <p className="text-gray-600">Get dedicated account manager and priority customer support</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Exclusive Features</h3>
              <p className="text-gray-600">Access advanced analytics, custom branding, and API integrations</p>
            </CardContent>
          </Card>
        </div>

        {/* Commission Tiers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Commission Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMISSION_TIERS.map((tier) => (
              <Card 
                key={tier.tier}
                className={`relative ${
                  userTier === tier.tier ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                }`}
              >
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <span className="capitalize">{tier.tier}</span>
                    {userTier === tier.tier && (
                      <Badge variant="default" className="bg-indigo-600">Your Tier</Badge>
                    )}
                  </CardTitle>
                  <div className="text-3xl font-bold text-indigo-600">
                    {tier.commissionRate}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Min. ₹{tier.minMonthlySales.toLocaleString()}/month
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Partnership Application</CardTitle>
            <p className="text-gray-600">Fill out this form to apply for our partnership program</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Business Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    {...register('business_name')}
                    placeholder="Your business name"
                  />
                  {errors.business_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input
                    id="contact_person"
                    {...register('contact_person')}
                    placeholder="Your full name"
                  />
                  {errors.contact_person && (
                    <p className="text-red-500 text-sm mt-1">{errors.contact_person.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+91 9876543210"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="business_type">Business Type *</Label>
                  <select
                    id="business_type"
                    {...register('business_type')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select business type</option>
                    <option value="individual">Individual</option>
                    <option value="small_business">Small Business</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="influencer">Influencer</option>
                  </select>
                  {errors.business_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_type.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="business_category">Business Category *</Label>
                  <Input
                    id="business_category"
                    {...register('business_category')}
                    placeholder="e.g. Fashion, Electronics, Food"
                  />
                  {errors.business_category && (
                    <p className="text-red-500 text-sm mt-1">{errors.business_category.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="business_description">Business Description *</Label>
                <textarea
                  id="business_description"
                  {...register('business_description')}
                  placeholder="Tell us about your business, what you sell, and your target audience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                />
                {errors.business_description && (
                  <p className="text-red-500 text-sm mt-1">{errors.business_description.message}</p>
                )}
              </div>

              {/* Online Presence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    {...register('website_url')}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input
                    id="instagram"
                    {...register('instagram')}
                    placeholder="@yourinstagram"
                  />
                </div>

                <div>
                  <Label htmlFor="facebook">Facebook Page</Label>
                  <Input
                    id="facebook"
                    {...register('facebook')}
                    placeholder="Your Facebook page URL"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube">YouTube Channel</Label>
                  <Input
                    id="youtube"
                    {...register('youtube')}
                    placeholder="Your YouTube channel URL"
                  />
                </div>
              </div>

              {/* Sales Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expected_monthly_sales">Expected Monthly Sales (₹) *</Label>
                  <Input
                    id="expected_monthly_sales"
                    type="number"
                    {...register('expected_monthly_sales', { valueAsNumber: true })}
                    placeholder="50000"
                  />
                  {errors.expected_monthly_sales && (
                    <p className="text-red-500 text-sm mt-1">{errors.expected_monthly_sales.message}</p>
                  )}
                  {expectedSales > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      You'll start in the <strong className="capitalize">{userTier}</strong> tier
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="referral_code">Referral Code (Optional)</Label>
                  <Input
                    id="referral_code"
                    {...register('referral_code')}
                    placeholder="Enter referral code if you have one"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Partnership Application'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Success Stories */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "ShopAbell's partnership program helped me grow my fashion business from ₹50k to ₹5L monthly sales in just 6 months!"
                </p>
                <p className="font-semibold">- Priya Sharma, Fashion Retailer</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The live selling feature and commission structure made it easy to scale my electronics business online."
                </p>
                <p className="font-semibold">- Raj Kumar, Electronics Dealer</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The WhatsApp integration and chat commerce features perfectly fit my home bakery business model."
                </p>
                <p className="font-semibold">- Meera Patel, Home Baker</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}