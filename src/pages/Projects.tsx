
import React, { useState, useEffect } from "react";
import { Search, Filter, Code, ArrowRight, Star, BookmarkPlus, BookmarkCheck, Plus } from "lucide-react";
import mermaid from "mermaid";

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  savedToLibrary: boolean;
}

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [generatedFlowchart, setGeneratedFlowchart] = useState<string | null>(null);
  
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>(() => {
    const savedProjects = localStorage.getItem("projectIdeas");
    return savedProjects ? JSON.parse(savedProjects) : [
      {
        id: "project-1",
        title: "Weather Dashboard App",
        description: "Build a responsive weather dashboard that displays current weather and forecasts for multiple cities using a weather API.",
        difficulty: "beginner",
        tags: ["frontend", "api"],
        savedToLibrary: true
      },
      {
        id: "project-2",
        title: "Personal Task Manager",
        description: "Create a task management application with features like task creation, priority setting, due dates, and status tracking.",
        difficulty: "beginner",
        tags: ["frontend", "javascript"],
        savedToLibrary: false
      },
      {
        id: "project-3",
        title: "Recipe Sharing Platform",
        description: "Develop a platform where users can share Moroccan recipes, rate others' recipes, and filter by categories.",
        difficulty: "intermediate",
        tags: ["fullstack", "database"],
        savedToLibrary: false
      },
      {
        id: "project-4",
        title: "E-commerce Product Page",
        description: "Build a responsive product page with image gallery, product description, pricing, and add-to-cart functionality.",
        difficulty: "beginner",
        tags: ["frontend", "css"],
        savedToLibrary: true
      },
      {
        id: "project-5",
        title: "Markdown Blog Engine",
        description: "Create a simple blog engine that renders Markdown content, with tag filtering and search functionality.",
        difficulty: "intermediate",
        tags: ["frontend", "javascript"],
        savedToLibrary: false
      },
      {
        id: "project-6",
        title: "Real-time Chat Application",
        description: "Build a real-time chat application with private messaging, group chats, and online status indicators.",
        difficulty: "advanced",
        tags: ["fullstack", "websocket"],
        savedToLibrary: false
      },
    ];
  });

  const [selectedProject, setSelectedProject] = useState<ProjectIdea | null>(null);
  const [projectDetails, setProjectDetails] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
      securityLevel: "loose",
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("projectIdeas", JSON.stringify(projectIdeas));
  }, [projectIdeas]);

  const allTags = Array.from(new Set(projectIdeas.flatMap(project => project.tags)));

  const filteredProjects = projectIdeas.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === "all" || project.difficulty === selectedDifficulty;
    
    const matchesTag = selectedTag === "all" || project.tags.includes(selectedTag);
    
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  const toggleSaveProject = (projectId: string) => {
    setProjectIdeas(prev => prev.map(project => {
      if (project.id === projectId) {
        return { ...project, savedToLibrary: !project.savedToLibrary };
      }
      return project;
    }));
  };

  const selectProject = async (project: ProjectIdea) => {
    setSelectedProject(project);
    setProjectDetails(null);
    
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
              content: "You are DarijaCode Hub's project assistant, helping Moroccan developers with coding projects. Your responses should include practical steps to implement the project, suggested technologies, possible extensions, and learning outcomes. Format with markdown."
            },
            { 
              role: "user", 
              content: `Provide detailed guidance for the project: ${project.title}. ${project.description}`
            }
          ],
          max_tokens: 2048,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setProjectDetails(data.choices[0]?.message?.content || "Sorry, I couldn't generate details for this project.");
      
      // Attempt to render any mermaid diagrams in the response
      setTimeout(() => {
        mermaid.contentLoaded();
      }, 100);
      
    } catch (error) {
      console.error("Error fetching project details:", error);
      setProjectDetails("Sorry, there was an error generating the project details. Please make sure your API key is set up correctly.");
    }
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
    setProjectDetails(null);
  };

  const generateProjectIdea = async () => {
    if (projectDescription.trim() === "") {
      setGenerationError("Please enter a project description");
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedFlowchart(null);
    
    try {
      // First, generate the project details
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
              content: "You are DarijaCode Hub's project idea generator for Moroccan developers. Generate a project idea based on the user's description, and format your output as JSON. Include fields: title, description, difficulty (beginner/intermediate/advanced), tags (array of strings)."
            },
            {
              role: "user",
              content: `Generate a coding project idea based on: ${projectDescription}`
            }
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      try {
        // Extract JSON from the response
        const jsonMatch = content.match(/```json([\s\S]*?)```/) || 
                          content.match(/```([\s\S]*?)```/) || 
                          [null, content];
        
        const jsonContent = jsonMatch[1] || content;
        const projectData = JSON.parse(jsonContent);
        
        // Create the new project
        const newProject: ProjectIdea = {
          id: `project-${Date.now()}`,
          title: projectData.title || "New Project",
          description: projectData.description || projectDescription,
          difficulty: projectData.difficulty || "beginner",
          tags: Array.isArray(projectData.tags) ? projectData.tags : ["other"],
          savedToLibrary: false
        };
        
        // Add to project ideas
        setProjectIdeas(prev => [newProject, ...prev]);
        
        // Now generate a flowchart for the project
        await generateFlowchart(newProject);
        
        // Clear input
        setProjectDescription("");
      } catch (parseError) {
        console.error("Error parsing project JSON:", parseError);
        setGenerationError("Failed to parse the generated project. Please try again with a clearer description.");
      }
    } catch (error) {
      console.error("Error generating project:", error);
      setGenerationError("An error occurred while generating the project. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFlowchart = async (project: ProjectIdea) => {
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
              content: "You are an expert at creating Mermaid.js flowcharts. Create a simple, clear flowchart for the given project. Use only flowchart syntax, not other Mermaid diagram types. Keep it simple with 5-10 nodes maximum."
            },
            {
              role: "user",
              content: `Create a Mermaid.js flowchart for this project: ${project.title}. ${project.description}`
            }
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      // Extract the Mermaid code block
      const mermaidMatch = content.match(/```mermaid([\s\S]*?)```/) || 
                          content.match(/```([\s\S]*?)```/);
      
      if (mermaidMatch && mermaidMatch[1]) {
        setGeneratedFlowchart(mermaidMatch[1].trim());
        
        // Render the flowchart
        setTimeout(() => {
          mermaid.contentLoaded();
        }, 100);
      }
    } catch (error) {
      console.error("Error generating flowchart:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {!selectedProject ? (
        <>
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            Project Ideas
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Explore coding project ideas customized for your skill level and interests.
          </p>
          
          {/* Generate new project */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Generate a New Project Idea
            </h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe a project you're interested in..."
                className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              
              <button
                onClick={generateProjectIdea}
                disabled={isGenerating}
                className="px-6 py-2 bg-morocco-blue hover:bg-morocco-blue/90 text-white rounded-lg flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Generate Project
                  </>
                )}
              </button>
            </div>
            
            {generationError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
                {generationError}
              </div>
            )}
            
            {generatedFlowchart && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                  Project Flowchart
                </h3>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                  <pre className="mermaid">{generatedFlowchart}</pre>
                </div>
              </div>
            )}
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
                  placeholder="Search projects..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-morocco-blue focus:border-morocco-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Project list */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">No projects found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveProject(project.id);
                        }}
                        className="text-gray-400 hover:text-morocco-blue dark:text-gray-500 dark:hover:text-morocco-mint"
                        aria-label={project.savedToLibrary ? "Remove from library" : "Save to library"}
                      >
                        {project.savedToLibrary ? (
                          <BookmarkCheck size={18} />
                        ) : (
                          <BookmarkPlus size={18} />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.difficulty === "beginner" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" :
                        project.difficulty === "intermediate" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                      }`}>
                        {project.difficulty}
                      </span>
                      
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => selectProject(project)}
                      className="flex items-center text-morocco-blue dark:text-morocco-mint hover:underline"
                    >
                      View Details <ArrowRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={closeProjectDetails}
            className="mb-6 flex items-center text-morocco-blue dark:text-morocco-mint hover:underline"
          >
            <ArrowRight size={16} className="transform rotate-180 mr-1" /> Back to Projects
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedProject.title}
              </h2>
              
              <button
                onClick={() => toggleSaveProject(selectedProject.id)}
                className={`flex items-center px-3 py-1 rounded-md text-sm ${
                  selectedProject.savedToLibrary
                    ? "bg-morocco-blue/20 text-morocco-blue dark:bg-morocco-blue/30 dark:text-morocco-mint"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {selectedProject.savedToLibrary ? (
                  <>
                    <BookmarkCheck size={16} className="mr-1" /> Saved
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={16} className="mr-1" /> Save
                  </>
                )}
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedProject.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedProject.difficulty === "beginner" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" :
                selectedProject.difficulty === "intermediate" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              }`}>
                {selectedProject.difficulty.charAt(0).toUpperCase() + selectedProject.difficulty.slice(1)}
              </span>
              
              {selectedProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {projectDetails === null ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-morocco-blue/20 border-t-morocco-blue rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Loading project details...</p>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: projectDetails
                    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-5">$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mb-2 mt-4">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(/```mermaid([\s\S]*?)```/gim, '<pre class="mermaid">$1</pre>')
                    .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto"><code>$1</code></pre>')
                    .replace(/`(.*?)`/gim, '<code class="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">$1</code>')
                }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
