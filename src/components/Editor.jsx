import { useState, useRef } from "react";
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
  X
} from "lucide-react";

const Editor = ({ roomData, onNavigateToHome }) => {
  const [code, setCode] = useState(`// Welcome to AlgoSync!
// Write your code here and click Run to execute

console.log("Hello, AlgoSync!");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci of 10:", fibonacci(10));

// Try writing your own code!
`);
  const [output, setOutput] = useState("");
  const [isOutputVisible, setIsOutputVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const editorRef = useRef(null);

  const languages = [
    { id: "javascript", name: "JavaScript", monaco: "javascript" },
    { id: "python", name: "Python", monaco: "python" },
    { id: "java", name: "Java", monaco: "java" },
    { id: "cpp", name: "C++", monaco: "cpp" }
  ];

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

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Set Monaco editor theme to dark
    editor.updateOptions({
      theme: 'vs-dark',
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });
  };

  const captureConsole = () => {
    const logs = [];
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    console.log = (...args) => {
      logs.push({ type: 'log', args });
      originalConsole.log(...args);
    };

    console.error = (...args) => {
      logs.push({ type: 'error', args });
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      logs.push({ type: 'warn', args });
      originalConsole.warn(...args);
    };

    console.info = (...args) => {
      logs.push({ type: 'info', args });
      originalConsole.info(...args);
    };

    return { logs, restore: () => Object.assign(console, originalConsole) };
  };

  const executeCode = async () => {
    setIsRunning(true);
    const { logs, restore } = captureConsole();
    
    try {
      // Clear previous output
      setOutput("");
      setIsOutputVisible(true);
      
      // Execute the code with a timeout
      const asyncWrapper = `
        (async () => {
          ${code}
        })();
      `;
      
      // Use eval to execute the code
      eval(asyncWrapper);
      
      // Wait a bit for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Format the output
      const formattedOutput = logs.map(log => {
        const args = log.args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');
        
        return { type: log.type, message: args };
      });
      
      if (formattedOutput.length === 0) {
        setOutput("Code executed successfully (no output)");
      } else {
        setOutput(formattedOutput);
      }
      
    } catch (error) {
      setOutput([{ type: 'error', message: `Error: ${error.message}` }]);
    } finally {
      restore();
      setIsRunning(false);
    }
  };

  const formatOutput = (output) => {
    if (typeof output === 'string') {
      return output;
    }
    
    return output.map((log, index) => (
      <div key={index} className={`mb-1 ${
        log.type === 'error' ? 'text-error' : 
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
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-80 bg-card border-r border-border flex flex-col"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Problem</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">{questionData.title}</h3>
                <p className="text-sm text-foreground leading-relaxed">{questionData.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Examples</h4>
                <div className="space-y-4">
                  {questionData.examples.map((example, index) => (
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
                  {questionData.constraints.map((constraint, index) => (
                    <li key={index} className="text-sm text-foreground">
                      <span className="text-primary mr-2">•</span>
                      <code className="font-mono">{constraint}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateToHome}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </motion.button>
              
              <div className="flex items-center space-x-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">AlgoSync Code Editor</h1>
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
                  onClick={executeCode}
                  disabled={isRunning}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent-glow"
                >
                  <Play className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
              </motion.div>
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
            <span className="text-sm font-medium text-muted-foreground">Language:</span>
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
                          onClick={() => {
                            setSelectedLanguage(language.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                            selectedLanguage === language.id 
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
              language={languages.find(lang => lang.id === selectedLanguage)?.monaco || "javascript"}
              value={code}
              onChange={setCode}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 2,
                insertSpaces: true,
                detectIndentation: false,
              }}
            />
          </motion.div>

          {/* Output Panel */}
          <AnimatePresence>
            {isOutputVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-output-bg border-t border-border"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Terminal className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Output</span>
                    </div>
                    <button
                      onClick={() => setIsOutputVisible(false)}
                      className="p-1 rounded hover:bg-secondary transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-secondary/30 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {output ? formatOutput(output) : 'No output yet. Run your code to see results here.'}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Output Toggle Button (when hidden) */}
          {!isOutputVisible && output && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-output-bg border-t border-border p-2"
            >
              <button
                onClick={() => setIsOutputVisible(true)}
                className="w-full flex items-center justify-center space-x-2 p-2 rounded hover:bg-secondary/50 transition-colors text-sm text-muted-foreground"
              >
                <ChevronUp className="h-4 w-4" />
                <span>Show Output</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Status Bar */}
        <motion.footer 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card border-t border-border p-2 text-xs text-muted-foreground"
        >
          <div className="flex items-center justify-between">
            <span>{languages.find(lang => lang.id === selectedLanguage)?.name} • Ready</span>
            <span className="text-primary">Sharing Mode (Frontend Only)</span>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Editor;