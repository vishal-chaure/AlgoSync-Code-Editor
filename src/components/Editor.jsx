import { useState, useRef, useEffect } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Play,
  ArrowLeft,
  Users,
  Code2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Copy,
  LogOut,
  Plus,
  Minus
} from "lucide-react";
import { initSocket } from "@/socket";
import ACTIONS from "@/Actions";
import Client from "./Client";
import { toast } from "sonner";
// import { env } from "process";

// const sidebarRef = useRef/** @type {React.MutableRefObject<ImperativePanelHandle|null>} */(null);
const url = import.meta.env

const Editor = ({ roomData, onNavigateToHome }) => {

  const [qid, setQid] = useState(null);
  const [token, setToken] = useState(null);
  const [question, setQuestion] = useState({
    title: "",
    description: "",
    examples: [],       // default to empty array
    constraints: [],    // default to empty array
    difficulty: "",
    topicTags: [],
    platformTag: "",
    platformLink: "",
    youtubeLink: "",
    isImportant: false,
    isSolved: false,
    savedCode: "",
    language: "Java",
    topic: "",
    userFullName: "",
  });

  useEffect(() => {
    // Get query params from URL
    const params = new URLSearchParams(window.location.search);
    const qid = params.get("question_id"); // will be "1234"
    const token = params.get("token"); // will be "1234"
    console.log("Fetched Question ID:::", qid, "Token:", token);
    setQid(qid);
    setToken(token);
    const getQuestionData = async () => {
      if (qid && token) {
        try {
          const response = await fetch(`http://localhost:5000/api/questions/${qid}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, // pass token here
            },
          });
          const data = await response.json();
          if (!data) {
            console.log("No question data found");
            return;
          }

          // Map backend data to structured frontend format
          const mappedData = {
            id: data._id,
            title: data.title,
            description: data.description,
            examples: data.examples?.map((ex) => {
              const lines = ex.split("\n");
              return {
                input: lines[0] || "",
                output: lines[1] || "",
                explanation: lines[2] || "",
              };
            }) || [],
            constraints: data.constraints || [],
            difficulty: data.difficulty || "",
            topicTags: data.topicTags || [],
            platformTag: data.platformTag || "",
            platformLink: data.platformLink || "",
            youtubeLink: data.youtubeLink || "",
            isImportant: data.isImportant || false,
            isSolved: data.isSolved || false,
            savedCode: data.savedCode || "",
            language: data.language || "Java",
            topic: data.topic || "",
            userFullName: data.userFullName || "",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };

          setQuestion(mappedData);
          console.log("Mapped Question Data:", mappedData);

        } catch (error) {
          console.error("Error fetching question:", error);
          setQuestion("No question data found");
          console.log("Question Data: No question data found");
        }
      }
    }
    getQuestionData();
  }, []);



  const questionData = {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists."
    ]
  };

  const outputPanelRef = useRef(null);

  const toggleOutputPanel = async (toClose = true) => {
    // Collapse sidebar to 0 or expand to 20%
    const currentSize = outputPanelRef.current.getSize();
    if (toClose && currentSize > 15) {
      outputPanelRef.current.resize(0); // collapse
    } else {
      if (currentSize == 0) {
        outputPanelRef.current.resize(50);
      }
      // expand
    }
  };


  const [code, setCode] = useState(`// Welcome to AlgoSync!
// Write your Java code here and click Run to execute
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, AlgoSync!");
    }
}
`);
  const [output, setOutput] = useState("");
  const [isOutputVisible, setIsOutputVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [fontSize, setFontSize] = useState(16);
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const codeRef = useRef(null);

  const languages = [
    { id: "java", name: "Java", monaco: "java" },
    { id: "cpp", name: "C++", monaco: "cpp" },
    { id: "javascript", name: "JavaScript", monaco: "javascript" },
    { id: "python", name: "Python", monaco: "python" }
  ];

  // const questionData = {
  //   title: "Two Sum",
  //   description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  //   examples: [
  //     {
  //       input: "nums = [2,7,11,15], target = 9",
  //       output: "[0,1]",
  //       explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
  //     },
  //     {
  //       input: "nums = [3,2,4], target = 6",
  //       output: "[1,2]",
  //       explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
  //     }
  //   ],
  //   constraints: [
  //     "2 ≤ nums.length ≤ 10⁴",
  //     "-10⁹ ≤ nums[i] ≤ 10⁹",
  //     "-10⁹ ≤ target ≤ 10⁹",
  //     "Only one valid answer exists."
  //   ]
  // };

  // Socket.IO initialization
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        onNavigateToHome();
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId: roomData.roomId,
        username: roomData.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== roomData.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);

          // Send current code to the new user if we have actual code (not boilerplate)
          if (codeRef.current && !codeRef.current.includes("Welcome to AlgoSync!")) {
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
              code: codeRef.current,
              socketId,
            });
          }
        }
      );

      // Listening for disconnected
      socketRef.current.on(
        ACTIONS.DISCONNECTED,
        ({ socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) => {
            return prev.filter(
              (client) => client.socketId !== socketId
            );
          });
        }
      );
    };
    init();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, []);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // Set Monaco editor theme to dark
    editor.updateOptions({
      theme: 'vs-dark',
      fontSize: fontSize,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });
  };


  const BASE_URL = "http://localhost:5000";


  const executeCode = async () => {
    setIsRunning(true);

    try {
      setOutput("");
      setIsOutputVisible(true);

      let endpoint;
      switch (selectedLanguage) {
        case "java": endpoint = `${BASE_URL}/api/run-java`; break;
        case "cpp": endpoint = `${BASE_URL}/api/run-cpp`; break;
        case "javascript": endpoint = `${BASE_URL}/api/run-js`; break;
        case "python": endpoint = `${BASE_URL}/api/run-python`; break;
        default:
          setOutput([{ type: "error", message: "Unsupported language selected" }]);
          return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success) {
        setOutput(result.output);
      } else {
        setOutput([{ type: "error", message: result.output }]);
      }
    } catch (error) {
      setOutput([{ type: "error", message: `Error: ${error.message}` }]);
    } finally {
      setIsRunning(false);
    }
  };

  // Real-time code sync
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && code !== codeRef.current) {
          setCode(code);
          codeRef.current = code;
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [socketRef.current]);

  // Update codeRef when code changes
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Update editor font size when fontSize state changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: fontSize });
    }
  }, [fontSize]);

  // Get starter code for different languages
  const getStarterCode = (language) => {
    switch (language) {
      case 'java':
        return `// Welcome to AlgoSync!
// Write your Java code here and click Run to execute
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, AlgoSync!");
    }
}`;
      case 'cpp':
        return `// Welcome to AlgoSync!
// Write your C++ code here and click Run to execute

#include <iostream>
using namespace std;

int main() {
    cout << "Hello, AlgoSync!" << endl;
    return 0;
}`;
      case 'javascript':
        return `// Welcome to AlgoSync!
// Write your JavaScript code here and click Run to execute

console.log("Hello, AlgoSync!");

// Try writing your own code!`;
      case 'python':
        return `# Welcome to AlgoSync!
# Write your Python code here and click Run to execute

print("Hello, AlgoSync!")

# Try writing your own code!`;
      default:
        return code;
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    setIsDropdownOpen(false);

    // Update code to language-specific template if it's the default code
    if (code.includes("Welcome to AlgoSync!") && code.includes("Hello, AlgoSync!")) {
      const newCode = getStarterCode(newLanguage);
      setCode(newCode);
      // Sync the new code with other users
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId: roomData.roomId,
          code: newCode,
        });
      }
    }
  };

  // Emit code changes to other users
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId: roomData.roomId,
        code: newCode,
      });
    }
  };

  // Font size control
  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24);
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12);
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  // Copy room ID to clipboard
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomData.roomId);
      toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  const formatOutput = (output) => {
    if (typeof output === 'string') {
      return output;
    }

    if (Array.isArray(output)) {
      return output.map((log, index) => (
        <div key={index} className={`mb-1 ${log.type === 'error' ? 'text-error' :
          log.type === 'warn' ? 'text-warning' :
            log.type === 'info' ? 'text-primary' :
              'text-foreground'
          }`}>
          <span className="text-muted-foreground text-xs mr-2">
            {log.type.toUpperCase()}:
          </span>
          {log.message}
        </div>
      ));
    }

    return output;
  };







  //   return (
  //     <div className="h-screen flex bg-background">
  //       {/* Sidebar */}
  //       <AnimatePresence>
  //         {isSidebarOpen && (
  //           <motion.div
  //             initial={{ x: -400, opacity: 0 }}
  //             animate={{ x: 0, opacity: 1 }}
  //             exit={{ x: -400, opacity: 0 }}
  //             transition={{ duration: 0.3, ease: "easeInOut" }}
  //             className="w-1/3 bg-card border-r border-border flex flex-col"
  //           >
  //             <div className="p-4 border-b border-border custom-scrollbar">
  //               <div className="flex items-center justify-between mb-3">
  //                 <h2 className="text-lg font-semibold">Problem</h2>
  //                 <button
  //                   onClick={() => setIsSidebarOpen(false)}
  //                   className="p-1 rounded hover:bg-secondary transition-colors"
  //                 >
  //                   <X className="h-4 w-4" />
  //                 </button>
  //               </div>

  //               <Separator />

  //               {/* Connected Users */}
  //               <div>
  //                 <h4 className="text-sm font-semibold text-muted-foreground my-3">Connected Users</h4>
  //                 <div className="space-y-2">
  //                   {clients.map((client) => (
  //                     <Client
  //                       key={client.socketId}
  //                       username={client.username}
  //                     />
  //                   ))}
  //                 </div>
  //               </div>
  //             </div>



  //             <div
  //               className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar"
  //               style={{
  //                 scrollbarWidth: 'none',
  //                 msOverflowStyle: 'none'
  //               }}
  //             >




  //               <div>
  //                 <h3 className="text-xl font-bold text-primary mb-3">{questionData.title}</h3>
  //                 <p className="text-sm text-foreground leading-relaxed">{questionData.description}</p>
  //               </div>

  //               <div>
  //                 <h4 className="text-sm font-semibold text-muted-foreground mb-3">Examples</h4>
  //                 <div className="space-y-4">
  //                   {questionData.examples.map((example, index) => (
  //                     <div key={index} className="bg-secondary/30 rounded-lg p-3">
  //                       <div className="space-y-2">
  //                         <div>
  //                           <span className="text-xs font-medium text-muted-foreground">Input:</span>
  //                           <code className="block bg-secondary/50 p-2 rounded text-sm font-mono mt-1">
  //                             {example.input}
  //                           </code>
  //                         </div>
  //                         <div>
  //                           <span className="text-xs font-medium text-muted-foreground">Output:</span>
  //                           <code className="block bg-secondary/50 p-2 rounded text-sm font-mono mt-1">
  //                             {example.output}
  //                           </code>
  //                         </div>
  //                         <div>
  //                           <span className="text-xs font-medium text-muted-foreground">Explanation:</span>
  //                           <p className="text-xs text-foreground mt-1">{example.explanation}</p>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   ))}
  //                 </div>
  //               </div>

  //               <div>
  //                 <h4 className="text-sm font-semibold text-muted-foreground mb-3">Constraints</h4>
  //                 <ul className="space-y-1">
  //                   {questionData.constraints.map((constraint, index) => (
  //                     <li key={index} className="text-sm text-foreground">
  //                       <span className="text-primary mr-2">•</span>
  //                       <code className="font-mono">{constraint}</code>
  //                     </li>
  //                   ))}
  //                 </ul>
  //               </div>
  //             </div>
  //           </motion.div>
  //         )}
  //       </AnimatePresence>

  //       {/* Main Editor Area */}
  //       <div className="flex-1 flex flex-col">
  //         {/* Header */}
  //         <motion.header
  //           initial={{ y: -50, opacity: 0 }}
  //           animate={{ y: 0, opacity: 1 }}
  //           className="bg-card border-b border-border p-4"
  //         >
  //           <div className="flex items-center justify-between">
  //             <div className="flex items-center space-x-4">
  //               {!isSidebarOpen && (
  //                 <motion.button
  //                   whileHover={{ scale: 1.05 }}
  //                   whileTap={{ scale: 0.95 }}
  //                   onClick={() => setIsSidebarOpen(true)}
  //                   className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
  //                 >
  //                   <Menu className="h-4 w-4" />
  //                 </motion.button>
  //               )}

  //               <motion.button
  //                 whileHover={{ scale: 1.05 }}
  //                 whileTap={{ scale: 0.95 }}
  //                 onClick={onNavigateToHome}
  //                 className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
  //               >
  //                 <ArrowLeft className="h-4 w-4" />
  //               </motion.button>

  //               <div className="flex items-center space-x-2">
  //                 <Code2 className="h-5 w-5 text-primary" />
  //                 <h1 className="text-lg font-semibold">AlgoSync Code Editor</h1>
  //               </div>
  //             </div>

  //             <div className="flex items-center space-x-4">
  //               {/* Font Size Controls */}
  //               <div className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-1">
  //                 <Button
  //                   variant="ghost"
  //                   size="sm"
  //                   onClick={decreaseFontSize}
  //                   className="h-8 w-8 p-0"
  //                 >
  //                   <Minus className="h-3 w-3" />
  //                 </Button>
  //                 <span className="text-xs font-mono min-w-[2rem] text-center">{fontSize}px</span>
  //                 <Button
  //                   variant="ghost"
  //                   size="sm"
  //                   onClick={increaseFontSize}
  //                   className="h-8 w-8 p-0"
  //                 >
  //                   <Plus className="h-3 w-3" />
  //                 </Button>
  //               </div>

  //               <div className="flex items-center space-x-2 text-sm text-muted-foreground">
  //                 <Users className="h-4 w-4" />
  //                 <span>{roomData.username}</span>
  //                 <span className="text-primary font-mono">#{roomData.roomId}</span>
  //               </div>

  //               <motion.div
  //                 whileHover={{ scale: 1.02 }}
  //                 whileTap={{ scale: 0.98 }}
  //               >
  //                 <Button
  //                   onClick={executeCode}
  //                   disabled={isRunning}
  //                   className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent-glow"
  //                 >
  //                   <Play className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
  //                   {isRunning ? 'Running...' : 'Run Code'}
  //                 </Button>
  //               </motion.div>

  //               {/* Action Buttons */}
  //               <div className="flex items-center space-x-2">
  //                 <Button
  //                   onClick={copyRoomId}
  //                   variant="outline"
  //                   size="sm"
  //                   className="h-9"
  //                 >
  //                   <Copy className="h-4 w-4 mr-2" />
  //                   Copy Room ID
  //                 </Button>
  //                 <Button
  //                   onClick={onNavigateToHome}
  //                   variant="destructive"
  //                   size="sm"
  //                   className="h-9"
  //                 >
  //                   <LogOut className="h-4 w-4 mr-2" />
  //                   Leave Room
  //                 </Button>
  //               </div>
  //             </div>
  //           </div>
  //         </motion.header>

  //         {/* Language Selector */}
  //         <motion.div
  //           initial={{ y: -20, opacity: 0 }}
  //           animate={{ y: 0, opacity: 1 }}
  //           transition={{ delay: 0.1 }}
  //           className="bg-card border-b border-border p-3"
  //         >
  //           <div className="flex items-center space-x-4">
  //             <span className="text-sm font-medium text-muted-foreground">Language:</span>
  //             <div className="relative">
  //               <motion.button
  //                 whileHover={{ scale: 1.02 }}
  //                 whileTap={{ scale: 0.98 }}
  //                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
  //                 className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg transition-colors"
  //               >
  //                 <span className="text-sm font-medium">
  //                   {languages.find(lang => lang.id === selectedLanguage)?.name}
  //                 </span>
  //                 <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
  //               </motion.button>

  //               <AnimatePresence>
  //                 {isDropdownOpen && (
  //                   <motion.div
  //                     initial={{ opacity: 0, y: -10, scale: 0.95 }}
  //                     animate={{ opacity: 1, y: 0, scale: 1 }}
  //                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
  //                     transition={{ duration: 0.15 }}
  //                     className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50"
  //                   >
  //                     <div className="p-1">
  //                       {languages.map((language) => (
  //                         <button
  //                           key={language.id}
  //                           onClick={() => handleLanguageChange(language.id)}
  //                           className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${selectedLanguage === language.id
  //                               ? 'bg-primary text-primary-foreground'
  //                               : 'hover:bg-secondary'
  //                             }`}
  //                         >
  //                           {language.name}
  //                         </button>
  //                       ))}
  //                     </div>
  //                   </motion.div>
  //                 )}
  //               </AnimatePresence>
  //             </div>
  //           </div>
  //         </motion.div>

  //         {/* Editor Container */}
  //         <div className="flex-1 flex flex-col overflow-hidden">
  //           {/* Code Editor */}
  //           <motion.div
  //             initial={{ opacity: 0, scale: 0.95 }}
  //             animate={{ opacity: 1, scale: 1 }}
  //             transition={{ delay: 0.2 }}
  //             className="flex-1 bg-editor-bg border-b border-editor-border"
  //           >
  //             <MonacoEditor
  //               height="100%"
  //               language={languages.find(lang => lang.id === selectedLanguage)?.monaco || "javascript"}
  //               value={code}
  //               onChange={handleCodeChange}
  //               onMount={handleEditorDidMount}
  //               theme="vs-dark"
  //               options={{
  //                 fontSize: fontSize,
  //                 fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
  //                 lineNumbers: 'on',
  //                 minimap: { enabled: false },
  //                 scrollBeyondLastLine: false,
  //                 automaticLayout: true,
  //                 wordWrap: 'on',
  //                 tabSize: 2,
  //                 insertSpaces: true,
  //                 detectIndentation: false,
  //               }}
  //             />
  //           </motion.div>

  //           {/* Output Panel */}
  //           <AnimatePresence>
  //             {isOutputVisible && (
  //               <motion.div
  //                 initial={{ height: 0, opacity: 0 }}
  //                 animate={{ height: '100%', opacity: 1 }}
  //                 exit={{ height: 0, opacity: 0 }}
  //                 transition={{ duration: 0.3, ease: "easeInOut" }}
  //                 className="bg-output-bg border-t border-border"
  //               >
  //                 <div className="p-4 space-y-3 h-52">
  //                   <div className="flex items-center justify-between">
  //                     <div className="flex items-center space-x-2">
  //                       <Terminal className="h-4 w-4 text-muted-foreground" />
  //                       <span className="text-sm font-medium">Output</span>
  //                     </div>
  //                     <button
  //                       onClick={() => setIsOutputVisible(false)}
  //                       className="p-1 rounded hover:bg-secondary transition-colors"
  //                     >
  //                       <ChevronDown className="h-4 w-4" />
  //                     </button>
  //                   </div>

  //                   <Separator />

  //                   <div className="bg-secondary/30 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
  //                     <pre className="text-sm font-mono whitespace-pre-wrap">
  //                       {output ? formatOutput(output) : 'No output yet. Run your code to see results here.'}
  //                     </pre>
  //                   </div>
  //                 </div>
  //               </motion.div>
  //             )}
  //           </AnimatePresence>

  //           {/* Output Toggle Button (when hidden) */}
  //           {!isOutputVisible && output && (
  //             <motion.div
  //               initial={{ opacity: 0 }}
  //               animate={{ opacity: 1 }}
  //               className="bg-output-bg border-t border-border p-2"
  //             >
  //               <button
  //                 onClick={() => setIsOutputVisible(true)}
  //                 className="w-full flex items-center justify-center space-x-2 p-2 rounded hover:bg-secondary/50 transition-colors text-sm text-muted-foreground"
  //               >
  //                 <ChevronUp className="h-4 w-4" />
  //                 <span>Show Output</span>
  //               </button>
  //             </motion.div>
  //           )}
  //         </div>

  //         {/* Status Bar */}
  //         <motion.footer
  //           initial={{ y: 50, opacity: 0 }}
  //           animate={{ y: 0, opacity: 1 }}
  //           transition={{ delay: 0.3 }}
  //           className="bg-card border-t border-border p-2 text-xs text-muted-foreground"
  //         >
  //           <div className="flex items-center justify-between">
  //             <span>{languages.find(lang => lang.id === selectedLanguage)?.name} • Ready</span>
  //             <span className="text-primary">Sharing Mode</span>
  //           </div>
  //         </motion.footer>
  //       </div>
  //     </div>
  //   );
  // };


  return (
    <div className="h-screen bg-background">
      <PanelGroup direction="horizontal" autoSaveId="algosync-editor-layout-v1" className="h-full">
        {/* collapsible left panel (collapsedSize 0 hides it) */}
        <Panel
          defaultSize={30}
          minSize={12}
          maxSize={60}
          collapsible
          collapsedSize={0}
        >
          <div className="h-full bg-card border-r border-border flex flex-col">
            <div className="p-4 border-b border-border custom-scrollbar">

              {/* Connected Users */}
              <div>
                <h4 className="text-md font-semibold text-muted-foreground my-3">Connected Users</h4>
                <div className="space-y-2">
                  {clients.map((client) => (
                    <Client
                      key={client.socketId}
                      username={client.username}
                    />
                  ))}
                </div>
              </div>
            </div>



            <div
              className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >


              {/* Question Data */}

              <div>
                <h3 className="text-xl font-bold text-primary mb-3">{question?.title}</h3>
                <p className="text-md text-foreground leading-relaxed">{question?.description}</p>
                
                {/* Difficulty and Tags */}
                <div className="flex flex-wrap gap-2 my-4 items-center">
                  {/* Difficulty Badge */}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${question?.difficulty === "Easy"
                        ? "bg-green-500/20 text-green-400"
                        : question?.difficulty === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                  >
                    {question?.difficulty || "No Question"}
                  </span>

                  {/* Topic Tags */}
                  {question?.topicTags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Examples</h4>
                <div className="space-y-4">
                  {question?.examples.map((example, index) => (
                    <div key={index} className="bg-secondary/30 rounded-lg p-3">
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Input:</span>
                          <code className="block bg-secondary/50 p-2 rounded text-sm font-mono mt-1">
                            {example.input}
                          </code>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Output:</span>
                          <code className="block bg-secondary/50 p-2 rounded text-sm font-mono mt-1">
                            {example.output}
                          </code>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Explanation:</span>
                          <p className="text-xs text-foreground mt-1">{example.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Constraints</h4>
                <ul className="space-y-1">
                  {question?.constraints.map((constraint, index) => (
                    <li key={index} className="text-sm text-foreground">
                      <span className="text-primary mr-2">•</span>
                      <code className="font-mono">{constraint}</code>
                    </li>
                  ))}
                </ul>
              </div>


            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="flex hover:bg-cyan-300/70 items-center justify-center w-1 cursor-col-resize">
          <div className="h-8 w-[5px] bg-sky-800" />
        </PanelResizeHandle>


        <Panel>

          <PanelGroup direction="vertical" autoSaveId="algosync-editor-right-vsplit" className="h-full">

            {/* === Top: Editor area === */}
            <Panel defaultSize={70} minSize={40}>
              <div className="h-full flex flex-col">
                {/* Header, Language selector, MonacoEditor, etc. */}
                <motion.header
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-card border-b border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {!isSidebarOpen && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsSidebarOpen(true)}
                          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <Menu className="h-4 w-4" />
                        </motion.button>
                      )}

                      <div className="flex items-center space-x-2">
                        {/* Show on all screens */}
                        <img
                          src="/favicon.ico"
                          alt="AlgoSync Logo"
                          title="Go back to Home Page"
                          className="h-6 w-6 object-contain"
                          onClick={onNavigateToHome}
                        />

                        {/* Hide on mobile, show from md (tablet) upwards */}
                        <h1 className="hidden md:block text-lg font-semibold">
                          AlgoSync Code Editor
                        </h1>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">


                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{roomData.username}</span>
                        <span className="text-primary font-mono">#{roomData.roomId}</span>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => {
                            executeCode();
                            toggleOutputPanel(false);
                          }}
                          disabled={isRunning}
                          className="bg-neutral-700 text-white font-semibold px-4 py-2 rounded-md hover:bg-neutral-600"
                        >
                          {/* <Play className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} /> */}
                          {isRunning ? 'Running...' : 'Run Code'}
                        </Button>
                      </motion.div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={copyRoomId}
                          variant="outline"
                          size="sm"
                          className="h-9 py-4 mr-2"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Room ID
                        </Button>
                        <Button
                          onClick={onNavigateToHome}
                          variant="destructive"
                          size="sm"
                          className="h-9"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.header>

                {/* Language Selector */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border-b border-border p-3"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-muted-foreground">Language :</span>
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg transition-colors"
                      >
                        <span className="text-sm font-medium">
                          {languages.find(lang => lang.id === selectedLanguage)?.name}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </motion.button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50"
                          >
                            <div className="p-1">
                              {languages.map((language) => (
                                <button
                                  key={language.id}
                                  onClick={() => handleLanguageChange(language.id)}
                                  className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${selectedLanguage === language.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-secondary'
                                    }`}
                                >
                                  {language.name}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* Font Size Controls */}
                    <div className="flex items-center space-x-2 bg-secondary/50 rounded-lg ">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={decreaseFontSize}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-mono min-w-[2rem] text-center">{fontSize}px</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={increaseFontSize}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Editor Container */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Code Editor */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 bg-editor-bg border-b border-editor-border"
                  >
                    <MonacoEditor
                      height="100%"
                      language={languages.find(lang => lang.id === selectedLanguage)?.monaco || "java"}
                      value={code}
                      onChange={handleCodeChange}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      options={{
                        fontSize: fontSize,
                        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                        lineNumbers: 'on',
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                        tabSize: 4,
                        insertSpaces: true,
                        detectIndentation: false
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </Panel>

            {/* Resize handle between editor & output */}
            <PanelResizeHandle className="flex hover:bg-cyan-300/70 items-center justify-center h-1 cursor-col-resize">
              <div className="h-8 w-[40px] bg-sky-800" />
            </PanelResizeHandle>

            {/* === Bottom: Output area === */}
            <Panel ref={outputPanelRef} defaultSize={30} minSize={0} collapsible collapsedSize={0}>
              <div className="h-full bg-output-bg border-t border-border">
                {/* Put your output terminal / AnimatePresence stuff here */}

                {/* Output Panel */}
                <AnimatePresence>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '100%', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-output-bg border-t border-border"
                  >
                    <div className="p-4 space-y-3 h-52">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Terminal className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Output</span>
                        </div>
                        <button
                          onClick={toggleOutputPanel}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                          <ChevronDown className="h-5 w-5" />
                        </button>
                      </div>

                      <Separator />

                      <div className="bg-secondary/30 rounded-lg p-3 overflow-y-auto max-h-96 scrollbar-hide">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                          {output ? formatOutput(output) : 'No output yet. Run your code to see results here.'}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

              </div>
            </Panel>

            {/* Status Bar */}
            <motion.footer
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card border-t border-border p-2 text-xs text-muted-foreground"
            >
              <div className="flex items-center justify-between">
                <span>{languages.find(lang => lang.id === selectedLanguage)?.name} • Ready</span>
                <button
                  onClick={toggleOutputPanel}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <span className="text-primary">Sharing Mode</span>
              </div>
            </motion.footer>

          </PanelGroup>
        </Panel>



      </PanelGroup >
    </div >
  );

};

export default Editor;