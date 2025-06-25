
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Users, Building, GraduationCap, Code, ChartBar, Headphones } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Users className="h-12 w-12 text-blue-600" />,
      title: "For Individuals",
      description: "Personal waste management and recycling guidance",
      features: [
        "AI-powered waste identification",
        "Personal impact tracking", 
        "Gamification and rewards",
        "Educational content"
      ],
      pricing: "Free"
    },
    {
      icon: <Building className="h-12 w-12 text-green-600" />,
      title: "For Municipalities",
      description: "Smart city waste management solutions",
      features: [
        "Smart bin integration",
        "City-wide analytics dashboard",
        "Route optimization",
        "Citizen engagement platform"
      ],
      pricing: "Custom"
    },
    {
      icon: <Building className="h-12 w-12 text-purple-600" />,
      title: "For Businesses",
      description: "Corporate waste auditing and management",
      features: [
        "Waste audit reports",
        "Employee training platform",
        "Compliance monitoring",
        "Cost reduction analytics"
      ],
      pricing: "Starting at $500/month"
    },
    {
      icon: <GraduationCap className="h-12 w-12 text-orange-600" />,
      title: "For Schools",
      description: "Educational programs and sustainability initiatives",
      features: [
        "Curriculum integration",
        "Student competitions",
        "Progress tracking",
        "Teacher resources"
      ],
      pricing: "Starting at $100/month"
    }
  ];

  const additionalServices = [
    {
      icon: <Code className="h-8 w-8 text-indigo-600" />,
      title: "API & SDK",
      description: "Integrate our waste detection AI into your own applications",
    },
    {
      icon: <ChartBar className="h-8 w-8 text-green-600" />,
      title: "Custom Analytics",
      description: "Tailored reporting and insights for your specific needs",
    },
    {
      icon: <Headphones className="h-8 w-8 text-blue-600" />,
      title: "Consulting Services",
      description: "Expert guidance on waste management strategy and implementation",
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Services for Every Need
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From individual users to large organizations, we provide AI-powered waste management 
            solutions tailored to your specific requirements.
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Solution</h2>
            <p className="text-lg text-gray-600">Scalable solutions for different user types</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white border rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-6">
                  {service.icon}
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3 text-xs">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{service.pricing}</span>
                  <Button 
                    className={index === 0 ? "bg-green-600 hover:bg-green-700" : ""}
                    variant={index === 0 ? "default" : "outline"}
                  >
                    {index === 0 ? "Get Started" : "Contact Sales"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Services</h2>
            <p className="text-lg text-gray-600">Extend our platform with specialized offerings</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="flex justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Implementation Process</h2>
            <p className="text-lg text-gray-600">Simple steps to get started with RecycloAI</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Consultation</h3>
              <p className="text-gray-600 text-sm">Discuss your needs and requirements with our team</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Customization</h3>
              <p className="text-gray-600 text-sm">Tailor the solution to your specific use case</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Integration</h3>
              <p className="text-gray-600 text-sm">Seamless integration with your existing systems</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Launch</h3>
              <p className="text-gray-600 text-sm">Go live with ongoing support and training</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Waste Management?</h2>
          <p className="text-xl mb-8 text-green-100">
            Contact our team to discuss how RecycloAI can help your organization
          </p>
          <div className="space-x-4">
            <Button size="lg" variant="secondary">
              Schedule Consultation
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-green-600">
              Request Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
