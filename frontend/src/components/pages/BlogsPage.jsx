import React, { useState } from 'react';

function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedArticleId, setExpandedArticleId] = useState(null);

  const blogCategories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'aqi', name: 'Understanding AQI', icon: '📊' },
    { id: 'health', name: 'Health Impact', icon: '🏥' },
    { id: 'solutions', name: 'Solutions', icon: '🌱' },
    { id: 'technology', name: 'Technology', icon: '🔬' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "Understanding Air Quality Index (AQI): A Complete Guide",
      category: 'aqi',
      author: "Dr. Sarah Chen",
      date: "2024-01-15",
      readTime: "8 min read",
      excerpt: "Learn everything about AQI, how it's calculated, and what different levels mean for your health and daily activities.",
      content: "The Air Quality Index (AQI) is a standardized system used worldwide to communicate air pollution levels to the public. It ranges from 0 to 500, with higher values indicating more dangerous air pollution. The AQI is calculated based on five major pollutants: ground-level ozone, particle pollution (PM2.5 and PM10), carbon monoxide, sulfur dioxide, and nitrogen dioxide. Each pollutant has its own sub-index, and the overall AQI is determined by the highest sub-index value. Understanding AQI helps you make informed decisions about outdoor activities and health protection measures.",
      image: "🌫️",
      tags: ["AQI", "Air Pollution", "Health", "Environment"]
    },
    {
      id: 2,
      title: "How Air Pollution Affects Your Health: The Hidden Dangers",
      category: 'health',
      author: "Dr. Michael Rodriguez",
      date: "2024-01-10",
      readTime: "12 min read",
      excerpt: "Discover the serious health impacts of air pollution, from respiratory issues to cardiovascular problems and long-term effects.",
      content: "Air pollution poses significant risks to human health, affecting nearly every organ system. Short-term exposure can cause irritation of the eyes, nose, and throat, while long-term exposure leads to chronic respiratory diseases, heart disease, and even cancer. Children, elderly, and those with pre-existing conditions are particularly vulnerable. PM2.5 particles can penetrate deep into the lungs and enter the bloodstream, causing systemic inflammation. Understanding these health impacts is crucial for taking appropriate protective measures.",
      image: "🏥",
      tags: ["Health", "PM2.5", "Respiratory", "Cardiovascular"]
    },
    {
      id: 3,
      title: "10 Simple Ways to Reduce Air Pollution in Your Daily Life",
      category: 'solutions',
      author: "Environmental Team",
      date: "2024-01-08",
      readTime: "6 min read",
      excerpt: "Practical tips and lifestyle changes you can make today to help reduce air pollution and improve air quality in your community.",
      content: "Reducing air pollution starts with individual actions. Use public transportation, carpool, or bike instead of driving alone. Choose energy-efficient appliances and LED light bulbs. Plant trees and maintain green spaces around your home. Avoid burning waste and use eco-friendly cleaning products. Support renewable energy sources and advocate for clean air policies in your community. Small changes in daily habits can collectively make a significant impact on air quality.",
      image: "🌱",
      tags: ["Solutions", "Lifestyle", "Environment", "Tips"]
    },
    {
      id: 4,
      title: "The Science Behind Air Quality Monitoring Technology",
      category: 'technology',
      author: "Dr. Lisa Wang",
      date: "2024-01-05",
      readTime: "10 min read",
      excerpt: "Explore the advanced technology and sensors used in modern air quality monitoring systems and how they work.",
      content: "Modern air quality monitoring relies on sophisticated sensor technology and data analysis. Low-cost sensors use electrochemical, optical, and metal oxide semiconductor technologies to detect pollutants. Machine learning algorithms process vast amounts of data to provide accurate real-time readings. Satellite monitoring offers global coverage, while ground-based stations provide detailed local measurements. The integration of IoT devices and cloud computing enables comprehensive air quality networks that help protect public health.",
      image: "🔬",
      tags: ["Technology", "Sensors", "Monitoring", "IoT"]
    },
    {
      id: 5,
      title: "Indoor Air Quality: Creating a Healthy Home Environment",
      category: 'health',
      author: "Dr. James Thompson",
      date: "2024-01-03",
      readTime: "9 min read",
      excerpt: "Learn how to improve indoor air quality in your home with proper ventilation, air purifiers, and houseplants.",
      content: "Indoor air quality is often worse than outdoor air quality, with pollutants from cleaning products, cooking, and building materials. Proper ventilation is essential - open windows regularly and use exhaust fans. Air purifiers with HEPA filters can remove particles, while activated carbon filters remove gases. Houseplants like spider plants and peace lilies can help purify air naturally. Regular cleaning and avoiding synthetic fragrances also contribute to better indoor air quality.",
      image: "🏠",
      tags: ["Indoor Air", "Home", "Ventilation", "Purification"]
    },
    {
      id: 6,
      title: "Climate Change and Air Pollution: The Vicious Cycle",
      category: 'aqi',
      author: "Dr. Maria Santos",
      date: "2024-01-01",
      readTime: "11 min read",
      excerpt: "Understanding the complex relationship between climate change and air pollution, and how they amplify each other's effects.",
      content: "Climate change and air pollution are deeply interconnected. Rising temperatures increase ground-level ozone formation and wildfire frequency, worsening air quality. Air pollutants like black carbon contribute to global warming. This creates a feedback loop where climate change worsens air pollution, which in turn accelerates climate change. Addressing both issues together through clean energy, sustainable transportation, and emission reductions is crucial for protecting both human health and the planet.",
      image: "🌍",
      tags: ["Climate Change", "Global Warming", "Emission", "Sustainability"]
    },
    {
      id: 7,
      title: "Best Air-Purifying Plants for Your Home and Office",
      category: 'solutions',
      author: "Botanical Expert Team",
      date: "2023-12-28",
      readTime: "7 min read",
      excerpt: "Discover the most effective plants for naturally purifying indoor air and creating a healthier living environment.",
      content: "Certain plants are particularly effective at removing indoor air pollutants. Snake plants excel at removing formaldehyde and work well in low light. Peace lilies remove ammonia, benzene, and formaldehyde while adding beauty to your space. Spider plants are easy to care for and remove carbon monoxide and xylene. Aloe vera not only purifies air but also has healing properties. English ivy is excellent for removing mold spores. Place these plants strategically throughout your home for maximum air purification benefits.",
      image: "🌿",
      tags: ["Plants", "Indoor", "Purification", "Natural"]
    },
    {
      id: 8,
      title: "The Future of Air Quality: Smart Cities and IoT Solutions",
      category: 'technology',
      author: "Urban Planning Team",
      date: "2023-12-25",
      readTime: "9 min read",
      excerpt: "Explore how smart city technologies and IoT devices are revolutionizing air quality monitoring and management.",
      content: "Smart cities are implementing comprehensive air quality monitoring networks using IoT sensors, AI, and real-time data analysis. These systems provide hyperlocal air quality data, enabling targeted interventions and policy decisions. Mobile monitoring units and citizen science initiatives complement fixed monitoring stations. Predictive models help forecast air quality and issue early warnings. Integration with traffic management and urban planning systems allows for proactive air quality improvement strategies.",
      image: "🏙️",
      tags: ["Smart Cities", "IoT", "Urban Planning", "Innovation"]
    }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const getCategoryColor = (category) => {
    const colors = {
      'aqi': '#3b82f6',
      'health': '#ef4444',
      'solutions': '#10b981',
      'technology': '#8b5cf6'
    };
    return colors[category] || '#64748b';
  };

  return (
    <div className="page-container">
      <div className="blogs-header">
        <h1 className="blogs-title">Air Quality Education Hub</h1>
        <p className="blogs-subtitle">
          Learn about air quality, pollution reduction, and environmental health through our comprehensive educational content.
        </p>
      </div>

      {/* Category Filter */}
      <div className="blogs-categories">
        {blogCategories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="blogs-grid">
        {filteredPosts.map(post => (
          <article key={post.id} className="blog-card">
            <div className="blog-header">
              <div className="blog-category" style={{ backgroundColor: getCategoryColor(post.category) }}>
                {blogCategories.find(cat => cat.id === post.category)?.name}
              </div>
              <div className="blog-meta">
                <span className="blog-date">{post.date}</span>
                <span className="blog-read-time">{post.readTime}</span>
              </div>
            </div>

            <div className="blog-image">
              <span className="blog-emoji">{post.image}</span>
            </div>

            <div className="blog-content">
              <h2 className="blog-title">{post.title}</h2>
              {expandedArticleId === post.id ? (
                <p className="blog-full-content">{post.content}</p>
              ) : (
                <p className="blog-excerpt">{post.excerpt}</p>
              )}
              <div className="blog-author">
                <span className="author-name">By {post.author}</span>
              </div>
              <div className="blog-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="blog-tag">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="blog-actions">
              {expandedArticleId === post.id ? (
                <button className="read-more-btn" onClick={() => setExpandedArticleId(null)}>Show Less</button>
              ) : (
                <button className="read-more-btn" onClick={() => setExpandedArticleId(post.id)}>Read Full Article</button>
              )}
              <button className="bookmark-btn">🔖</button>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter Signup */}
      <div className="newsletter-section">
        <div className="newsletter-card">
          <h3>Stay Updated on Air Quality</h3>
          <p>Get the latest articles and air quality insights delivered to your inbox.</p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="newsletter-input"
            />
            <button className="newsletter-btn">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogsPage;
