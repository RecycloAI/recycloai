
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of AI in Waste Management",
      excerpt: "Explore how artificial intelligence is revolutionizing waste sorting and recycling processes across the globe.",
      author: "Sarah Chen",
      date: "March 15, 2024",
      category: "AI Technology",
      image: "/placeholder.svg",
      tags: ["AI", "Sustainability", "Technology"]
    },
    {
      id: 2,
      title: "5 Common Recycling Mistakes You're Probably Making",
      excerpt: "Avoid these frequent recycling errors to maximize your environmental impact and improve waste sorting accuracy.",
      author: "Mike Johnson",
      date: "March 10, 2024",
      category: "Recycling Tips",
      image: "/placeholder.svg",
      tags: ["Recycling", "Tips", "Environment"]
    },
    {
      id: 3,
      title: "Building a Circular Economy: What It Means for Consumers",
      excerpt: "Understanding the circular economy model and how individual actions contribute to sustainable waste management.",
      author: "Dr. Maria Santos",
      date: "March 5, 2024",
      category: "Circular Economy",
      image: "/placeholder.svg",
      tags: ["Circular Economy", "Sustainability", "Consumer"]
    },
    {
      id: 4,
      title: "Smart Cities and Intelligent Waste Management",
      excerpt: "How modern cities are implementing AI-powered waste management systems to improve efficiency and sustainability.",
      author: "Alex Rodriguez",
      date: "February 28, 2024",
      category: "Smart Cities",
      image: "/placeholder.svg",
      tags: ["Smart Cities", "IoT", "Urban Planning"]
    },
    {
      id: 5,
      title: "The Environmental Impact of Proper Recycling",
      excerpt: "Quantifying the real environmental benefits of accurate waste sorting and recycling practices.",
      author: "James Wilson",
      date: "February 22, 2024",
      category: "Environmental Impact",
      image: "/placeholder.svg",
      tags: ["Environment", "Impact", "Statistics"]
    },
    {
      id: 6,
      title: "Plastic Identification Guide: Know Your Numbers",
      excerpt: "A comprehensive guide to plastic recycling codes and what they mean for proper disposal.",
      author: "Sarah Chen",
      date: "February 15, 2024",
      category: "Educational",
      image: "/placeholder.svg",
      tags: ["Plastic", "Education", "Recycling"]
    }
  ];

  const categories = [
    "All Posts",
    "AI Technology", 
    "Recycling Tips",
    "Circular Economy",
    "Smart Cities",
    "Environmental Impact",
    "Educational"
  ];

  const featuredPost = blogPosts[0];
  const regularPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            RecycloAI Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest insights on AI, sustainability, and waste management. 
            Learn how to make a bigger environmental impact.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Article</h2>
            <p className="text-gray-600">Don't miss our latest insights</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover bg-gray-200"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {featuredPost.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {featuredPost.date}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{featuredPost.title}</h3>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 text-sm">{featuredPost.author}</span>
                  </div>
                  <Button>
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories Filter */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Articles</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    index === 0 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover bg-gray-200"
                />
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {post.date}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600 text-xs">{post.author}</span>
                    </div>
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      Read More
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {post.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 text-green-100">
            Get the latest articles and insights delivered to your inbox
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
            />
            <Button variant="secondary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
