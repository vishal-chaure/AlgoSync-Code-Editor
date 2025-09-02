// Compiler service for Java and C++ support
export const compileAndRun = async (code, language) => {
  try {
    switch (language) {
      case 'java':
        return await compileJava(code);
      case 'cpp':
        return await compileCpp(code);
      case 'javascript':
        return await runJavaScript(code);
      case 'python':
        return await runPython(code);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  } catch (error) {
    return {
      success: false,
      output: `Compilation Error: ${error.message}`,
      error: true
    };
  }
};

const compileJava = async (code) => {
  try {
    // For now, we'll use a simple approach
    // In production, you'd want to use a proper Java compiler service
    if (!code.includes('public class Main')) {
      return {
        success: false,
        output: 'Java code must contain a public class named "Main"',
        error: true
      };
    }
    
    // Extract the class name from the code
    const classNameMatch = code.match(/public class (\w+)/);
    if (!classNameMatch) {
      return {
        success: false,
        output: 'Java code must contain a public class',
        error: true
      };
    }
    
    const className = classNameMatch[1];
    
    // Check if main method exists
    if (!code.includes('public static void main(String[] args)')) {
      return {
        success: false,
        output: 'Java code must contain a main method: public static void main(String[] args)',
        error: true
      };
    }
    
    // For demo purposes, we'll simulate compilation
    // In a real implementation, you'd send this to a Java compiler service
    return {
      success: true,
      output: `Java code compiled successfully!\nClass: ${className}\n\nNote: This is a demo. In production, code would be compiled and executed on a server.`,
      className: className
    };
  } catch (error) {
    return {
      success: false,
      output: `Java compilation error: ${error.message}`,
      error: true
    };
  }
};

const compileCpp = async (code) => {
  try {
    // Check if main function exists
    if (!code.includes('int main()') && !code.includes('void main()')) {
      return {
        success: false,
        output: 'C++ code must contain a main function: int main() or void main()',
        error: true
      };
    }
    
    // Check for basic C++ syntax
    if (!code.includes('#include')) {
      return {
        success: false,
        output: 'C++ code should include necessary headers (e.g., #include <iostream>)',
        error: true
      };
    }
    
    // For demo purposes, we'll simulate compilation
    return {
      success: true,
      output: `C++ code compiled successfully!\n\nNote: This is a demo. In production, code would be compiled and executed on a server.`,
    };
  } catch (error) {
    return {
      success: false,
      output: `C++ compilation error: ${error.message}`,
      error: true
    };
  }
};

const runJavaScript = async (code) => {
  try {
    // Capture console output
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

    // Execute the code
    const asyncWrapper = `
      (async () => {
        ${code}
      })();
    `;
    
    eval(asyncWrapper);
    
    // Wait a bit for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Restore console
    Object.assign(console, originalConsole);
    
    // Format output
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
      return {
        success: true,
        output: "Code executed successfully (no output)"
      };
    }
    
    return {
      success: true,
      output: formattedOutput
    };
  } catch (error) {
    return {
      success: false,
      output: `JavaScript execution error: ${error.message}`,
      error: true
    };
  }
};

const runPython = async (code) => {
  try {
    // For demo purposes, we'll simulate Python execution
    // In production, you'd send this to a Python interpreter service
    if (!code.includes('print(')) {
      return {
        success: true,
        output: "Python code executed successfully (no output)"
      };
    }
    
    return {
      success: true,
      output: `Python code executed successfully!\n\nNote: This is a demo. In production, code would be executed on a Python interpreter server.`,
    };
  } catch (error) {
    return {
      success: false,
      output: `Python execution error: ${error.message}`,
      error: true
    };
  }
};
