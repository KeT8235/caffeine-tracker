import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Coffee, Plus, TrendingDown } from "lucide-react";
import { useCaffeine } from "@/contexts/CaffeineContext";
import { menuAPI } from "@/lib/api";
import { toast } from "sonner";

interface TrackingScreenProps {
  onBack: () => void;
}

export function TrackingScreen({ onBack }: TrackingScreenProps) {
    const [selectedTemp, setSelectedTemp] = useState<string>("");
  const { currentIntake, remainingCaffeine, addCaffeine } = useCaffeine();
  const [brands, setBrands] = useState<
    Array<{ brand_id: number; brand_name: string; brand_photo?: string }>
  >([]);
  const [menus, setMenus] = useState<Array<{ menu_id: number; menu_name: string; temp:string; size: string; caffeine_mg: number; menu_photo?: string; decaf?: boolean }>>([]);
  const [customMenus, setCustomMenus] = useState<Array<any>>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [caffeineAmount, setCaffeineAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCaffeine, setCustomCaffeine] = useState("");

  // DB에서 브랜드 목록 로드
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await menuAPI.getBrands();
        setBrands(data);
        // 커스텀 음료 목록도 로드
        const customData = await menuAPI.getCustomMenus();
        setCustomMenus(customData);
      } catch (error) {
        console.error("Failed to load brands:", error);
        toast.error("브랜드 목록을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadBrands();
  }, []);

  // 브랜드 선택 시 해당 브랜드의 메뉴 로드
  useEffect(() => {
    const loadMenus = async () => {
      if (!selectedBrand) {
        setMenus([]);
        setIsCustom(false);
        return;
      }
      if (selectedBrand === "custom") {
        setIsCustom(true);
        setMenus([]);
        return;
      }
      setIsCustom(false);
      try {
        const data = await menuAPI.getMenusByBrand(parseInt(selectedBrand));
        // menu_id 기준으로 중복 제거 (DB에서 menu_id는 유일함)
        const seen = new Set<number>();
        const uniqueMenus = data.filter((menu: any) => {
          if (seen.has(menu.menu_id)) return false;
          seen.add(menu.menu_id);
          return true;
        });
        // temp와 decaf 속성 변환 (ENUM 타입이므로 hot/ice만 허용, 그 외는 빈값 처리)
        const menusWithFlags = uniqueMenus.map((menu: any) => {
          let tempValue = typeof menu.temp === "string" ? menu.temp.toLowerCase() : "";
          if (tempValue !== "hot" && tempValue !== "ice") tempValue = "";
          return {
            ...menu,
            temp: tempValue,
            decaf: String(menu.category).toLowerCase() === "decaf",
          };
        });
        setMenus(menusWithFlags);
      } catch (error) {
        console.error("Failed to load menus:", error);
        toast.error("메뉴 목록을 불러올 수 없습니다.");
      }
    };
    loadMenus();
  }, [selectedBrand]);

  const handleMenuSelect = (menuId: string) => {
    const menu = menus.find((m) => m.menu_id.toString() === menuId);
    if (menu) {
      setSelectedMenu(menu);
      setCaffeineAmount(menu.caffeine_mg.toString());
    }
  };

  const handleAddCaffeine = async () => {
    if (isCustom) {
      // 커스텀 음료 처리
      if (!customName || !customCaffeine) {
        toast.error("음료 이름과 카페인 함량을 입력해주세요.");
        return;
      }

      const amount = parseInt(customCaffeine);
      if (Number.isNaN(amount) || amount <= 0) {
        toast.error("유효한 카페인 함량을 입력해주세요.");
        return;
      }

      try {
        // DB에 커스텀 음료 저장
        await menuAPI.addCustomMenu({
          menu_name: customName,
          caffeine_mg: amount,
        });

        // 카페인 섭취 기록
        addCaffeine({
          brand: "직접 입력",
          drink: customName,
          caffeine: amount,
        });

        // 커스텀 목록 새로고침
        const customData = await menuAPI.getCustomMenus();
        setCustomMenus(customData);

        // 폼 리셋
        setCustomName("");
        setCustomCaffeine("");
        toast.success("커스텀 음료가 추가되었습니다!");
      } catch (error) {
        console.error("Failed to add custom menu:", error);
        toast.error("커스텀 음료 추가 중 오류가 발생했습니다.");
      }
      return;
    }

    // 기존 브랜드 음료 처리
    if (!caffeineAmount || !selectedBrand) return;

    const amount = parseInt(caffeineAmount);
    if (Number.isNaN(amount) || amount <= 0) return;

    // 일일 권장량 초과 시 경고는 CaffeineContext에서 처리하므로 여기서는 제거
    const brandName =
      brands.find((b) => b.brand_id.toString() === selectedBrand)?.brand_name ||
      "Unknown";
    const menuName = selectedMenu?.menu_name || "Custom Drink";
    const menuPhoto = selectedMenu?.menu_photo || null;
    const menuId = selectedMenu?.menu_id || null;
    const temp = selectedMenu?.temp || null;

    addCaffeine({
      brand: brandName,
      drink: menuName,
      caffeine: amount,
      menu_photo: menuPhoto,
      menu_id: menuId,
      temp: temp,
    });

    // Reset form to allow adding more drinks
    setSelectedMenu(null);
    setCaffeineAmount("");
    // Keep selectedBrand so user can quickly add another drink from same brand
  };

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

          <h1 className="text-[24px]">음료 추가</h1>

          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Remaining Limit Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/5 border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  남은 일일 권장량
                </p>
                <div className="flex items-baseline space-x-2">
                  <motion.span
                    className="text-[32px] text-primary leading-none"
                    key={remainingCaffeine}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {remainingCaffeine.toFixed(0)}
                  </motion.span>
                  <span className="text-muted-foreground">mg</span>
                </div>
              </div>
              <div className="bg-primary/10 rounded-full p-3">
                <TrendingDown className="w-8 h-8 text-primary" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Input Form */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="space-y-2">
            <Label htmlFor="brand">브랜드 선택</Label>
            <div className="flex items-center gap-3">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand" className="h-12 rounded-xl bg-card">
                  <SelectValue placeholder="커피 브랜드를 선택하세요..." />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem
                      key={brand.brand_id}
                      value={brand.brand_id.toString()}
                    >
                      <span className="flex items-center gap-2">
                        {brand.brand_photo ? (
                          <img
                            src={brand.brand_photo}
                            alt={`${brand.brand_name} 로고`}
                            className="w-6 h-6 rounded-full object-contain bg-white border border-border"
                            style={{ minWidth: 24, minHeight: 24 }}
                          />
                        ) : null}
                        <span>{brand.brand_name}</span>
                      </span>
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">
                    <span className="flex items-center gap-2 text-primary font-medium">
                      <span role="img" aria-label="edit">✏️</span> 직접 입력
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* 선택된 브랜드 로고 표시 (DB에서 가져온 brand_photo 사용) */}
              {selectedBrand && selectedBrand !== "custom" && (() => {
                const currentBrand = brands.find(
                  (b) => b.brand_id.toString() === selectedBrand,
                );
                const logoSrc = currentBrand?.brand_photo;
                return (
                  logoSrc && (
                    <img
                      src={logoSrc}
                      alt={`${currentBrand?.brand_name} 로고`}
                      className="w-8 h-8 rounded-md object-contain bg-white"
                    />
                  )
                );
              })()}
            </div>
          </div>

          {/* 커스텀 입력 폼 */}
          {isCustom && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                <Label htmlFor="customName">음료 이름</Label>
                <Input
                  id="customName"
                  placeholder="예: 집에서 만든 커피"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-12 rounded-xl bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customCaffeine">카페인 함량 (mg)</Label>
                <Input
                  id="customCaffeine"
                  type="number"
                  placeholder="예: 150"
                  value={customCaffeine}
                  onChange={(e) => setCustomCaffeine(e.target.value)}
                  className="h-12 rounded-xl bg-card"
                />
              </div>

              {/* 저장된 커스텀 음료 목록 */}
              {customMenus.length > 0 && (
                <div className="space-y-2">
                  <Label>내가 저장한 음료</Label>
                  <div className="space-y-2">
                    {customMenus.map((menu) => (
                      <Card
                        key={menu.custom_menu_id}
                        className="p-3 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={async () => {
                              // 즉시 추가
                              addCaffeine({
                                brand: "직접 입력",
                                drink: menu.menu_name,
                                caffeine: menu.caffeine_mg,
                              });
                            }}
                          >
                            <p className="font-medium">{menu.menu_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {menu.caffeine_mg}mg 카페인
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={async (e: React.MouseEvent) => {
                                e.stopPropagation();
                                try {
                                  await menuAPI.deleteCustomMenu(menu.custom_menu_id);
                                  const customData = await menuAPI.getCustomMenus();
                                  setCustomMenus(customData);
                                  toast.success("커스텀 음료가 삭제되었습니다.");
                                } catch (error) {
                                  toast.error("삭제 중 오류가 발생했습니다.");
                                }
                              }}
                            >
                              ✕
                            </Button>
                            <Coffee className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 커스텀 음료 추가 버튼 */}
          {isCustom && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
                onClick={handleAddCaffeine}
                disabled={!customName || !customCaffeine}
              >
                <Plus className="w-5 h-5" />
                커스텀 음료 추가
              </Button>
            </motion.div>
          )}

          {selectedBrand && !isCustom && menus.length > 0 && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {/* 온도 선택 드롭다운 */}
              <Label htmlFor="temp">온도 선택</Label>
              <Select
                value={selectedTemp}
                onValueChange={setSelectedTemp}
              >
                <SelectTrigger id="temp" className="h-12 rounded-xl bg-card">
                  <SelectValue placeholder="핫/아이스를 선택하세요..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">
                    <span className="inline-flex items-center gap-2">
                      <span role="img" aria-label="hot">🔥</span> 핫
                    </span>
                  </SelectItem>
                  <SelectItem value="ice">
                    <span className="inline-flex items-center gap-2">
                      <span role="img" aria-label="ice">❄️</span> 아이스
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* 온도 선택 후 메뉴 선택 */}
              {selectedTemp && (
                <>
                  <Label htmlFor="menu">음료 선택</Label>
                  <Select
                    value={selectedMenu?.menu_id?.toString() || ""}
                    onValueChange={handleMenuSelect}
                  >
                    <SelectTrigger id="menu" className="h-12 rounded-xl bg-card">
                      <SelectValue placeholder="음료를 선택하세요..." />
                    </SelectTrigger>
                    <SelectContent>
                      {menus.filter((menu) => menu.temp === selectedTemp).map((menu) => (
                        <SelectItem
                          key={menu.menu_id}
                          value={menu.menu_id.toString()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="flex items-center gap-2">
                              <span
                                style={{
                                  color: menu.temp === "hot" ? "#e57373" : menu.temp === "ice" ? "#64b5f6" : undefined,
                                  fontWeight: "bold",
                                  marginRight: 4,
                                }}
                              >
                                {menu.temp === "hot"
                                  ? "뜨거움"
                                  : menu.temp === "ice"
                                  ? "차가움"
                                  : menu.temp}
                              </span>
                              <span>{menu.menu_name} ({menu.size})</span>
                              {menu.decaf ? (
                                <span
                                  className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold shadow-sm border border-green-300"
                                >
                                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#43a047"/><text x="50%" y="55%" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" dy=".3em">D</text></svg>
                                  디카페인
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold shadow-sm border border-yellow-300"
                                >
                                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#fbc02d"/><text x="50%" y="55%" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" dy=".3em">C</text></svg>
                                  카페인
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground ml-4">
                              {menu.caffeine_mg}mg
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* 선택된 메뉴 이미지 (DB에서 가져온 menu_photo 사용) */}
                  {selectedMenu && (
                    <motion.div 
                      className="mt-3 flex justify-center relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={selectedMenu.menu_photo && selectedMenu.menu_photo !== 'NULL' ? selectedMenu.menu_photo : "https://cdn.jsdelivr.net/gh/kimsocode/caffeine-tracker-assets/no-image-128.png"}
                        alt={selectedMenu.menu_photo && selectedMenu.menu_photo !== 'NULL' ? `${selectedMenu.menu_name} 이미지` : "이미지 없음"}
                        className="w-32 h-32 rounded-2xl object-cover bg-white shadow-lg cursor-pointer transition-shadow border-2 border-primary/30"
                        onClick={handleAddCaffeine}
                        style={{ opacity: selectedMenu.menu_photo && selectedMenu.menu_photo !== 'NULL' ? 1 : 0.3 }}
                        onError={(e) => {
                          e.currentTarget.src = "https://cdn.jsdelivr.net/gh/kimsocode/caffeine-tracker-assets/no-image-128.png";
                        }}
                      />
                      {/* 음료명 오버레이 */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1 rounded-full text-sm font-semibold shadow" style={{zIndex:2}}>
                        {selectedMenu.menu_name} ({selectedMenu.size})
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </motion.div>

        <div className="h-6" />
      </div>
    </div>
  );
}
