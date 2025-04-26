
import React from "react";
import { Link } from "react-router-dom";
import { CodeIcon, BookOpen, MessageCircle, Users, Layout, ArrowRight } from "lucide-react";

const Index = () => {
  const features = [
    {
      name: "AI-Powered Chat",
      description: "Ask coding questions and get answers in Darija, Arabic, French, or English.",
      icon: MessageCircle,
      color: "from-blue-400 to-blue-600",
      link: "/chat"
    },
    {
      name: "Learning Center",
      description: "Access AI-generated explanations for coding concepts customized to Moroccan context.",
      icon: BookOpen,
      color: "from-green-400 to-green-600",
      link: "/learning"
    },
    {
      name: "Personalized Paths",
      description: "Follow a tailored learning journey created specifically for your goals.",
      icon: Layout,
      color: "from-purple-400 to-purple-600",
      link: "/path"
    },
    {
      name: "Project Ideas",
      description: "Get project suggestions from the AI to practice your skills.",
      icon: CodeIcon,
      color: "from-orange-400 to-orange-600",
      link: "/projects"
    },
    {
      name: "Community",
      description: "Connect with fellow Moroccan coders and share your learning journey.",
      icon: Users,
      color: "from-red-400 to-red-600",
      link: "/community"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-pattern py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              <span className="block">Learn Coding in</span>
              <span className="animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-morocco-blue via-morocco-terracotta to-morocco-mint">
                Darija & Multiple Languages
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
              An AI-powered platform helping Moroccan developers learn programming with culturally relevant content in Darija, Arabic, French, and English.
            </p>
            <div className="mt-10 sm:flex sm:justify-center">
              <div className="rounded-md shadow">
                <Link to="/chat" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-morocco-blue hover:bg-morocco-blue/90 md:py-4 md:text-lg md:px-10">
                  Get Started
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link to="/learning" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-morocco-blue bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 dark:bg-gray-800 dark:text-morocco-mint dark:hover:bg-gray-700">
                  Explore Lessons
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-morocco-blue/10 via-morocco-mint/10 to-morocco-terracotta/10"></div>
      </section>

      {/* Language Badge Section */}
      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">دارجة</span>
            </div>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">العربية</span>
            </div>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Français</span>
            </div>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">English</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 moroccan-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Features of DarijaCode Hub
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              Everything you need to learn coding with a Moroccan touch.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div 
                key={feature.name}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-md bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{feature.name}</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{feature.description}</p>
                  <Link 
                    to={feature.link}
                    className="mt-4 inline-flex items-center text-morocco-blue dark:text-morocco-mint hover:underline"
                  >
                    Explore <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-morocco-blue dark:bg-morocco-blue/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <blockquote className="text-center">
            <p className="text-xl md:text-2xl font-medium text-white">
              "Programming in your native language makes learning to code more accessible and enjoyable. DarijaCode Hub bridges this gap for Moroccan developers."
            </p>
            <footer className="mt-4">
              <div className="md:flex md:items-center md:justify-center">
                <div className="mt-3">
                  <div className="text-base font-medium text-white">- DarijaCode Hub Team</div>
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-morocco-mint/10 dark:bg-morocco-mint/20 px-6 py-10 sm:px-12 sm:py-16 md:flex md:items-center md:justify-between md:px-12 lg:px-16">
            <div className="md:w-0 md:flex-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Ready to start your coding journey?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
                Join DarijaCode Hub today and learn to code in a language that feels like home.
              </p>
            </div>
            <div className="mt-8 md:mt-0 md:ml-8">
              <div className="rounded-md shadow">
                <Link
                  to="/chat"
                  className="flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white bg-morocco-blue hover:bg-morocco-blue/90"
                >
                  Start Chatting with AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
