import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Trophy,
  Gift,
  Ticket,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { shopAPI } from "@/lib/api";

interface ShopScreenProps {
  onBack: () => void;
}

interface ShopItem {
  item_id: number;
  item_name: string;
  description: string;
  item_type: "GIFTCARD" | "RAFFLE";
  price: number;
  stock?: number | null;
  icon: string;
  brand?: string | null;
}

interface PurchaseHistory {
  purchase_id: number;
  item_name: string;
  item_type: string;
  price: number;
  purchased_at: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
}

export function ShopScreen({ onBack }: ShopScreenProps) {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<"shop" | "history">("shop");

  // 더미 상점 아이템 데이터
  const dummyShopItems: ShopItem[] = [
    {
      item_id: 0,
      item_name: "테스트 쿠폰 (1P)",
      description: "테스트용 1포인트 쿠폰입니다. 구매 테스트에 사용하세요!",
      item_type: "GIFTCARD",
      price: 1,
      stock: 999,
      icon: "ticket",
      brand: "테스트",
    },
    {
      item_id: 1,
      item_name: "스타벅스 5,000원 기프트카드",
      description: "스타벅스에서 사용 가능한 5,000원 기프트카드입니다.",
      item_type: "GIFTCARD",
      price: 50,
      stock: 10,
      icon: "coffee",
      brand: "스타벅스",
    },
    {
      item_id: 2,
      item_name: "스타벅스 10,000원 기프트카드",
      description: "스타벅스에서 사용 가능한 10,000원 기프트카드입니다.",
      item_type: "GIFTCARD",
      price: 100,
      stock: 5,
      icon: "coffee",
      brand: "스타벅스",
    },
    {
      item_id: 3,
      item_name: "메가커피 3,000원 기프트카드",
      description: "메가커피에서 사용 가능한 3,000원 기프트카드입니다.",
      item_type: "GIFTCARD",
      price: 30,
      stock: 15,
      icon: "coffee",
      brand: "메가커피",
    },
    {
      item_id: 4,
      item_name: "컴포즈커피 3,000원 기프트카드",
      description: "컴포즈커피에서 사용 가능한 3,000원 기프트카드입니다.",
      item_type: "GIFTCARD",
      price: 30,
      stock: 15,
      icon: "coffee",
      brand: "컴포즈커피",
    },
    {
      item_id: 5,
      item_name: "AirPods Pro 응모권",
      description: "AirPods Pro 추첨 이벤트에 응모할 수 있는 응모권입니다. 매월 1명 추첨!",
      item_type: "RAFFLE",
      price: 200,
      stock: 100,
      icon: "star",
      brand: null,
    },
    {
      item_id: 6,
      item_name: "아이패드 응모권",
      description: "아이패드 추첨 이벤트에 응모할 수 있는 응모권입니다. 분기별 1명 추첨!",
      item_type: "RAFFLE",
      price: 500,
      stock: 50,
      icon: "diamond",
      brand: null,
    },
    {
      item_id: 7,
      item_name: "스타벅스 텀블러 응모권",
      description: "스타벅스 한정판 텀블러 추첨 이벤트 응모권입니다. 매주 3명 추첨!",
      item_type: "RAFFLE",
      price: 50,
      stock: null,
      icon: "gift",
      brand: "스타벅스",
    },
  ];

  // 상점 데이터 로드
  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      setIsLoading(true);
      // 더미 아이템 설정
      setShopItems(dummyShopItems);
      
      // 현재 포인트만 API에서 가져오기
      const response = await shopAPI.getCurrentPoints();
      setCurrentPoints(response.currentPoints);
      
      // 구매 내역은 로컬 스토리지에서 가져오기
      const savedHistory = localStorage.getItem('purchase_history');
      if (savedHistory) {
        setPurchaseHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load shop data:", error);
      // 에러 시 기본값 사용
      setShopItems(dummyShopItems);
      setCurrentPoints(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 아이템 구매
  const handlePurchase = async (itemId: number) => {
    if (!selectedItem) return;

    if (currentPoints < selectedItem.price) {
      alert("포인트가 부족합니다!");
      return;
    }

    setIsPurchasing(true);
    try {
      // 포인트 차감만 API로 처리
      await shopAPI.deductPoints(selectedItem.price);
      
      // 로컬에서 재고 차감
      setShopItems(prev => prev.map(item => 
        item.item_id === itemId && item.stock !== null && item.stock !== undefined
          ? { ...item, stock: item.stock - 1 }
          : item
      ));
      
      // 구매 내역 추가 (로컬 스토리지)
      const newPurchase: PurchaseHistory = {
        purchase_id: Date.now(),
        item_name: selectedItem.item_name,
        item_type: selectedItem.item_type,
        price: selectedItem.price,
        purchased_at: new Date().toISOString(),
        status: "COMPLETED",
      };
      
      const updatedHistory = [newPurchase, ...purchaseHistory];
      setPurchaseHistory(updatedHistory);
      localStorage.setItem('purchase_history', JSON.stringify(updatedHistory));
      
      // 포인트 업데이트
      setCurrentPoints(prev => prev - selectedItem.price);
      
      alert("구매가 완료되었습니다!");
      setSelectedItem(null);
    } catch (error: any) {
      console.error("Failed to purchase item:", error);
      alert(error.response?.data?.error || "구매에 실패했습니다.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const giftcardItems = shopItems.filter((item) => item.item_type === "GIFTCARD");
  const raffleItems = shopItems.filter((item) => item.item_type === "RAFFLE");

  const getItemIcon = (icon: string) => {
    switch (icon) {
      case "coffee":
        return "☕";
      case "gift":
        return "🎁";
      case "ticket":
        return "🎟️";
      case "star":
        return "⭐";
      case "diamond":
        return "💎";
      default:
        return "🎯";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500 text-white">완료</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500 text-white">대기중</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500 text-white">취소됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-6 pt-6 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
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

          <h1 className="text-[24px]">포인트 상점</h1>

          <div className="flex items-center space-x-1">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-[16px] font-semibold text-amber-500">{currentPoints}P</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "shop" ? "default" : "outline"}
            className="flex-1 rounded-full"
            onClick={() => setActiveTab("shop")}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            상점
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            className="flex-1 rounded-full"
            onClick={() => setActiveTab("history")}
          >
            <Ticket className="w-4 h-4 mr-2" />
            구매내역
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground mt-4">로딩 중...</p>
          </div>
        ) : activeTab === "shop" ? (
          <div className="space-y-6 mt-6">
            {/* 기프트카드 섹션 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Gift className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">기프트카드</h2>
                <span className="text-sm text-muted-foreground">({giftcardItems.length})</span>
              </div>

              {giftcardItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  현재 판매중인 기프트카드가 없습니다
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {giftcardItems.map((item, index) => (
                    <motion.div
                      key={item.item_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedItem(item)}
                      >
                        <Card className="p-4 bg-card hover:bg-secondary/20 transition-colors cursor-pointer h-full">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="text-[40px]">{getItemIcon(item.icon)}</div>
                            <h3 className="text-sm font-semibold line-clamp-2">
                              {item.item_name}
                            </h3>
                            {item.brand && (
                              <p className="text-xs text-muted-foreground">{item.brand}</p>
                            )}
                            <div className="flex items-center space-x-1 text-amber-600">
                              <Trophy className="w-4 h-4" />
                              <span className="text-sm font-bold">{item.price}P</span>
                            </div>
                            {item.stock !== undefined && item.stock !== null && item.stock <= 5 && (
                              <Badge variant="destructive" className="text-xs">
                                재고 {item.stock}개
                              </Badge>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 구분선 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-xs text-muted-foreground">•••</span>
              </div>
            </div>

            {/* 응모권 섹션 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">응모권</h2>
                <span className="text-sm text-muted-foreground">({raffleItems.length})</span>
              </div>

              {raffleItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  현재 진행중인 응모 이벤트가 없습니다
                </div>
              ) : (
                <div className="space-y-3">
                  {raffleItems.map((item, index) => (
                    <motion.div
                      key={item.item_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedItem(item)}
                      >
                        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-start space-x-4">
                            <div className="text-[40px] flex-shrink-0">
                              {getItemIcon(item.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[16px] font-semibold mb-1">
                                {item.item_name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {item.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 text-amber-600">
                                  <Trophy className="w-4 h-4" />
                                  <span className="text-sm font-bold">{item.price}P</span>
                                </div>
                                {item.stock !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.stock}명 응모 가능
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // 구매 내역 탭
          <div className="space-y-3 mt-6">
            {purchaseHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>구매 내역이 없습니다</p>
              </div>
            ) : (
              purchaseHistory.map((purchase, index) => (
                <motion.div
                  key={purchase.purchase_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-[16px] font-semibold mb-1">
                          {purchase.item_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(purchase.purchased_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {getStatusBadge(purchase.status)}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        {purchase.item_type === "GIFTCARD" ? "기프트카드" : "응모권"}
                      </span>
                      <div className="flex items-center space-x-1 text-amber-600">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-bold">{purchase.price}P</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={() => setSelectedItem(null)}
      >
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-xl">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-[48px]">{selectedItem && getItemIcon(selectedItem.icon)}</span>
              <div className="flex-1">
                <DialogTitle className="text-[20px]">
                  {selectedItem?.item_name}
                </DialogTitle>
                {selectedItem?.brand && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedItem.brand}</p>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <DialogDescription className="text-sm text-muted-foreground">
              {selectedItem?.description}
            </DialogDescription>

            {/* 가격 정보 */}
            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <span className="text-sm font-semibold">필요 포인트</span>
              <div className="flex items-center space-x-1 text-amber-600">
                <Trophy className="w-5 h-5" />
                <span className="text-lg font-bold">{selectedItem?.price}P</span>
              </div>
            </div>

            {/* 현재 포인트 */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <span className="text-sm font-semibold">보유 포인트</span>
              <div className="flex items-center space-x-1">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-bold">{currentPoints}P</span>
              </div>
            </div>

            {/* 재고 정보 */}
            {selectedItem?.stock !== undefined && (
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <span className="text-sm font-semibold">
                  {selectedItem.item_type === "GIFTCARD" ? "남은 재고" : "남은 응모 인원"}
                </span>
                <span className="text-lg font-bold">
                  {selectedItem.stock ?? 0}{selectedItem.item_type === "GIFTCARD" ? "개" : "명"}
                </span>
              </div>
            )}

            {/* 구매 후 잔액 */}
            {selectedItem && (
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <span className="text-sm font-semibold">구매 후 잔액</span>
                <span className="text-lg font-bold">
                  {currentPoints - selectedItem.price}P
                </span>
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex flex-col gap-2 w-full pt-2">
              <Button
                className="w-full rounded-full"
                onClick={() => selectedItem && handlePurchase(selectedItem.item_id)}
                disabled={
                  isPurchasing ||
                  !selectedItem ||
                  currentPoints < selectedItem.price ||
                  (selectedItem.stock !== undefined && selectedItem.stock !== null && selectedItem.stock <= 0)
                }
              >
                {isPurchasing ? (
                  "처리 중..."
                ) : !selectedItem ? (
                  "선택된 상품 없음"
                ) : currentPoints < selectedItem.price ? (
                  "포인트 부족"
                ) : selectedItem.stock !== undefined && selectedItem.stock !== null && selectedItem.stock <= 0 ? (
                  "품절"
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    구매하기
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => setSelectedItem(null)}
              >
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
