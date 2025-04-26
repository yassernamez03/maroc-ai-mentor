
import React, { useState, useEffect } from "react";
import { MessageCircle, Heart, ThumbsUp, Flag, User, Clock, Send, Search } from "lucide-react";

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  replies: Reply[];
  tags: string[];
  flagged: boolean;
}

interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  isAI: boolean;
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = localStorage.getItem("communityPosts");
    return savedPosts ? JSON.parse(savedPosts) : [
      {
        id: "post-1",
        author: "Youssef",
        content: "Salam! I've been learning JavaScript for 3 weeks now and I'm struggling with async/await concepts. Any good resources in Darija that explain this well?",
        timestamp: "2 hours ago",
        likes: 8,
        liked: false,
        replies: [
          {
            id: "reply-1-1",
            author: "AI Assistant",
            content: "Mrhba Youssef! For async/await in Darija, check out DarijaCode's lessons on JavaScript asynchronous programming. I'd recommend starting with promises before moving to async/await. O jreb had video: https://youtu.be/example",
            timestamp: "1 hour ago",
            likes: 5,
            liked: false,
            isAI: true
          },
          {
            id: "reply-1-2",
            author: "Fatima",
            content: "Ana kont 3endi nafs lmochkil. Jrebt course dial 'JavaScript Maroc' 3la YouTube, kaycherho async/await mezyan bzaf. Good luck!",
            timestamp: "45 minutes ago",
            likes: 3,
            liked: false,
            isAI: false
          }
        ],
        tags: ["javascript", "beginner", "question"],
        flagged: false
      },
      {
        id: "post-2",
        author: "Mohamed",
        content: "Just completed my first React project! It's a dashboard for tracking water consumption in different regions of Morocco. Learned a lot about hooks and context API.",
        timestamp: "1 day ago",
        likes: 15,
        liked: false,
        replies: [
          {
            id: "reply-2-1",
            author: "Sophia",
            content: "Mabrouk Mohamed! I'm also working with React. Would you mind sharing your GitHub repo? I'd love to see how you implemented the data visualization.",
            timestamp: "20 hours ago",
            likes: 2,
            liked: false,
            isAI: false
          }
        ],
        tags: ["react", "project", "showcase"],
        flagged: false
      },
      {
        id: "post-3",
        author: "Amina",
        content: "Anyone here using TailwindCSS? I'm considering switching from Bootstrap but not sure if it's worth the learning curve. Thoughts?",
        timestamp: "3 days ago",
        likes: 10,
        liked: false,
        replies: [
          {
            id: "reply-3-1",
            author: "AI Assistant",
            content: "Tailwind CSS offers great utility-first approach and is very customizable. The learning curve isn't too steep if you already know CSS. The documentation is excellent too. For Moroccan developers, there's a growing community of Tailwind users in tech meetups in Casablanca and Rabat.",
            timestamp: "3 days ago",
            likes: 6,
            liked: false,
            isAI: true
          },
          {
            id: "reply-3-2",
            author: "Karim",
            content: "Ana kanstakhdem Tailwind f projects dyali kolhom. In the beginning ghadi t7ess bli complicated, walkin from my experience, it speeds up development a lot once you get used to it.",
            timestamp: "2 days ago",
            likes: 8,
            liked: false,
            isAI: false
          }
        ],
        tags: ["css", "tailwind", "question"],
        flagged: false
      }
    ];
  });

  const [newPostContent, setNewPostContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [replyContent, setReplyContent] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("communityUserName") || "";
  });
  const [isSettingName, setIsSettingName] = useState(!localStorage.getItem("communityUserName"));

  useEffect(() => {
    localStorage.setItem("communityPosts", JSON.stringify(posts));
  }, [posts]);

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === "all" || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const likePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked
        };
      }
      return post;
    }));
  };

  const likeReply = (postId: string, replyId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: post.replies.map(reply => {
            if (reply.id === replyId) {
              return {
                ...reply,
                likes: reply.liked ? reply.likes - 1 : reply.likes + 1,
                liked: !reply.liked
              };
            }
            return reply;
          })
        };
      }
      return post;
    }));
  };

  const flagPost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          flagged: !post.flagged
        };
      }
      return post;
    }));
  };

  const submitNewPost = async () => {
    if (newPostContent.trim() === "" || userName.trim() === "") return;
    
    setIsSubmitting(true);
    
    // Generate tags using AI
    let generatedTags = ["general"];
    
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || "PLACEHOLDER_API_KEY"}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: "You are a tagging assistant for DarijaCode Hub community. Generate 2-3 relevant tags for the given post. Return only a JSON array of strings, e.g. [\"javascript\", \"beginner\"]."
            },
            {
              role: "user",
              content: `Generate tags for this community post: ${newPostContent}`
            }
          ],
          max_tokens: 256,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || "";
        
        try {
          // Try to extract JSON
          const jsonMatch = content.match(/```json([\s\S]*?)```/) || 
                           content.match(/```([\s\S]*?)```/) || 
                           [null, content];
          
          const jsonContent = jsonMatch[1] || content;
          const tagsArray = JSON.parse(jsonContent);
          
          if (Array.isArray(tagsArray) && tagsArray.length > 0) {
            generatedTags = tagsArray.slice(0, 3); // Limit to max 3 tags
          }
        } catch (e) {
          console.error("Error parsing tags:", e);
        }
      }
    } catch (error) {
      console.error("Error generating tags:", error);
    }
    
    // Create the new post
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: userName,
      content: newPostContent,
      timestamp: "Just now",
      likes: 0,
      liked: false,
      replies: [],
      tags: generatedTags,
      flagged: false
    };
    
    setPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
    
    // Generate AI response if it seems like a question
    if (newPostContent.includes("?") || 
        newPostContent.toLowerCase().includes("how") || 
        newPostContent.toLowerCase().includes("what") ||
        newPostContent.toLowerCase().includes("why")) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || "PLACEHOLDER_API_KEY"}`
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              {
                role: "system",
                content: "You are DarijaCode Hub's community assistant helping Moroccan developers. Keep your responses friendly, helpful and concise (max 2-3 paragraphs). If the user is speaking in Darija (Moroccan dialect), respond in Darija using Latin script when appropriate."
              },
              {
                role: "user",
                content: newPostContent
              }
            ],
            max_tokens: 512,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiReplyContent = data.choices[0]?.message?.content || "";
          
          // Add AI reply
          const aiReply: Reply = {
            id: `reply-${newPost.id}-${Date.now()}`,
            author: "AI Assistant",
            content: aiReplyContent,
            timestamp: "Just now",
            likes: 0,
            liked: false,
            isAI: true
          };
          
          setTimeout(() => {
            setPosts(prev => prev.map(post => {
              if (post.id === newPost.id) {
                return {
                  ...post,
                  replies: [...post.replies, aiReply]
                };
              }
              return post;
            }));
          }, 2000); // Add a small delay to simulate AI thinking
        }
      } catch (error) {
        console.error("Error generating AI response:", error);
      }
    }
    
    setIsSubmitting(false);
  };

  const submitReply = async (postId: string) => {
    const content = replyContent[postId];
    if (!content || content.trim() === "" || userName.trim() === "") return;
    
    // Add user's reply
    const newReply: Reply = {
      id: `reply-${postId}-${Date.now()}`,
      author: userName,
      content: content,
      timestamp: "Just now",
      likes: 0,
      liked: false,
      isAI: false
    };
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...post.replies, newReply]
        };
      }
      return post;
    }));
    
    // Clear the reply input
    setReplyContent(prev => ({ ...prev, [postId]: "" }));
    
    // Generate AI response if needed
    if (content.includes("?") || 
        content.toLowerCase().includes("how") || 
        content.toLowerCase().includes("what") ||
        content.toLowerCase().includes("why")) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || "PLACEHOLDER_API_KEY"}`
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              {
                role: "system",
                content: "You are DarijaCode Hub's community assistant helping Moroccan developers. Keep your responses friendly, helpful and concise (max 2-3 paragraphs). If the user is speaking in Darija (Moroccan dialect), respond in Darija using Latin script when appropriate."
              },
              {
                role: "user",
                content: content
              }
            ],
            max_tokens: 512,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiReplyContent = data.choices[0]?.message?.content || "";
          
          // Add AI reply
          const aiReply: Reply = {
            id: `reply-${postId}-${Date.now() + 1}`,
            author: "AI Assistant",
            content: aiReplyContent,
            timestamp: "Just now",
            likes: 0,
            liked: false,
            isAI: true
          };
          
          setTimeout(() => {
            setPosts(prev => prev.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  replies: [...post.replies, aiReply]
                };
              }
              return post;
            }));
          }, 2000); // Add a small delay to simulate AI thinking
        }
      } catch (error) {
        console.error("Error generating AI response:", error);
      }
    }
  };

  const saveUserName = () => {
    if (userName.trim() !== "") {
      localStorage.setItem("communityUserName", userName);
      setIsSettingName(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Community Forum
      </h1>
      
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
        Connect with fellow Moroccan developers, ask questions, and share your coding experiences.
      </p>
      
      {isSettingName ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Welcome to the Community!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            To participate in discussions, please choose a username:
          </p>
          <div className="flex gap-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              maxLength={20}
            />
            <button
              onClick={saveUserName}
              className="px-6 py-2 bg-morocco-blue hover:bg-morocco-blue/90 text-white rounded-lg"
              disabled={userName.trim() === ""}
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* New post form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-morocco-blue/10 dark:bg-morocco-blue/20 flex items-center justify-center">
                <User size={20} className="text-morocco-blue" />
              </div>
              <div className="flex-grow">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share something with the community or ask a question..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Posting as <strong>{userName}</strong>
                  </span>
                  <button
                    onClick={submitNewPost}
                    disabled={newPostContent.trim() === "" || isSubmitting}
                    className="px-4 py-2 bg-morocco-blue hover:bg-morocco-blue/90 text-white rounded-md flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" /> Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search posts..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Topics</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Posts */}
          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-400">No posts found matching your criteria.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                    post.flagged
                      ? "border-red-300 dark:border-red-700"
                      : "border-gray-200 dark:border-gray-700"
                  } p-6`}
                >
                  {/* Post header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-morocco-blue/10 dark:bg-morocco-blue/20 flex items-center justify-center">
                        <User size={20} className="text-morocco-blue" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 dark:text-white">{post.author}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock size={14} className="mr-1" /> {post.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => flagPost(post.id)}
                      className={`p-1 rounded-full ${
                        post.flagged
                          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                          : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      title={post.flagged ? "Unflag post" : "Flag inappropriate content"}
                    >
                      <Flag size={16} />
                    </button>
                  </div>
                  
                  {/* Post content */}
                  <div className="mt-3">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
                    
                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Post actions */}
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => likePost(post.id)}
                      className={`flex items-center text-sm ${
                        post.liked
                          ? "text-morocco-blue dark:text-morocco-mint"
                          : "text-gray-500 dark:text-gray-400"
                      } hover:text-morocco-blue dark:hover:text-morocco-mint`}
                    >
                      <ThumbsUp size={16} className="mr-1" />
                      <span>{post.likes}</span>
                    </button>
                    
                    <button
                      className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-morocco-blue dark:hover:text-morocco-mint"
                      onClick={() => {
                        if (!replyContent[post.id]) {
                          setReplyContent(prev => ({ ...prev, [post.id]: "" }));
                        }
                      }}
                    >
                      <MessageCircle size={16} className="mr-1" />
                      <span>{post.replies.length}</span>
                    </button>
                  </div>
                  
                  {/* Replies */}
                  {post.replies.length > 0 && (
                    <div className="mt-6 space-y-4 pl-6 border-l-2 border-gray-100 dark:border-gray-700">
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="relative">
                          <div className="flex items-start">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              reply.isAI 
                                ? "bg-gradient-to-br from-morocco-blue to-morocco-mint" 
                                : "bg-morocco-blue/10 dark:bg-morocco-blue/20"
                            }`}>
                              {reply.isAI ? (
                                <span className="text-xs font-bold text-white">AI</span>
                              ) : (
                                <User size={16} className="text-morocco-blue" />
                              )}
                            </div>
                            <div className="ml-3 flex-grow">
                              <div className="flex items-center">
                                <p className={`font-medium ${
                                  reply.isAI 
                                    ? "text-morocco-blue dark:text-morocco-mint" 
                                    : "text-gray-900 dark:text-white"
                                }`}>
                                  {reply.author}
                                </p>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{reply.timestamp}</span>
                              </div>
                              <p className="text-gray-800 dark:text-gray-200 text-sm">{reply.content}</p>
                              <button
                                onClick={() => likeReply(post.id, reply.id)}
                                className={`mt-1 flex items-center text-xs ${
                                  reply.liked
                                    ? "text-morocco-blue dark:text-morocco-mint"
                                    : "text-gray-500 dark:text-gray-400"
                                } hover:text-morocco-blue dark:hover:text-morocco-mint`}
                              >
                                <ThumbsUp size={12} className="mr-1" />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Reply form */}
                  {replyContent.hasOwnProperty(post.id) && (
                    <div className="mt-4 pl-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-morocco-blue/10 dark:bg-morocco-blue/20 flex items-center justify-center">
                          <User size={16} className="text-morocco-blue" />
                        </div>
                        <div className="flex-grow">
                          <textarea
                            value={replyContent[post.id]}
                            onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a reply..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none text-sm"
                            rows={2}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => submitReply(post.id)}
                              disabled={!replyContent[post.id] || replyContent[post.id].trim() === ""}
                              className="px-3 py-1 bg-morocco-blue hover:bg-morocco-blue/90 text-white rounded-md text-sm flex items-center"
                            >
                              <Send size={14} className="mr-1" /> Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Community;
