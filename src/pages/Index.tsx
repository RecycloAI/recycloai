
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Recycle, Scan, TrendingUp, Users, Award, Camera, Brain, Leaf } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Recycling Starts with a 
              <span className="text-green-600"> Click</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Use AI to identify waste types, get proper disposal instructions, and track your environmental impact. 
              Making recycling intelligent and sustainable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Scan Waste Now
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How RecycloAI Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to smarter recycling</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Photo</h3>
              <p className="text-gray-600">Take a photo of your waste item or upload an existing image</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-gray-600">Our AI identifies the waste type and material with high accuracy</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Instructions</h3>
              <p className="text-gray-600">Receive proper disposal instructions and track your impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600">Everything you need for intelligent waste management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Scan className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Recognition</h3>
              <p className="text-gray-600">97% accuracy in identifying waste materials and types</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Impact Tracking</h3>
              <p className="text-gray-600">Monitor your environmental impact and CO2 savings</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Award className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gamification</h3>
              <p className="text-gray-600">Earn points, badges, and compete with the community</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Leaf className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Education</h3>
              <p className="text-gray-600">Learn about recycling and sustainability practices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-green-100">Items Scanned</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-green-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5.2 tons</div>
              <div className="text-green-100">CO2 Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">97%</div>
              <div className="text-green-100">AI Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Recycling Smarter?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of users making a positive environmental impact</p>
          <Link to="/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
