import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Code2, Users, Zap } from "lucide-react";

const Home = ({ onNavigateToEditor }) => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleJoinRoom = () => {
    if (roomId.trim() && username.trim()) {
      onNavigateToEditor(roomId.trim(), username.trim());
    }
  };

  const handleCreateRoom = () => {
    if (username.trim()) {
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      onNavigateToEditor(newRoomId, username.trim());
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Code2 className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CollabSpark
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Real-time collaborative code editor
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Card className="p-8 bg-gradient-card border-border/50 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  onKeyPress={(e) => e.key === 'Enter' && roomId && handleJoinRoom()}
                />
              </div>

              {/* Room ID Input */}
              <div className="space-y-2">
                <label htmlFor="roomId" className="text-sm font-medium text-foreground">
                  Room ID (optional)
                </label>
                <Input
                  id="roomId"
                  placeholder="Enter room ID to join"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  onKeyPress={(e) => e.key === 'Enter' && roomId && handleJoinRoom()}
                />
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!roomId.trim() || !username.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow disabled:opacity-50 disabled:shadow-none"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join Room
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!username.trim()}
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-accent-glow disabled:opacity-50 disabled:shadow-none"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Create New Room
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto bg-secondary rounded-lg flex items-center justify-center">
              <Code2 className="h-4 w-4 text-secondary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Monaco Editor</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto bg-secondary rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-secondary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Live Execution</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto bg-secondary rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-secondary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Collaborative</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;