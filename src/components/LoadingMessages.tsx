import { useState, useEffect } from "react";

const messages = [
  "Scanning hairline... 🔍",
  "Analyzing follicle density... 💇",
  "Checking genetic patterns... 🧬",
  "Consulting the bald oracle... 🔮",
  "Measuring stress levels from bio... 😅",
  "Detecting hustle culture vibes... 💼",
  "Calculating gym-bro quotient... 💪",
  "Processing coffee addiction data... ☕",
  "Estimating DHT exposure... 🧪",
  "Running advanced hair algorithms... 🤖",
];

export function LoadingMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-muted-foreground text-lg animate-pulse">
      {messages[currentIndex]}
    </p>
  );
}
