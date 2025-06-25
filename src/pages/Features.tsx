
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Camera, Brain, TrendingUp, Award, Smartphone, Users, Globe, BookOpen } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Brain className="h-12 w-12 text-blue-600" />,
      title: "AI Waste Detection",
      description: "Advanced computer vision identifies waste materials with 97% accuracy",
      details: [
        "Recognizes 50+ waste categories",
        "Handles various lighting conditions",
        "Works with damaged or dirty items",
        "Continuous learning and improvement"
      ]
    },
    {
      icon: <Camera className="h-12 w-12 text-green-600" />,
      title: "Smart Recommendations",
      description: "Get personalized disposal instructions based on your location",
      details: [
        "Location-specific guidelines",
        "Bin color recommendations",
        "Preparation instructions",
        "Alternative disposal options"
      ]
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-purple-600" />,
      title: "Impact Tracking",
      description: "Monitor your environmental impact with detailed analytics",
      details: [
        "CO2 savings calculator",
        "Waste diversion metrics",
        "Personal progress charts",
        "Community comparisons"
      ]
    },
    {
      icon: <Award className="h-12 w-12 text-orange-600" />,
      title: "Gamification",
      description: "Earn points, badges, and compete with friends",
      details: [
        "Points for correct sorting",
        "Achievement badges",
        "Leaderboards",
        "Weekly challenges"
      ]
    },
    {
      icon: <Smartphone className="h-12 w-12 text-indigo-600" />,
      title: "Mobile Optimized",
      description: "Seamless experience across all devices",
      details: [
        "Responsive web design",
        "Camera integration",
        "Offline capabilities",
        "Fast loading times"
      ]
    },
    {
      icon: <BookOpen className="h-12 w-12 text-red-600" />,
      title: "Educational Content",
      description: "Learn about recycling and sustainability",
      details: [
        "Recycling guides",
        "Environmental tips",
        "Material fact sheets",
        "Video tutorials"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Smart Recycling
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how RecycloAI's advanced features make recycling accurate, engaging, and impactful.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                          <span className="bg-green-100 text-green-600 rounded-full p-1 mr-2 text-xs">✓</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h2>
            <p className="text-lg text-gray-600">Experience the power of AI waste detection</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Try the Demo</h3>
                <p className="text-gray-600 mb-6">
                  Upload an image or use your camera to see how our AI identifies waste materials 
                  and provides recycling instructions in real-time.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Camera className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Take a photo of any waste item</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">AI analyzes and identifies the material</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-700">Get location-specific disposal instructions</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Camera className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Interactive Demo</h4>
                <p className="text-gray-500 mb-4">Demo feature coming soon</p>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Start Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powered by Advanced Technology</h2>
            <p className="text-lg text-gray-600">Built with cutting-edge AI and machine learning</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Computer Vision</h3>
              <p className="text-gray-600">
                Advanced CNN models trained on millions of waste images for accurate classification
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Machine Learning</h3>
              <p className="text-gray-600">
                Continuous learning algorithms that improve accuracy with every scan
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cloud Processing</h3>
              <p className="text-gray-600">
                Fast, scalable cloud infrastructure for real-time image analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
