'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, ImageIcon, Volume2, Search, Eye, Video, Mic, Sparkles,
  Send, Loader2, Play, Square, RotateCcw, ArrowDown, ArrowRight, ExternalLink,
  MessageSquare, Zap, Shield, Globe, ChevronRight, Star,
  Menu, X, Moon, Sun, ArrowUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SearchResult {
  position: number;
  title: string;
  url: string;
  description: string;
  domain: string;
  date: string;
}

// ────────────────────────────────────────────────
// Service definitions
// ────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'llm',
    title: 'LLM Chat',
    description: 'Conversational AI that understands context, answers questions, and generates creative content.',
    icon: Bot,
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    tag: 'Interactive',
  },
  {
    id: 'image',
    title: 'Image Generation',
    description: 'Create stunning images from text descriptions using state-of-the-art AI models.',
    icon: ImageIcon,
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-500/30',
    tag: 'Interactive',
  },
  {
    id: 'tts',
    title: 'Text to Speech',
    description: 'Convert any text into natural-sounding speech with multiple voice options.',
    icon: Volume2,
    color: 'from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-500/30',
    tag: 'Interactive',
  },
  {
    id: 'search',
    title: 'Web Search',
    description: 'Search the web in real-time and get structured, relevant results instantly.',
    icon: Search,
    color: 'from-cyan-500/20 to-sky-500/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-500/30',
    tag: 'Interactive',
  },
  {
    id: 'asr',
    title: 'Speech Recognition',
    description: 'Transcribe audio recordings into accurate text with support for multiple languages.',
    icon: Mic,
    color: 'from-rose-500/20 to-red-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500/30',
    tag: 'Coming Soon',
  },
  {
    id: 'vlm',
    title: 'Vision Language Model',
    description: 'Understand and analyze images — describe content, extract text, and answer visual questions.',
    icon: Eye,
    color: 'from-violet-500/20 to-indigo-500/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-500/30',
    tag: 'Coming Soon',
  },
  {
    id: 'video',
    title: 'Video Understanding',
    description: 'Analyze video content frame by frame — understand scenes, actions, and temporal sequences.',
    icon: Video,
    color: 'from-teal-500/20 to-cyan-500/20',
    iconColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-500/30',
    tag: 'Coming Soon',
  },
];

const FEATURES = [
  { icon: Zap, title: 'Lightning Fast', description: 'Sub-second response times for all AI services' },
  { icon: Shield, title: 'Secure by Design', description: 'All processing happens through secure, authenticated APIs' },
  { icon: Globe, title: 'Multi-Modal', description: 'Text, images, audio, and video — all in one platform' },
  { icon: Sparkles, title: 'State of the Art', description: 'Powered by the latest advances in AI research' },
];

const STATS = [
  { value: '7+', label: 'AI Services' },
  { value: '∞', label: 'Possibilities' },
  { value: '<1s', label: 'Response Time' },
  { value: '24/7', label: 'Availability' },
];

// ────────────────────────────────────────────────
// Animation variants
// ────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// ────────────────────────────────────────────────
// Theme Toggle Component
// ────────────────────────────────────────────────
function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

// ────────────────────────────────────────────────
// Header Component
// ────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Portal</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Services', id: 'services' },
              { label: 'Try It Live', id: 'demo' },
              { label: 'About', id: 'features' },
            ].map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => scrollTo(item.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <nav className="flex flex-col p-4 gap-2">
              {[
                { label: 'Services', id: 'services' },
                { label: 'Try It Live', id: 'demo' },
                { label: 'About', id: 'features' },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => scrollTo(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ────────────────────────────────────────────────
// Hero Section
// ────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Powered by Next-Gen AI
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
            >
              Your Gateway to{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Intelligent
              </span>{' '}
              Capabilities
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0"
            >
              Explore and interact with cutting-edge AI services — from conversational AI and image generation to speech synthesis and web intelligence. All in one unified portal.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Try It Live <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Services
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid grid-cols-4 gap-4 max-w-md mx-auto lg:mx-0"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-border/50">
              <Image
                src="/hero-portal.png"
                alt="AI Neural Network Visualization"
                width={1344}
                height={768}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-3 shadow-lg hidden sm:block"
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">AI Ready</span>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-3 shadow-lg hidden sm:block"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Real-time</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// Services Section
// ────────────────────────────────────────────────
function ServicesSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4">
              <Star className="h-3 w-3 mr-1" /> AI Services
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Explore AI Capabilities
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Discover a suite of powerful AI tools designed to transform the way you work, create, and communicate.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {SERVICES.map((service) => {
            const Icon = service.icon;
            const isHovered = hoveredId === service.id;
            const isComingSoon = service.tag === 'Coming Soon';

            return (
              <motion.div
                key={service.id}
                variants={fadeInUp}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Card
                  className={`relative overflow-hidden transition-all duration-300 h-full cursor-pointer ${
                    isComingSoon ? 'opacity-70' : ''
                  } ${isHovered ? `shadow-lg ${service.borderColor}` : 'hover:shadow-md'}`}
                  onClick={() => {
                    if (!isComingSoon) {
                      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : ''
                  }`} />
                  <CardHeader className="relative pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl bg-muted ${service.iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant={isComingSoon ? 'secondary' : 'default'} className={isComingSoon ? '' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}>
                        {service.tag}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-sm leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// Chat Demo Component
// ────────────────────────────────────────────────
function ChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, sessionId: 'portal-demo' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        toast.error(data.error || 'Failed to get response');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const clearChat = async () => {
    setMessages([]);
    await fetch('/api/ai/chat?sessionId=portal-demo', { method: 'DELETE' });
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-xl bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-emerald-500" />
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 text-xs">
          <RotateCcw className="h-3 w-3 mr-1" /> Clear
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Start a conversation with AI</p>
            <p className="text-xs mt-1 opacity-60">Ask anything — questions, ideas, code, stories...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} className="shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Image Generation Demo
// ────────────────────────────────────────────────
function ImageDemo() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setGeneratedImage(null);
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), size }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedImage(data.image);
      } else {
        toast.error(data.error || 'Failed to generate image');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'A serene Japanese garden at sunset with cherry blossoms',
    'Futuristic cyberpunk city street, neon lights, rain',
    'Oil painting of a cat wearing a top hat, vintage style',
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="flex-1 min-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              generate();
            }
          }}
        />
        <div className="flex sm:flex-col gap-2">
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1024x1024">Square (1:1)</SelectItem>
              <SelectItem value="1344x768">Landscape</SelectItem>
              <SelectItem value="768x1344">Portrait</SelectItem>
              <SelectItem value="1152x864">Wide</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={loading || !prompt.trim()} className="shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
            Generate
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <Badge
            key={s}
            variant="outline"
            className="cursor-pointer text-xs hover:bg-accent transition-colors"
            onClick={() => setPrompt(s)}
          >
            {s.length > 45 ? s.slice(0, 45) + '...' : s}
          </Badge>
        ))}
      </div>

      {/* Generated Image */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="aspect-square max-w-lg mx-auto rounded-xl bg-muted flex items-center justify-center border"
          >
            <div className="text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
              <p className="text-sm">Creating your image...</p>
              <p className="text-xs mt-1 opacity-60">This may take a few seconds</p>
            </div>
          </motion.div>
        )}
        {generatedImage && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="relative rounded-xl overflow-hidden border shadow-lg">
              <img src={generatedImage} alt={prompt} className="w-full h-auto" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center italic">&quot;{prompt}&quot;</p>
          </motion.div>
        )}
        {!generatedImage && !loading && (
          <div className="aspect-square max-w-lg mx-auto rounded-xl bg-muted/50 flex items-center justify-center border border-dashed">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Your generated image will appear here</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────
// TTS Demo Component
// ────────────────────────────────────────────────
function TTSDemo() {
  const [text, setText] = useState('Welcome to the AI Services Portal. Explore our cutting-edge capabilities in language, vision, and audio intelligence.');
  const [voice, setVoice] = useState('tongtong');
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generate = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setPlaying(false);

    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), voice, speed }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to generate speech');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }, [audioUrl, playing]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1024))}
          placeholder="Enter text to convert to speech..."
          className="min-h-[100px] resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{text.length} / 1024 characters</span>
          {text.length > 900 && (
            <span className="text-xs text-amber-500">Approaching character limit</span>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Voice</label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tongtong">Tongtong (Warm)</SelectItem>
              <SelectItem value="xiaochen">Xiaochen (Professional)</SelectItem>
              <SelectItem value="jam">Jam (English Gentle)</SelectItem>
              <SelectItem value="kazi">Kazi (Clear Standard)</SelectItem>
              <SelectItem value="chuichui">Chuichui (Lively)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Speed: {speed.toFixed(1)}x</label>
          <Slider
            value={[speed]}
            onValueChange={(v) => setSpeed(v[0])}
            min={0.5}
            max={2.0}
            step={0.1}
            className="mt-3"
          />
        </div>
      </div>

      <Button onClick={generate} disabled={loading || !text.trim()} className="w-full sm:w-auto">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
        Generate Speech
      </Button>

      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-muted border"
        >
          <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-10 w-10 rounded-full"
            onClick={togglePlay}
          >
            {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Generated Audio</p>
            <p className="text-xs text-muted-foreground">WAV format • Click play to listen</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// Web Search Demo
// ────────────────────────────────────────────────
function SearchDemo() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), num: 8 }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setHasSearched(true);
      } else {
        toast.error(data.error || 'Search failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const trendingSearches = [
    'Latest AI breakthroughs 2025',
    'Next.js 16 new features',
    'TypeScript best practices',
  ];

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web..."
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </form>

      {!hasSearched && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground mr-1 self-center">Trending:</span>
          {trendingSearches.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="cursor-pointer text-xs hover:bg-accent transition-colors"
              onClick={() => { setQuery(t); }}
            >
              {t}
            </Badge>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Searching the web...</span>
        </div>
      )}

      {hasSearched && !loading && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No results found. Try a different query.</p>
        </div>
      )}

      {results.length > 0 && (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3 pr-4">
            {results.map((result) => (
              <motion.a
                key={result.position}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="block p-4 rounded-xl border hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-medium">{result.domain}</span>
                      {result.date && (
                        <span className="text-xs text-muted-foreground/60">• {result.date}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {result.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
              </motion.a>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// Demo Section
// ────────────────────────────────────────────────
function DemoSection() {
  return (
    <section id="demo" className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4">
              <Zap className="h-3 w-3 mr-1" /> Live Demos
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Try It Live
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Interact with our AI services in real-time. No sign-up required — just jump in and start exploring.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="chat" className="gap-1.5 text-xs sm:text-sm">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="gap-1.5 text-xs sm:text-sm">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Image</span>
              </TabsTrigger>
              <TabsTrigger value="tts" className="gap-1.5 text-xs sm:text-sm">
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Voice</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="gap-1.5 text-xs sm:text-sm">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <ChatDemo />
            </TabsContent>
            <TabsContent value="image">
              <ImageDemo />
            </TabsContent>
            <TabsContent value="tts">
              <TTSDemo />
            </TabsContent>
            <TabsContent value="search">
              <SearchDemo />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// Features Section
// ────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4">
              <Shield className="h-3 w-3 mr-1" /> Why AI Portal
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built for the Future
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Our platform combines cutting-edge AI research with production-grade infrastructure.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="h-full text-center hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="mx-auto p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// CTA Section
// ────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600" />
          <div className="absolute inset-0 bg-[url('/hero-portal.png')] bg-cover bg-center opacity-10" />
          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to Experience AI?
            </h2>
            <p className="mt-4 text-emerald-100 max-w-xl mx-auto">
              Jump into the live demos above and see what our AI services can do for you. No account needed.
            </p>
            <Button
              size="lg"
              className="mt-8 bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Exploring <ArrowUp className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────
// Footer
// ────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">AI Portal</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your unified gateway to cutting-edge AI capabilities. Built with Next.js and powered by state-of-the-art models.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {SERVICES.filter(s => s.tag === 'Interactive').map(s => (
                <li key={s.id}>
                  <button
                    className="hover:text-foreground transition-colors"
                    onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button className="hover:text-foreground transition-colors" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>All Services</button></li>
              <li><button className="hover:text-foreground transition-colors" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>Live Demos</button></li>
              <li><button className="hover:text-foreground transition-colors" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>About</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Tech Stack</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Next.js 16</li>
              <li>TypeScript</li>
              <li>Tailwind CSS 4</li>
              <li>shadcn/ui</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AI Services Portal. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by z-ai-web-dev-sdk
          </p>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────
// Scroll to top button
// ────────────────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <DemoSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
