/**
 * Landing Page — Premium Redesign
 * Glassmorphic cards, gradient accents, staggered animations
 */

import { Link } from "react-router-dom";
import { BookOpen, Zap, Video, Brain, ArrowRight, Github, Sparkles } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[40%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6 animate-fadeIn">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Text2Learn</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/DineshDumka/Text2Learn"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{ color: 'var(--text-muted)' }}
              title="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">
              Login
            </Link>
            <Link to="/signup" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 pb-24 text-center">
        <div className="animate-fadeInUp">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-medium animate-pulseGlow"
            style={{
              background: 'var(--gradient-subtle)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: 'var(--primary)',
            }}>
            <Sparkles className="w-3.5 h-3.5" />
            Built for Fast Learning
          </div>
        </div>

        <h1 className="animate-fadeInUp delay-100 text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          style={{
            background: 'linear-gradient(135deg, #f0f6fc 0%, #b1bac4 50%, #f0f6fc 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.04em',
          }}>
          Learn Anything,{' '}
          <span style={{
            background: 'var(--gradient-primary)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Instantly.
          </span>
        </h1>

        <p className="animate-fadeInUp delay-200 text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Type a topic. Get a full AI-generated course with videos, quizzes, and structured lessons.
        </p>

        <div className="animate-fadeInUp delay-300 flex gap-4 justify-center">
          <Link
            to="/signup"
            className="btn-primary px-7 py-3.5 text-base inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary px-7 py-3.5 text-base">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Why Text2Learn?
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Everything you need to master any topic, powered by AI
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Instant Generation"
            description="Create complete courses in seconds with AI-powered content generation"
            delay="delay-100"
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Structured Learning"
            description="Organized modules and lessons that build on each other logically"
            delay="delay-200"
          />
          <FeatureCard
            icon={<Video className="w-6 h-6" />}
            title="Video Integration"
            description="Curated YouTube videos for every lesson to enhance understanding"
            delay="delay-300"
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="Interactive Quizzes"
            description="Test your knowledge with auto-generated MCQs and instant feedback"
            delay="delay-400"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            How It Works
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Three simple steps to start learning
          </p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px]"
            style={{ background: 'var(--gradient-primary)', opacity: 0.3 }} />

          <div className="grid md:grid-cols-3 gap-12">
            <Step
              number={1}
              title="Enter a Topic"
              description="Type any subject — from 'React Hooks' to 'Machine Learning Basics'"
              delay="delay-100"
            />
            <Step
              number={2}
              title="AI Generates Course"
              description="Our AI creates modules, lessons, videos, and quizzes in seconds"
              delay="delay-300"
            />
            <Step
              number={3}
              title="Start Learning"
              description="Follow the curriculum, watch videos, complete quizzes, and master it"
              delay="delay-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto gradient-border rounded-2xl p-10"
          style={{ background: 'rgba(15, 25, 35, 0.6)', backdropFilter: 'blur(12px)' }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to Learn <span className="gradient-text">Anything</span>?
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--text-muted)' }}>
            Join learners mastering new skills with AI-powered courses
          </p>
          <Link to="/signup" className="btn-primary px-8 py-3.5 text-base inline-block">
            Create Your First Course Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Made by Karan Nayal • Text2Learn © 2025
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) => (
  <div className={`animate-fadeInUp ${delay} group relative rounded-xl p-6 text-center transition-all duration-300 cursor-default`}
    style={{
      background: 'rgba(15, 25, 35, 0.5)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,130,246,0.1), 0 0 0 1px rgba(59,130,246,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
    <div className="flex justify-center mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ background: 'var(--gradient-subtle)', color: 'var(--primary)' }}>
        {icon}
      </div>
    </div>
    <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
  </div>
);

const Step = ({
  number,
  title,
  description,
  delay,
}: {
  number: number;
  title: string;
  description: string;
  delay: string;
}) => (
  <div className={`animate-fadeInUp ${delay} text-center relative`}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white"
      style={{ background: 'var(--gradient-primary)', boxShadow: '0 4px 16px var(--glow-primary)' }}>
      {number}
    </div>
    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
  </div>
);

export default Landing;
