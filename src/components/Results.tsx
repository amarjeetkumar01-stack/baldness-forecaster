import { User, TrendingUp, AlertCircle, Share2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultCard } from "./ResultCard";
import { ProgressBar } from "./ProgressBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface PredictionResult {
  username: string;
  profileImage: string;
  displayName: string;
  currentStatus: "bald" | "not_bald" | "unclear";
  currentStatusReason: string;
  futureChance: number;
  futureReason: string;
  timeframe: string;
}

interface ResultsProps {
  result: PredictionResult;
  onReset: () => void;
}

export function Results({ result, onReset }: ResultsProps) {
  const statusDisplay = {
    bald: { text: "Yes 👨‍🦲", color: "text-red-500" },
    not_bald: { text: "No 💇", color: "text-green-500" },
    unclear: { text: "Unclear 🤔", color: "text-yellow-500" },
  };

  const handleShare = () => {
    const text = `🔮 My baldness prediction from @${result.username}:\n\nCurrent: ${statusDisplay[result.currentStatus].text}\nFuture chance: ${result.futureChance}% in ${result.timeframe}\n\nCheck your fate 👉`;
    const url = window.location.origin;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 px-4">
      {/* Profile Card */}
      <ResultCard
        title="Profile"
        icon={<User className="h-5 w-5 text-primary" />}
        delay={0}
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={result.profileImage} alt={result.displayName} />
            <AvatarFallback>{result.displayName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{result.displayName}</p>
            <p className="text-muted-foreground">@{result.username}</p>
          </div>
        </div>
      </ResultCard>

      {/* Current Status Card */}
      <ResultCard
        title="Current Status"
        icon={<AlertCircle className="h-5 w-5 text-primary" />}
        delay={200}
      >
        <div className="space-y-2">
          <p className="text-3xl font-bold">
            Bald:{" "}
            <span className={statusDisplay[result.currentStatus].color}>
              {statusDisplay[result.currentStatus].text}
            </span>
          </p>
          <p className="text-muted-foreground">{result.currentStatusReason}</p>
        </div>
      </ResultCard>

      {/* Future Probability Card */}
      <ResultCard
        title="Future Balding Chance"
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        delay={400}
      >
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold gradient-text">
              {result.futureChance}%
            </span>
            <span className="text-muted-foreground text-sm">
              chance by {result.timeframe}
            </span>
          </div>
          <ProgressBar value={result.futureChance} />
          <p className="text-muted-foreground">{result.futureReason}</p>
        </div>
      </ResultCard>

      {/* Disclaimer */}
      <p className="text-center text-sm text-muted-foreground opacity-70 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
        ⚠️ This is an AI-based fun prediction, not medical advice. We can't
        actually see the future... or can we? 👀
      </p>

      {/* Action Buttons */}
      <div
        className="flex flex-col sm:flex-row gap-3 pt-4 animate-fade-in-up"
        style={{ animationDelay: "800ms" }}
      >
        <Button onClick={onReset} variant="outline" className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Another Username
        </Button>
        <Button onClick={handleShare} className="flex-1 gap-2">
          <Share2 className="h-4 w-4" />
          Share on X
        </Button>
      </div>
    </div>
  );
}
