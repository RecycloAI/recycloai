
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Users, Target, Award, Globe } from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-founder",
      bio: "Former Google AI researcher with 8+ years in machine learning and environmental tech.",
      image: "/placeholder.svg"
    },
    {
      name: "Alex Rodriguez",
      role: "CTO & Co-founder", 
      bio: "Full-stack engineer passionate about using technology for sustainability.",
      image: "/placeholder.svg"
    },
    {
      name: "Dr. Maria Santos",
      role: "ML Engineer",
      bio: "PhD in Computer Vision, specializing in object detection and classification.",
      image: "/placeholder.svg"
    },
    {
      name: "James Wilson",
      role: "Product Manager",
      bio: "Environmental science background with expertise in waste management systems.",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About RecycloAI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to revolutionize waste management through artificial intelligence, 
            making recycling accessible, accurate, and impactful for everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                We believe that proper waste sorting and recycling should be simple, accurate, and rewarding. 
                Every year, millions of tons of recyclable materials end up in landfills due to confusion 
                about proper disposal methods.
              </p>
              <p className="text-lg text-gray-600">
                RecycloAI bridges this knowledge gap by providing instant, AI-powered waste identification 
                and personalized recycling guidance, empowering individuals and communities to make a 
                meaningful environmental impact.
              </p>
            </div>
            <div className="bg-green-50 p-8 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <Target className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Accuracy</h3>
                  <p className="text-gray-600 text-sm">97% AI identification rate</p>
                </div>
                <div className="text-center">
                  <Globe className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Impact</h3>
                  <p className="text-gray-600 text-sm">Reducing landfill waste</p>
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Community</h3>
                  <p className="text-gray-600 text-sm">Growing user base</p>
                </div>
                <div className="text-center">
                  <Award className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Recognition</h3>
                  <p className="text-gray-600 text-sm">Award-winning solution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem</h2>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-red-100 text-red-600 rounded-full p-1 mr-3 mt-1">✗</span>
                  <span>68% of recyclable materials are incorrectly disposed of</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-100 text-red-600 rounded-full p-1 mr-3 mt-1">✗</span>
                  <span>Confusing recycling guidelines vary by location</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-100 text-red-600 rounded-full p-1 mr-3 mt-1">✗</span>
                  <span>Lack of feedback on environmental impact</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-100 text-red-600 rounded-full p-1 mr-3 mt-1">✗</span>
                  <span>Limited education about proper waste management</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3 mt-1">✓</span>
                  <span>AI-powered instant waste identification</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3 mt-1">✓</span>
                  <span>Location-specific disposal instructions</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3 mt-1">✓</span>
                  <span>Real-time environmental impact tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3 mt-1">✓</span>
                  <span>Gamified learning and community engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">Passionate experts working to make recycling smarter</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-48 object-cover bg-gray-200"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-green-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Impact So Far</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">2.1M</div>
              <div className="text-green-100">Items Correctly Identified</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">850</div>
              <div className="text-green-100">Tons of Waste Diverted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">45%</div>
              <div className="text-green-100">Improvement in User Recycling</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
