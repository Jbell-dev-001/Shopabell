import Link from "next/link";
import { Store, Video, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">ShopAbell</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Start Selling
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Social Media Into a Thriving Business
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            ShopAbell empowers sellers to convert their social media followers into customers with AI-powered tools, seamless payments, and automated shipping.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700"
            >
              Start Free Trial
            </Link>
            <Link
              href="/explore"
              className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-medium border border-indigo-600 hover:bg-indigo-50"
            >
              Explore Stores
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Store Setup</h3>
            <p className="text-gray-600">
              Create your online store in minutes with WhatsApp onboarding
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Selling</h3>
            <p className="text-gray-600">
              Convert your live streams into product catalogs automatically
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Grow Your Business</h3>
            <p className="text-gray-600">
              Advanced analytics and tools to scale your social commerce
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}