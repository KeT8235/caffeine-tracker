import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Sparkles, Coffee, ChevronLeft, Heart } from "lucide-react";
import { motion } from "motion/react";

interface RecommendationScreenProps {
  onBack: () => void;
}

export function RecommendationScreen({ onBack }: RecommendationScreenProps) {
  const recommendations = [
    {
      id: 1,
      drink: "Americano",
      dessert: "Almond Croissant",
      brand: "Starbucks",
      caffeine: 75,
      calories: 280,
      description:
        "Based on your caffeine level, this buttery almond croissant pairs perfectly with a strong Americano.",
      image:
        "https://images.unsplash.com/photo-1669872484166-e11b9638b50e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWVyaWNhbm8lMjBjb2ZmZWV8ZW58MXx8fHwxNzYxNDYwNDI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      matchScore: 95,
    },
    {
      id: 2,
      drink: "Caffe Latte",
      dessert: "Blueberry Muffin",
      brand: "Compose Coffee",
      caffeine: 45,
      calories: 320,
      description:
        "A smooth latte complements the sweetness of a fresh blueberry muffin perfectly.",
      image:
        "https://images.unsplash.com/photo-1653038546605-4272fca89266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXAlMjBtaW5pbWFsfGVufDF8fHx8MTc2MTQ1MjQ1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      matchScore: 88,
    },
    {
      id: 3,
      drink: "Cappuccino",
      dessert: "Chocolate Chip Cookie",
      brand: "Mega Coffee",
      caffeine: 60,
      calories: 240,
      description:
        "The rich foam of a cappuccino balances beautifully with a warm chocolate chip cookie.",
      image:
        "https://images.unsplash.com/photo-1643733029149-f5b72338c7bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNzZXJ0JTIwcGFzdHJ5fGVufDF8fHx8MTc2MTUyNTM3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      matchScore: 92,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-6 pt-6 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onBack}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </motion.div>

          <h1 className="text-[24px]">AI 추천</h1>

          <div className="w-10" />
        </div>

        <div className="flex items-center space-x-2 mt-3 px-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            카페인 섭취량 기반 맞춤 페어링
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden bg-card hover:shadow-lg transition-all">
              <div className="flex flex-col">
                {/* Image */}
                <div className="relative h-48 bg-secondary/20">
                  <ImageWithFallback
                    src={rec.image}
                    alt={rec.drink}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-card/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs">{rec.matchScore}% Match</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Coffee className="w-4 h-4 text-primary" />
                        <h3 className="text-[18px]">{rec.drink}</h3>
                      </div>
                      <p className="text-primary text-sm">+ {rec.dessert}</p>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full -mt-1"
                      >
                        <Heart className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </motion.div>
                  </div>

                  {/* AI Rationale with muted styling */}
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "#8B7355", opacity: 0.85 }}
                  >
                    {rec.description}
                  </p>

                  <div className="flex items-center space-x-2 flex-wrap">
                    <Badge variant="secondary" className="rounded-full">
                      {rec.brand}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full bg-primary/5 text-primary border-primary/20"
                    >
                      {rec.caffeine}mg caffeine
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {rec.calories} cal
                    </Badge>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90">
                      Add to Today's Intake
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* AI Coach Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/10">
            <div className="flex items-start space-x-3">
              <div className="bg-primary rounded-full p-2">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="text-primary">AI Coach Tip:</span> You're at
                  60% of your daily limit. Consider these lighter options to
                  stay within your healthy range!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="h-6" />
      </div>
    </div>
  );
}
