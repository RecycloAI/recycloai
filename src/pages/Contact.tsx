
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-green-600" />,
      title: "Email",
      details: "support@recycloai.com",
      description: "Send us an email anytime"
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: "Phone",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri from 8am to 6pm PST"
    },
    {
      icon: <MapPin className="h-6 w-6 text-purple-600" />,
      title: "Office",
      details: "San Francisco, CA",
      description: "123 Green Street, Suite 456"
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: "Response Time",
      details: "Within 24 hours",
      description: "We aim to respond quickly"
    }
  ];

  const faqItems = [
    {
      question: "How accurate is the AI waste detection?",
      answer: "Our AI model achieves 97% accuracy in identifying common waste materials and continuously improves with more data."
    },
    {
      question: "Is RecycloAI free to use?",
      answer: "Yes! Individual users can access all core features for free. We also offer premium plans for businesses and organizations."
    },
    {
      question: "What types of waste can the AI identify?",
      answer: "Our AI can identify 50+ categories including plastic, paper, glass, metal, organic waste, and e-waste with high confidence."
    },
    {
      question: "Can I use this for my business?",
      answer: "Absolutely! We offer business solutions including waste auditing, employee training, and compliance monitoring."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about RecycloAI? Need support? Want to explore business partnerships? 
            We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-center mb-4">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-gray-900 font-medium mb-1">{info.details}</p>
                <p className="text-gray-600 text-sm">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center mb-6">
                <MessageSquare className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full mt-1 block border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="business">Business Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="media">Media Inquiry</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    className="w-full mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Office Info / Map Placeholder */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Our Office</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-900 font-medium">RecycloAI Headquarters</p>
                      <p className="text-gray-600">123 Green Street, Suite 456</p>
                      <p className="text-gray-600">San Francisco, CA 94102</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-900 font-medium">Office Hours</p>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM PST</p>
                      <p className="text-gray-600">Saturday - Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive map would be here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </div>
          
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Button variant="outline">
              View All FAQs
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
