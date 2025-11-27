import express from "express";
import { signup, login } from "@/controllers/authController";
import {
  getBrands,
  getMenusByBrand,
  getAllMenus,
  searchMenus,
  addCustomMenu,
  getCustomMenus,
  deleteCustomMenu,
} from "@/controllers/menuController";
import {
  addCaffeineIntake,
  getTodayHistory,
  getHistory,
  getCurrentCaffeineInfo,
  updateCaffeineInfo,
  deleteCaffeineHistory,
  deleteTodayCaffeine,
} from "@/controllers/caffeineController";
import { getProfile, updateProfile } from "@/controllers/profileController";
import {
  searchFriend,
  addFriend,
  getFriends,
  removeFriend,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/controllers/friendController";
import {
  getOrCreateChatRoom,
  sendMessage,
  getMessages,
  getChatRooms,
} from "@/controllers/chatController";
import { handleChat } from "@/controllers/aiController";
import { getChallenges, claimChallenge } from "@/controllers/challengeController";
import {
  getCurrentPoints,
  deductPoints,
} from "@/controllers/shopController";
import { authenticateToken } from "@/middleware/auth";

const router = express.Router();

// 인증 라우트 (토큰 불필요)
router.post("/auth/signup", signup);
router.post("/auth/login", login);

// 메뉴 라우트 (공개)
router.get("/brands", getBrands);
router.get("/brands/:brandId/menus", getMenusByBrand);
router.get("/menus", getAllMenus);
router.get("/menus/search", searchMenus);

// 커스텀 메뉴 라우트 (인증 필요)
router.post("/custom-menus", authenticateToken, addCustomMenu);
router.get("/custom-menus", authenticateToken, getCustomMenus);
router.delete("/custom-menus/:customMenuId", authenticateToken, deleteCustomMenu);

// 카페인 라우트 (인증 필요)
router.post("/caffeine/intake", authenticateToken, addCaffeineIntake);
router.get("/caffeine/today", authenticateToken, getTodayHistory);
router.get("/caffeine/history", authenticateToken, getHistory);
router.get("/caffeine/info", authenticateToken, getCurrentCaffeineInfo);
router.put("/caffeine/info", authenticateToken, updateCaffeineInfo);
router.delete("/caffeine/history/:historyId", authenticateToken, deleteCaffeineHistory);
router.delete("/caffeine/today", authenticateToken, deleteTodayCaffeine);

// 프로필 라우트 (인증 필요)
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

// 친구 라우트 (인증 필요)
router.get("/friends/search", authenticateToken, searchFriend);
router.post("/friends", authenticateToken, addFriend);
router.get("/friends", authenticateToken, getFriends);
router.delete("/friends/:friendId", authenticateToken, removeFriend);

// 친구 요청 라우트 (인증 필요)
router.post("/friend-requests", authenticateToken, sendFriendRequest);
router.get("/friend-requests", authenticateToken, getFriendRequests);
router.post("/friend-requests/:requestId/accept", authenticateToken, acceptFriendRequest);
router.post("/friend-requests/:requestId/reject", authenticateToken, rejectFriendRequest);

// 채팅 및 AI 라우트 (인증 필요)
router.post("/chat/rooms", authenticateToken, getOrCreateChatRoom);
router.get("/chat/rooms", authenticateToken, getChatRooms);
router.post("/chat/messages", authenticateToken, sendMessage);
router.get("/chat/rooms/:roomId/messages", authenticateToken, getMessages);
router.post("/ai/chat", authenticateToken, handleChat);

// 챌린지 라우트 (인증 필요)
router.get("/challenges", authenticateToken, getChallenges);
router.post("/challenges/:challengeCode/claim", authenticateToken, claimChallenge);

// 상점 라우트 (인증 필요)
router.get("/shop/points", authenticateToken, getCurrentPoints);
router.post("/shop/deduct-points", authenticateToken, deductPoints);

export default router;
