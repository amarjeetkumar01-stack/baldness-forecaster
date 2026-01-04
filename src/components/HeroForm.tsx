import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingMessages } from "./LoadingMessages";

interface HeroFormProps {
  onAnalyze: (username: string) => void;
  isLoading: boolean;
}

export function HeroForm({ onAnalyze, isLoading }: HeroFormProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onAnalyze(username.trim().replace("@", ""));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 px-4">
      {/* Hero Text */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
          <span className="gradient-text">Baldness</span>
          <br />
          <span>Predictor</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Enter any X username and see the baldness future 👀
        </p>
      </div>

      {/* Form */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
          </div>
          <LoadingMessages />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter X username (without @)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 pl-12 pr-4 text-lg rounded-2xl border-2 focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-lg rounded-2xl font-semibold animate-pulse-glow"
            disabled={!username.trim() || isLoading}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Analyze
          </Button>
        </form>
      )}
    </div>
  );
}
