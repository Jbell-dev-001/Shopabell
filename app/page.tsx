import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-whatsapp to-whatsapp-dark">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-whatsapp font-bold text-xl">S</span>
            </div>
            <h1 className="text-white text-xl font-bold">ShopAbell</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-white border-white hover:bg-white/10" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button className="bg-white text-whatsapp hover:bg-white/90" asChild>
              <Link href="/whatsapp-onboarding">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Start Selling on<br />
            <span className="text-yellow-300">WhatsApp</span> Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Create your online store through a simple WhatsApp conversation. 
            Use AI to capture products from livestream and manage orders seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-whatsapp hover:bg-white/90 text-lg px-8" asChild>
              <Link href="/whatsapp-onboarding">
                🚀 Start Free Setup
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8" asChild>
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <CardTitle>WhatsApp Onboarding</CardTitle>
              <CardDescription className="text-white/80">
                Set up your complete online store through a simple WhatsApp-like conversation. No technical knowledge required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <CardTitle>AI Product Capture</CardTitle>
              <CardDescription className="text-white/80">
                Stream live or upload videos to automatically extract product information using advanced AI technology.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle>Smart Sell Commands</CardTitle>
              <CardDescription className="text-white/80">
                Type "sell product name 1000" in chat to instantly create products and process orders.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* How It Works */}
        <section className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-8">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Start Conversation", desc: "Begin your WhatsApp onboarding" },
              { step: 2, title: "Add Products", desc: "Use AI livestream or manual entry" },
              { step: 3, title: "Receive Orders", desc: "Get orders through chat system" },
              { step: 4, title: "Grow Business", desc: "Track analytics and scale up" }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-whatsapp font-bold text-xl">
                  {item.step}
                </div>
                <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                <p className="text-white/80 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Start Your Online Business?
          </h3>
          <p className="text-white/90 mb-6">
            Join thousands of sellers who are already growing their business with ShopAbell
          </p>
          <Button size="lg" className="bg-yellow-400 text-whatsapp hover:bg-yellow-300 text-lg px-8" asChild>
            <Link href="/whatsapp-onboarding">
              Start Your Store Now →
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white/5 backdrop-blur-md border-t border-white/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-whatsapp font-bold">S</span>
                </div>
                <span className="text-white font-bold">ShopAbell</span>
              </div>
              <p className="text-white/80 text-sm">
                WhatsApp-first e-commerce platform for small businesses in India.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>WhatsApp Onboarding</li>
                <li>AI Product Capture</li>
                <li>Order Management</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Partnership Program</li>
                <li>API Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80 text-sm">
            © 2024 ShopAbell. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}