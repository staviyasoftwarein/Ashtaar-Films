import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Clock, MessageSquare, ChevronRight, X } from 'lucide-react';
import { useSetting } from '../hooks/useSetting';
import { DEFAULT_BLOG, formatBlogDate, resolveBlogMediaUrl, type BlogPost } from '../lib/blog';

const fallbackImages = [
  'https://images.unsplash.com/photo-1492691523567-6170c81efc30?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1542204172-3c13955bca3e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1920&q=80',
];

type RenderPost = BlogPost & { img: string; displayDate: string };

function toRenderPost(post: BlogPost, index: number): RenderPost {
  return {
    ...post,
    img: post.mediaPath ? resolveBlogMediaUrl(post.mediaPath) : fallbackImages[index % fallbackImages.length],
    displayDate: formatBlogDate(post.date),
  };
}

function renderContent(content: string) {
  const linkPattern = /((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?)/gi;

  return content
    .split('\n')
    .filter(Boolean)
    .map((line, idx) => (
      <p key={idx}>
        {line.split(linkPattern).map((part, j) => {
          const isLink = linkPattern.test(part);
          linkPattern.lastIndex = 0;
          const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;

          return isLink ? (
            <a
              key={j}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4AF37] underline underline-offset-2 hover:opacity-70 transition-opacity break-all"
            >
              {part}
            </a>
          ) : (
            <span key={j}>{part}</span>
          );
        })}
      </p>
    ));
}

export default function Blog() {
  const { value: blog } = useSetting('blog', DEFAULT_BLOG);
  const allPosts = blog.posts.map(toRenderPost);
  const posts = allPosts.slice(0, 3);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<RenderPost | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSelectedPost(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <section
      id="blog"
      ref={containerRef}
      className="min-h-screen bg-[#fafaf9] text-gray-900 py-32 px-6 md:px-12 relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#D4AF37]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <h3 className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs font-sans font-bold mb-6">
              Journal
            </h3>
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl flex flex-col leading-tight">
              <span>CINEMATIC</span>
              <span className="italic flex items-center gap-4">
                INSIGHTS
                <div className="h-[2px] w-24 md:w-48 bg-black/10" />
              </span>
            </h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-4 py-4 px-8 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all duration-500 font-sans tracking-widest text-xs uppercase font-bold cursor-pointer"
          >
            Explore All stories
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        {/* Post Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              onClick={() => {
                const found = allPosts.find((p) => p.title === post.title);
                if (found) setSelectedPost(found);
                setIsModalOpen(true);
              }}
              className="group cursor-pointer flex flex-col border-t border-black/10 pt-8 hover:bg-white hover:shadow-2xl hover:shadow-black/5 p-6 md:p-8 -m-6 md:-m-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 h-full relative z-0 hover:z-10"
            >
              <div className="w-full h-48 md:h-64 mb-6 relative overflow-hidden rounded-xl shrink-0">
                <img
                  src={post.img}
                  alt={post.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono mb-6 group-hover:text-gray-900 transition-colors">
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {post.displayDate}
                </span>
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> {post.comments}
                </span>
              </div>
              <h4 className="font-serif text-3xl lg:text-4xl leading-snug group-hover:text-[#D4AF37] transition-colors duration-300 mb-6 text-gray-900">
                {post.title}
              </h4>
              <p className="text-gray-500 font-sans text-sm md:text-base leading-relaxed mb-8 line-clamp-4 group-hover:text-gray-700 transition-colors">
                {post.excerpt}
              </p>
              <div className="mt-auto pt-4 flex items-center gap-2 text-[#D4AF37] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <span className="text-[10px] uppercase font-bold tracking-widest">Read Article</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
            data-lenis-prevent="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-[90vh] bg-[#fafaf9] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-black/10 shrink-0 bg-[#fafaf9] z-10">
                {selectedPost ? (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer group"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-900 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h3 className="font-serif text-xl md:text-2xl text-gray-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-xl">
                      {selectedPost.title}
                    </h3>
                  </div>
                ) : (
                  <h3 className="font-serif text-3xl md:text-4xl text-gray-900">All Stories</h3>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer ml-auto"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar" data-lenis-prevent="true">
                <AnimatePresence mode="wait">
                  {selectedPost ? (
                    <motion.div
                      key="post-content"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      className="max-w-3xl mx-auto py-4 md:py-8"
                    >
                      <div className="w-full h-[30vh] md:h-[50vh] mb-8 relative rounded-2xl overflow-hidden shadow-lg border border-black/5">
                        <img
                          src={selectedPost.img}
                          alt={selectedPost.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mb-8 flex items-center justify-end">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                          <Clock className="w-3.5 h-3.5" /> {selectedPost.displayDate}
                        </span>
                      </div>
                      <h2 className="font-serif text-4xl leading-tight mb-8 text-gray-900">
                        {selectedPost.title}
                      </h2>
                      <div className="text-lg leading-relaxed text-gray-700 font-sans space-y-6">
                        {renderContent(selectedPost.content)}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="post-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-4 max-w-4xl mx-auto"
                    >
                      {allPosts.map((post, i) => (
                        <motion.div
                          key={`modal-post-${i}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setSelectedPost(post)}
                          className="group cursor-pointer flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-6 md:p-8 rounded-xl bg-white hover:bg-[#fafaf9] shadow-sm hover:shadow-md border border-black/5 hover:border-black/10 transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="w-full md:w-48 h-48 md:h-32 shrink-0 rounded-lg overflow-hidden relative border border-black/5">
                            <img
                              src={post.img}
                              alt={post.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-wider font-mono mb-3">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> {post.displayDate}
                              </span>
                            </div>
                            <h4 className="font-serif text-xl md:text-2xl leading-tight group-hover:text-[#D4AF37] transition-colors duration-300 mb-2">
                              {post.title}
                            </h4>
                            <p className="text-gray-500 text-sm font-sans line-clamp-2 md:line-clamp-1 max-w-2xl group-hover:text-gray-700 transition-colors">
                              {post.excerpt}
                            </p>
                          </div>
                          <div className="hidden md:flex shrink-0 items-center justify-center w-12 h-12 rounded-full border border-black/10 group-hover:bg-black group-hover:border-black transition-colors duration-300">
                            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
