import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroForm } from "@/components/HeroForm";
import { Results, PredictionResult } from "@/components/Results";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (username: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-baldness", {
        body: { username },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze this profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen grid-background relative">
      {/* Header */}
      <header className="absolute top-0 right-0 p-4 sm:p-6">
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center justify-center py-20">
        {result ? (
          <Results result={result} onReset={handleReset} />
        ) : (
          <HeroForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground opacity-50">
        Made for fun 🎉 Not medical advice
      </footer>
    </div>
  );
};

export default Index;
