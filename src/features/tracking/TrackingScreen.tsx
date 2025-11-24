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
  const { currentIntake, remainingCaffeine, addCaffeine } = useCaffeine();
  const [brands, setBrands] = useState<
    Array<{ brand_id: number; brand_name: string }>
  >([]);
  const [menus, setMenus] = useState<Array<any>>([]);
  const [customMenus, setCustomMenus] = useState<Array<any>>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [caffeineAmount, setCaffeineAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCaffeine, setCustomCaffeine] = useState("");

  // 브랜드별 로고 매핑 (이미지 파일은 public 또는 assets 경로에 추가 필요)
  const brandLogos: Record<string, string> = {
    메가:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzR0wjnOUmM_UAQUxykbmyBHAhxUCxAkIZUw&s",
    스타벅스: 
    "https://i.namu.wiki/i/9p8OVxJTce_f2HnuZF1QOU6qMSHqXBHdkcx3q_hlGxvhcyaOXKxBVyoDkeg-Cb4Nx2p60W0AUh6RzjAH59vHwQ.svg",
    컴포즈:
    "https://logo-resources.thevc.kr/organizations/200x200/790852d50c38093de194f6812c293d68d3bf1ab8b40ef405a391f2add378072b_1719894440052977.jpg",
  };

  // 특정 메뉴(예: 컴포즈 아메리카노 regular) 이미지 매핑
  const menuImages: Record<string, string> = {
    "메가-아메리카노-regular":
    "https://img.79plus.co.kr/megahp/manager/upload/menu/20250320000925_1742396965069_ekSqAIVc1L.jpg",
    "메가-아메리카노-large":
    "https://cdn.dailycnc.com/news/photo/201607/58081_167995_1856.jpg",
    "메가-에스프레소-regular":
    "https://img.79plus.co.kr/megahp/manager/upload/menu/20250320002019_1742397619030_g5iEBTRsp7.jpg",
    "메가-카페라떼-regular":
    "https://img.79plus.co.kr/megahp/manager/upload/menu/20250320004527_1742399127150_aZXw3Wbf4H.jpg",
    "메가-카페라떼-large":
    "https://img2.joongna.com/cafe-article-data/live/2024/01/09/1034198834/1704760360421_000_TWRPy_main.jpg",
    "스타벅스-아메리카노-small":
    "https://cdn.thescoop.co.kr/news/photo/201208/2696_1638_425.jpg",
    "스타벅스-아메리카노-regular":
    "https://img1.kakaocdn.net/thumb/C305x305@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20231010111814_9a667f9eccc943648797925498bdd8a3.jpg",
    "스타벅스-아메리카노-large":
    "https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[9200000002487]_20210426091745467.jpg",
    "스타벅스-에스프레소-small":
    "https://www.nespresso.com/shared_res/agility/global/coffees/vl/sku-main-info-product/starbucks-espresso-roast_2x.png?impolicy=medium&imwidth=824&imdensity=1",  
    "스타벅스-카페라떼-small":
    "https://image.istarbucks.co.kr/upload/store/skuimg/2024/09/[9200000005520]_20240919155241398.jpg",
    "스타벅스-카페라떼-regular":
    "https://image.istarbucks.co.kr/upload/store/skuimg/2024/09/[9200000005520]_20240919155241398.jpg",
    "스타벅스-카페라떼-large":
    "https://image.istarbucks.co.kr/upload/store/skuimg/2024/09/[9200000005520]_20240919155241398.jpg",
    "컴포즈-아메리카노-regular":
    "https://img.danawa.com/prod_img/500000/312/718/img/13718312_1.jpg?_v=20240103134302",
    "컴포즈-아메리카노-large":
    "https://composecoffee.com/files/attach/images/152/253/097/e697ebc13a026e224f0f149d2e777668.jpg",
    "컴포즈-에스프레소-regular":
    "https://composecoffee.com/files/thumbnails/208/1515x2083.crop.jpg?t=1733792158",
    // 카페라떼 (regular) 이미지 - 사용자 제공 data URL
    "컴포즈-카페라떼-regular":
    "https://composecoffee.com/files/attach/images/152/459/038/bee8306016d78d10e673d14a6d8e30d8.jpg",
    "컴포즈-콜드브루-regular":
    "https://composecoffee.com/files/thumbnails/627/038/1515x2083.crop.jpg?t=1761948671"
  };

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

      // "직접 입력" 선택 시
      if (selectedBrand === "custom") {
        setIsCustom(true);
        setMenus([]);
        return;
      }

      setIsCustom(false);
      try {
        const data = await menuAPI.getMenusByBrand(parseInt(selectedBrand));
        // 같은 메뉴 이름 + 사이즈는 하나만 보이도록 중복 제거
        const seen = new Set<string>();
        const uniqueMenus = data.filter((menu: any) => {
          const key = `${menu.menu_name}-${menu.size}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setMenus(uniqueMenus);
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

    addCaffeine({
      brand: brandName,
      drink: menuName,
      caffeine: amount,
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
                      <span>{brand.brand_name}</span>
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">
                    <span className="text-primary font-medium">✏️ 직접 입력</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* 선택된 브랜드 로고 표시 */}
              {selectedBrand && selectedBrand !== "custom" && (() => {
                const currentBrand = brands.find(
                  (b) => b.brand_id.toString() === selectedBrand,
                );
                const logoSrc = currentBrand
                  ? brandLogos[currentBrand.brand_name]
                  : undefined;

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
              <Label htmlFor="menu">음료 선택</Label>
              <Select
                value={selectedMenu?.menu_id.toString() || ""}
                onValueChange={handleMenuSelect}
              >
                <SelectTrigger id="menu" className="h-12 rounded-xl bg-card">
                  <SelectValue placeholder="음료를 선택하세요..." />
                </SelectTrigger>
                <SelectContent>
                  {menus.map((menu) => (
                    <SelectItem
                      key={menu.menu_id}
                      value={menu.menu_id.toString()}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {menu.menu_name} ({menu.size})
                        </span>
                        <span className="text-xs text-muted-foreground ml-4">
                          {menu.caffeine_mg}mg
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

               {/* 선택된 메뉴 이미지 (컴포즈 아메리카노 regular 등) */}
               {selectedMenu && (() => {
                 const currentBrand = brands.find(
                   (b) => b.brand_id.toString() === selectedBrand,
                 );
                 const key = `${currentBrand?.brand_name}-${selectedMenu.menu_name}-${selectedMenu.size}`;
                 const imgSrc = key && menuImages[key];

                 return (
                   imgSrc && (
                     <motion.div 
                       className="mt-3 flex justify-center"
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                     >
                       <img
                         src={imgSrc}
                         alt={`${currentBrand?.brand_name} ${selectedMenu.menu_name}`}
                         className="w-32 h-32 rounded-xl object-cover bg-white shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                         onClick={handleAddCaffeine}
                       />
                     </motion.div>
                   )
                 );
               })()}
            </motion.div>
          )}
        </motion.div>

        <div className="h-6" />
      </div>
    </div>
  );
}
