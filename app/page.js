'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAztBlp9IeklrLz1j0zT_O6uH713CeXHlg",
  authDomain: "utsp1-98f4a.firebaseapp.com",
  projectId: "utsp1-98f4a",
  storageBucket: "utsp1-98f4a.firebasestorage.app",
  messagingSenderId: "213115953338",
  appId: "1:213115953338:web:9a908d256f86897affe283"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [chatInput, setChatInput] = useState('')
  const [chatResponse, setChatResponse] = useState('')

  useEffect(() => {
    // Check for saved theme preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode')
      if (savedMode) {
        setDarkMode(savedMode === 'true')
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true)
      }
    }

    // Load comments from Firestore
    const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'))
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const loadedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setComments(loadedComments)
    })

    // Load ratings from Firestore and calculate average
    const ratingsQuery = query(collection(db, 'ratings'))
    const unsubscribeRatings = onSnapshot(ratingsQuery, (snapshot) => {
      const ratings = snapshot.docs.map(doc => doc.data().value)
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, curr) => acc + curr, 0)
        const avg = sum / ratings.length
        setAverageRating(avg.toFixed(1))
        setTotalRatings(ratings.length)
      } else {
        setAverageRating(0)
        setTotalRatings(0)
      }
    })

    // Cleanup function
    return () => {
      unsubscribeComments()
      unsubscribeRatings()
    }
  }, [])

  useEffect(() => {
    // Apply theme class to document
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Save preference
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const portfolioItems = [
    {
      id: 1,
      title: 'E-commerce Website',
      year: '2023',
      description: 'Built a full-stack e-commerce platform with React, Node.js, and MongoDB',
      details: 'Developed a complete e-commerce solution with product listings, cart functionality, user authentication, and payment processing. Implemented responsive design and optimized for performance.',
      tags: ['React', 'Node.js', 'MongoDB']
    },
    {
      id: 2,
      title: 'Mobile App Development',
      year: '2022',
      description: 'Created a cross-platform mobile application for task management',
      details: 'Designed and developed a React Native application with offline capabilities and cloud synchronization. Implemented push notifications and biometric authentication.',
      tags: ['React Native', 'Firebase', 'Redux']
    },
    {
      id: 3,
      title: 'Data Visualization Dashboard',
      year: '2021',
      description: 'Built an interactive dashboard for real-time data analytics',
      details: 'Created a dynamic dashboard with D3.js that visualizes complex datasets with interactive charts and filters. Integrated with REST APIs for live data updates.',
      tags: ['D3.js', 'React', 'REST API']
    }
  ]

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (newComment.trim() && name.trim()) {
      try {
        await addDoc(collection(db, 'comments'), {
          name: name.trim(),
          text: newComment.trim(),
          timestamp: serverTimestamp()
        })
        setNewComment('')
        setName('')
      } catch (error) {
        console.error('Error adding comment:', error)
      }
    }
  }

  const handleRatingSubmit = async (e) => {
    e.preventDefault()
    if (rating > 0) {
      try {
        await addDoc(collection(db, 'ratings'), {
          value: rating,
          timestamp: serverTimestamp()
        })
        setRating(0)
        setHoverRating(0)
      } catch (error) {
        console.error('Error adding rating:', error)
      }
    }
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput }),
      })
      const data = await response.json()
      setChatResponse(data.response)
      setChatInput('')
    } catch (error) {
      console.error('Error with AI:', error)
      setChatResponse('Sorry, something went wrong with the AI. Try again!')
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`fixed w-full z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold">My CV</div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <button onClick={() => scrollToSection('home')} className="hover:text-blue-500 transition">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-blue-500 transition">About</button>
            <button onClick={() => scrollToSection('portfolio')} className="hover:text-blue-500 transition">Portfolio</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-blue-500 transition">Contact</button>
            <button onClick={() => scrollToSection('feedback')} className="hover:text-blue-500 transition">Feedback</button>
            <button onClick={() => scrollToSection('chatbot')} className="hover:text-blue-500 transition">Chatbot</button>
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden focus:outline-none" onClick={toggleMobileMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} py-2 px-4`}>
            <button onClick={() => scrollToSection('home')} className="block py-2 hover:text-blue-500 transition">Home</button>
            <button onClick={() => scrollToSection('about')} className="block py-2 hover:text-blue-500 transition">About</button>
            <button onClick={() => scrollToSection('portfolio')} className="block py-2 hover:text-blue-500 transition">Portfolio</button>
            <button onClick={() => scrollToSection('contact')} className="block py-2 hover:text-blue-500 transition">Contact</button>
            <button onClick={() => scrollToSection('feedback')} className="block py-2 hover:text-blue-500 transition">Feedback</button>
            <button onClick={() => scrollToSection('chatbot')} className="block py-2 hover:text-blue-500 transition">Chatbot</button>
          </div>
        )}
      </nav>

      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className={`fixed bottom-4 left-4 z-20 p-3 rounded-full shadow-lg ${darkMode ? 'bg-yellow-300 text-gray-900' : 'bg-gray-800 text-white'}`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-10">
        {/* Home Section */}
        <section id="home" className="min-h-screen flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-blue-500 mb-4">
              <img 
                src="/profile2.jpg" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold mb-2">Muhammad Hasby Al Ghifari</h1>
            <h2 className="text-2xl text-blue-500">Frontend Developer</h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm">
                Rating {averageRating} (from {totalRatings} voters)
              </span>
            </div>
            
            <p className="text-lg mb-6">
              Passionate frontend developer with 5+ years of experience building responsive and user-friendly web applications.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => scrollToSection('portfolio')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                View Portfolio
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition"
              >
                Contact Me
              </button>
            </div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <h2 className="text-3xl font-bold mb-10 text-center">About Me</h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <h3 className="text-2xl font-semibold mb-4">Biodata</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Full Name:</p>
                  <p>Muhammad Hasby Al Ghifari</p>
                </div>
                <div>
                  <p className="font-medium">Date of Birth:</p>
                  <p>January 15, 1990</p>
                </div>
                <div>
                  <p className="font-medium">Email:</p>
                  <p>muhammadhasby@gmail.com</p>
                </div>
                <div>
                  <p className="font-medium">Phone:</p>
                  <p>082121211</p>
                </div>
                <div>
                  <p className="font-medium">Location:</p>
                  <p>Bandung, Jawa Barat</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h3 className="text-2xl font-semibold mb-4">Skills</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>JavaScript</span>
                    <span>95%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>React</span>
                    <span>90%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Next.js</span>
                    <span>85%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>CSS/Tailwind</span>
                    <span>88%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Node.js</span>
                    <span>80%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="py-20">
          <h2 className="text-3xl font-bold mb-10 text-center">My Portfolio</h2>
          
          <AnimatePresence>
            {selectedPortfolio ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
              >
                <button 
                  onClick={() => setSelectedPortfolio(null)}
                  className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Portfolio
                </button>
                
                <h3 className="text-2xl font-bold mb-2">{selectedPortfolio.title}</h3>
                <p className="text-blue-500 mb-4">{selectedPortfolio.year}</p>
                <p className="mb-6">{selectedPortfolio.details}</p>
                
                <div className="flex flex-wrap gap-2">
                  {selectedPortfolio.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="relative"
              >
                {/* Timeline line */}
                <div className={`absolute left-4 md:left-1/2 h-full w-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} -z-10`}></div>
                
                <div className="space-y-8">
                  {portfolioItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      className={`relative flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-0 md:left-1/2 w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-white'} border-4 border-blue-500 -ml-4 md:-ml-4`}>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      
                      {/* Content */}
                      <div 
                        onClick={() => setSelectedPortfolio(item)}
                        className={`ml-12 md:ml-0 md:w-5/12 p-6 rounded-lg cursor-pointer transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} ${index % 2 === 0 ? 'md:mr-auto md:mr-6' : 'md:ml-auto md:ml-6'}`}
                      >
                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                        <p className="text-blue-500 mb-2">{item.year}</p>
                        <p>{item.description}</p>
                        <button className="mt-3 text-blue-500 hover:text-blue-700 flex items-center">
                          View Details
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <h2 className="text-3xl font-bold mb-10 text-center">Contact Me</h2>
          
          <div className="max-w-2xl mx-auto">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="name" className="block mb-2 font-medium">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 font-medium">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2 font-medium">Message</label>
                <textarea 
                  id="message" 
                  rows="5"
                  className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Your message here..."
                ></textarea>
              </div>
              <button 
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition w-full md:w-auto"
              >
                Send Message
              </button>
            </motion.form>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-10 flex justify-center space-x-6"
            >
              <a href="#" className="hover:text-blue-500 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-blue-500 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-blue-500 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Feedback Section */}
        <section id="feedback" className="py-20">
          <h2 className="text-3xl font-bold mb-10 text-center">Feedback</h2>
          
          <div className="max-w-3xl mx-auto">
            {/* Rating Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`mb-12 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
            >
              <h3 className="text-2xl font-semibold mb-4">Rate My Portfolio</h3>
              
              <div className="flex items-center mb-6">
                <div className="text-3xl font-bold mr-4">{averageRating}</div>
                <div className="flex items-center mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-8 h-8 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm">
                  (from {totalRatings} {totalRatings === 1 ? 'voter' : 'voters'})
                </span>
              </div>
              
              <form onSubmit={handleRatingSubmit}>
                <div className="flex items-center mb-4">
                  <p className="mr-4">Your rating:</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <svg
                          className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={rating === 0}
                  className={`px-4 py-2 rounded-lg ${rating === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}
                >
                  Submit Rating
                </button>
              </form>
            </motion.div>
            
            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
            >
              <h3 className="text-2xl font-semibold mb-4">Leave a Comment</h3>
              
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="mb-4">
                  <label htmlFor="comment-name" className="block mb-2 font-medium">Name</label>
                  <input
                    type="text"
                    id="comment-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="comment-text" className="block mb-2 font-medium">Comment</label>
                  <textarea
                    id="comment-text"
                    rows="4"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Your comment here..."
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Post Comment
                </button>
              </form>
              
              <div className="space-y-6">
                <h4 className="text-xl font-semibold">Comments ({comments.length})</h4>
                
                {comments.length === 0 ? (
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="space-y-4">
                    {comments
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((comment) => (
                        <div 
                          key={comment.id}
                          className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold">{comment.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(comment.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <p>{comment.text}</p>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Chatbot Section */}
        <section id="chatbot" className="py-20">
          <h2 className="text-3xl font-bold mb-10 text-center">Chat with AI</h2>
          
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
            >
              <h3 className="text-2xl font-semibold mb-4">Ask Me Anything</h3>
              
              <form onSubmit={handleChatSubmit} className="mb-6">
                <div className="mb-4">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Type your question here (e.g., 'Tell me about web development')"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Send
                </button>
              </form>
              
              {chatResponse && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <h4 className="font-semibold mb-2">AI Response:</h4>
                  <p>{chatResponse}</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`py-6 text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <p>© {new Date().getFullYear()} Muhammad Hasby. All rights reserved.</p>
      </footer>
    </div>
  )
}



