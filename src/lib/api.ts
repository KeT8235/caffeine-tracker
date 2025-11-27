// Vite 프록시를 통해 /api로 접근 (프록시가 backend:3002로 전달)
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// 토큰 관리
export const getToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("auth_token");
};

// API 요청 헬퍼
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 추가 헤더 병합
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log("API 요청:", url, options);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log("API 응답:", response.status, response.statusText);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    console.error("API 에러:", error);
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("API 응답 데이터:", data);
  return data;
}

// 인증 API
export const authAPI = {
  signup: async (data: {
    username: string;
    password: string;
    name: string;
    birthDate: string;
    gender: "남자" | "여자";
    weight_kg?: number;
  }) => {
    return apiRequest<{
      message: string;
      token: string;
      user: { member_id: number; username: string; name: string };
    }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: { username: string; password: string }) => {
    return apiRequest<{
      message: string;
      token: string;
      user: {
        member_id: number;
        username: string;
        name: string;
        point: number;
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// 메뉴 API
export const menuAPI = {
  getBrands: async () => {
    return apiRequest<Array<{ brand_id: number; brand_name: string }>>(
      "/brands",
    );
  },

  getMenusByBrand: async (brandId: number) => {
    return apiRequest<
      Array<{
        menu_id: number;
        brand_id: number;
        brand_name: string;
        menu_name: string;
        category: "coffee" | "decaf";
        size: "small" | "regular" | "large";
        caffeine_mg: number;
          menu_photo: string | null;
          temp: "hot" | "ice" | null;
      }>
    >(`/brands/${brandId}/menus`);
  },

  getAllMenus: async () => {
    return apiRequest<
      Array<{
        menu_id: number;
        brand_id: number;
        brand_name: string;
        menu_name: string;
        category: "coffee" | "decaf";
        size: "small" | "regular" | "large";
        caffeine_mg: number;
      }>
    >("/menus");
  },

  searchMenus: async (query: string) => {
    return apiRequest<
      Array<{
        menu_id: number;
        brand_id: number;
        brand_name: string;
        menu_name: string;
        category: "coffee" | "decaf";
        size: "small" | "regular" | "large";
        caffeine_mg: number;
      }>
    >(`/menus/search?query=${encodeURIComponent(query)}`);
  },

  // 커스텀 음료 추가
  addCustomMenu: async (data: { menu_name: string; caffeine_mg: number }) => {
    return apiRequest<{ message: string; custom_menu_id: number }>(
      "/custom-menus",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  // 커스텀 음료 조회
  getCustomMenus: async () => {
    return apiRequest<
      Array<{
        custom_menu_id: number;
        member_id: number;
        menu_name: string;
        caffeine_mg: number;
        created_at: string;
      }>
    >("/custom-menus");
  },

  // 커스텀 음료 삭제
  deleteCustomMenu: async (customMenuId: number) => {
    return apiRequest<{ message: string }>(
      `/custom-menus/${customMenuId}`,
      {
        method: "DELETE",
      }
    );
  },
};

// 카페인 API
export const caffeineAPI = {
  addIntake: async (data: {
    menu_id?: number;
    brand_name: string;
    menu_name: string;
    caffeine_mg: number;
    temp?: string;
  }) => {
    return apiRequest<{
      message: string;
      caffeineInfo: {
        current_caffeine: number;
        max_caffeine: number;
      };
    }>("/caffeine/intake", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getTodayHistory: async () => {
    return apiRequest<
      Array<{
        history_id: number;
        member_id: number;
        menu_id: number | null;
        brand_name: string;
        menu_name: string;
        caffeine_mg: number;
        drinked_at: string;
        menu_photo?: string;
        temp?: string;
      }>
    >("/caffeine/today");
  },

  getHistory: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";

    return apiRequest<
      Array<{
        history_id: number;
        member_id: number;
        menu_id: number | null;
        brand_name: string;
        menu_name: string;
        caffeine_mg: number;
        drinked_at: string;
      }>
    >(`/caffeine/history${query}`);
  },

  getCurrentInfo: async () => {
    return apiRequest<{
      member_id: number;
      age: string;
      weight_kg: number;
      gender: "남자" | "여자";
      current_caffeine: number;
      max_caffeine: number;
      updated_at: string;
    }>("/caffeine/info");
  },

  updateInfo: async (data: { weight_kg?: number; max_caffeine?: number }) => {
    return apiRequest<{
      message: string;
      caffeineInfo: {
        member_id: number;
        age: string;
        weight_kg: number;
        gender: "남자" | "여자";
        current_caffeine: number;
        max_caffeine: number;
        updated_at: string;
      };
    }>("/caffeine/info", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// 챌린지 API
export const challengeAPI = {
  getChallenges: async () => {
    return apiRequest<{
      challenges: Array<{
        challenge_id: number;
        challenge_code: number;
        title: string;
        goal: string;
        description: string;
        target_type: "DAILY" | "STREAK" | "CUMULATIVE";
        target_value: number;
        status: "not started" | "in progress" | "claimable" | "completed";
        progress?: number;
        daysLeft?: number;
        reward?: string;
        icon?: string;
      }>;
      currentPoints: number;
    }>("/challenges");
  },

  claimChallenge: async (challengeCode: number) => {
    return apiRequest<{
      message: string;
      challenge_code: number;
    }>(`/challenges/${challengeCode}/claim`, {
      method: "POST",
    });
  },
};

// 프로필 API
export const profileAPI = {
  getProfile: async () => {
    return apiRequest<{
      member_id: number;
      username: string;
      name: string;
      point: number;
      profile_photo: string | null;
      language_code: string;
      caffeineInfo: {
        member_id: number;
        age: string;
        weight_kg: number;
        gender: "남자" | "여자";
        current_caffeine: number;
        max_caffeine: number;
        updated_at: string;
      } | null;
    }>("/profile");
  },

  updateProfile: async (data: {
    name?: string;
    weight_kg?: number;
    max_caffeine?: number;
    gender?: string;
    age?: string; // DATE 타입 (YYYY-MM-DD 형식)
    profile_photo?: string | null; // base64 인코딩된 이미지
    language_code?: string; // 언어 코드 (ko, en, ja, zh)
  }) => {
    return apiRequest<{
      message: string;
      profile: {
        member_id: number;
        username: string;
        name: string;
        point: number;
        profile_photo: string | null;
        language_code: string;
        caffeineInfo: {
          member_id: number;
          age: string;
          weight_kg: number;
          gender: "남자" | "여자";
          current_caffeine: number;
          max_caffeine: number;
          updated_at: string;
        } | null;
      };
    }>("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// 친구 API
export const friendAPI = {
  searchFriend: async (username: string) => {
    return apiRequest<{
      user: {
        member_id: number;
        username: string;
        name: string;
      };
      isAlreadyFriend: boolean;
    }>(`/friends/search?username=${encodeURIComponent(username)}`);
  },

  addFriend: async (friendId: number) => {
    return apiRequest<{
      message: string;
      friend: {
        member_id: number;
        username: string;
        name: string;
      };
    }>("/friends", {
      method: "POST",
      body: JSON.stringify({ friendId }),
    });
  },

  getFriends: async () => {
    return apiRequest<{
      friends: Array<{
        member_id: number;
        username: string;
        name: string;
        profile_photo: string | null;
        current_caffeine: number;
        max_caffeine: number;
        last_intake_time: string | null;
      }>;
    }>("/friends");
  },

  removeFriend: async (friendId: number) => {
    return apiRequest<{
      message: string;
    }>(`/friends/${friendId}`, {
      method: "DELETE",
    });
  },

  // 친구 요청 보내기
  sendFriendRequest: async (username: string) => {
    return apiRequest<{
      message: string;
      receiver: {
        member_id: number;
        username: string;
        name: string;
      };
    }>("/friend-requests", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  },

  // 받은 친구 요청 목록
  getFriendRequests: async () => {
    return apiRequest<{
      requests: Array<{
        request_id: number;
        requester_id: number;
        status: string;
        created_at: string;
        username: string;
        name: string;
      }>;
    }>("/friend-requests");
  },

  // 친구 요청 수락
  acceptFriendRequest: async (requestId: number) => {
    return apiRequest<{
      message: string;
      friend: {
        member_id: number;
        username: string;
        name: string;
      };
    }>(`/friend-requests/${requestId}/accept`, {
      method: "POST",
    });
  },

  // 친구 요청 거절
  rejectFriendRequest: async (requestId: number) => {
    return apiRequest<{
      message: string;
    }>(`/friend-requests/${requestId}/reject`, {
      method: "POST",
    });
  },

  // 친구에게 카페인 초과 알림 전송
  notifyFriendsOverLimit: async (data: {
    current_caffeine: number;
    max_caffeine: number;
  }) => {
    return apiRequest<{
      message: string;
      notified_count: number;
    }>("/friends/notify-over-limit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// 채팅 API
export const chatAPI = {
  // 채팅방 생성 또는 가져오기
  getOrCreateChatRoom: async (friendId: number) => {
    return apiRequest<{
      roomId: number;
    }>("/chat/rooms", {
      method: "POST",
      body: JSON.stringify({ friendId }),
    });
  },

  // 채팅방 목록 조회
  getChatRooms: async () => {
    return apiRequest<{
      rooms: Array<{
        room_id: number;
        last_message_at: string | null;
        unread_count: number;
        friend_id: number;
        friend_name: string;
        friend_username: string;
        last_message: string | null;
        last_message_time: string | null;
      }>;
    }>("/chat/rooms");
  },

  // 메시지 전송
  sendMessage: async (roomId: number, content: string) => {
    return apiRequest<{
      message: string;
      data: {
        message_id: number;
        room_id: number;
        sender_id: number;
        content: string;
        sent_at: string;
        sender_name: string;
      };
    }>("/chat/messages", {
      method: "POST",
      body: JSON.stringify({ roomId, content }),
    });
  },

  // 메시지 조회
  getMessages: async (roomId: number) => {
    return apiRequest<{
      messages: Array<{
        message_id: number;
        room_id: number;
        sender_id: number;
        content: string;
        sent_at: string;
        sender_name: string;
        sender_username: string;
      }>;
    }>(`/chat/rooms/${roomId}/messages`);
  },
};

// 상점 API
export const shopAPI = {
  // 현재 포인트 조회
  getCurrentPoints: async () => {
    return apiRequest<{
      currentPoints: number;
    }>("/shop/points");
  },

  // 포인트 차감
  deductPoints: async (points: number) => {
    return apiRequest<{
      message: string;
      remaining_points: number;
    }>("/shop/deduct-points", {
      method: "POST",
      body: JSON.stringify({ points }),
    });
  },
};
