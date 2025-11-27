import { Request, Response } from "express";
import pool from "../config/database.js";

// 친구 검색 (username으로)
export const searchFriend = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    const memberId = (req as any).user.memberId;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "검색할 아이디를 입력해주세요." });
    }

    // 자기 자신은 검색 제외
    const [users] = await pool.query(
      `SELECT member_id, username, name 
       FROM members 
       WHERE username = ? AND member_id != ?`,
      [username, memberId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: "해당 아이디의 사용자를 찾을 수 없습니다." });
    }

    const user = users[0] as any;

    // 이미 친구인지 확인
    const [existingFriendship] = await pool.query(
      `SELECT * FROM friends 
       WHERE (member_id = ? AND friend_id = ?) 
       OR (member_id = ? AND friend_id = ?)`,
      [memberId, user.member_id, user.member_id, memberId]
    );

    const isAlreadyFriend = Array.isArray(existingFriendship) && existingFriendship.length > 0;

    res.json({
      user: {
        member_id: user.member_id,
        username: user.username,
        name: user.name,
      },
      isAlreadyFriend,
    });
  } catch (error) {
    console.error("Search friend error:", error);
    res.status(500).json({ error: "친구 검색 중 오류가 발생했습니다." });
  }
};

// 친구 추가
export const addFriend = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.body;
    const memberId = (req as any).user.memberId;

    if (!friendId) {
      return res.status(400).json({ error: "친구 ID가 필요합니다." });
    }

    // 자기 자신을 친구로 추가하는지 확인
    if (memberId === friendId) {
      return res.status(400).json({ error: "자기 자신을 친구로 추가할 수 없습니다." });
    }

    // 친구로 추가할 사용자가 존재하는지 확인
    const [users] = await pool.query(
      "SELECT member_id, username, name FROM members WHERE member_id = ?",
      [friendId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: "해당 사용자를 찾을 수 없습니다." });
    }

    // 이미 친구인지 확인
    const [existingFriendship] = await pool.query(
      `SELECT * FROM friends 
       WHERE (member_id = ? AND friend_id = ?) 
       OR (member_id = ? AND friend_id = ?)`,
      [memberId, friendId, friendId, memberId]
    );

    if (Array.isArray(existingFriendship) && existingFriendship.length > 0) {
      return res.status(409).json({ error: "이미 친구로 등록된 사용자입니다." });
    }

    // 친구 관계 추가 (양방향)
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "INSERT INTO friends (member_id, friend_id) VALUES (?, ?)",
        [memberId, friendId]
      );

      await connection.query(
        "INSERT INTO friends (member_id, friend_id) VALUES (?, ?)",
        [friendId, memberId]
      );

      await connection.commit();
      connection.release();

      const friend = users[0] as any;

      res.status(201).json({
        message: "친구가 추가되었습니다.",
        friend: {
          member_id: friend.member_id,
          username: friend.username,
          name: friend.name,
        },
      });
    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }
  } catch (error) {
    console.error("Add friend error:", error);
    res.status(500).json({ error: "친구 추가 중 오류가 발생했습니다." });
  }
};

// 친구 목록 조회
export const getFriends = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;

    const [friends] = await pool.query(
      `SELECT 
        m.member_id,
        m.username,
        m.name,
        m.profile_photo,
        COALESCE(mc.current_caffeine, 0) as current_caffeine,
        COALESCE(mc.max_caffeine, 400) as max_caffeine,
        mc.updated_at as last_intake_time
      FROM friends f
      JOIN members m ON f.friend_id = m.member_id
      LEFT JOIN members_caffeine mc ON m.member_id = mc.member_id
      WHERE f.member_id = ?
      ORDER BY m.name ASC`,
      [memberId]
    );

    res.json({
      friends: friends || [],
    });
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({ error: "친구 목록 조회 중 오류가 발생했습니다." });
  }
};

// 친구 삭제
export const removeFriend = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    const memberId = (req as any).user.memberId;

    if (!friendId) {
      return res.status(400).json({ error: "친구 ID가 필요합니다." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 양방향 친구 관계 삭제
      await connection.query(
        "DELETE FROM friends WHERE member_id = ? AND friend_id = ?",
        [memberId, friendId]
      );

      await connection.query(
        "DELETE FROM friends WHERE member_id = ? AND friend_id = ?",
        [friendId, memberId]
      );

      await connection.commit();
      connection.release();

      res.json({ message: "친구가 삭제되었습니다." });
    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }
  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({ error: "친구 삭제 중 오류가 발생했습니다." });
  }
};

// 친구 요청 보내기
export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const requesterId = (req as any).user.memberId;

    if (!username) {
      return res.status(400).json({ error: "친구의 아이디를 입력해주세요." });
    }

    // 대상 사용자 찾기 (username으로 검색)
    const [users] = await pool.query(
      "SELECT member_id, username, name FROM members WHERE username = ?",
      [username]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: "해당 아이디의 사용자를 찾을 수 없습니다." });
    }

    const receiver = users[0] as any;

    // 자기 자신에게 요청하는지 확인
    if (requesterId === receiver.member_id) {
      return res.status(400).json({ error: "자기 자신에게 친구 요청을 보낼 수 없습니다." });
    }

    // 이미 친구인지 확인
    const [existingFriendship] = await pool.query(
      `SELECT * FROM friends 
       WHERE (member_id = ? AND friend_id = ?) 
       OR (member_id = ? AND friend_id = ?)`,
      [requesterId, receiver.member_id, receiver.member_id, requesterId]
    );

    if (Array.isArray(existingFriendship) && existingFriendship.length > 0) {
      return res.status(409).json({ error: "이미 친구로 등록된 사용자입니다." });
    }

    // 이미 요청이 있는지 확인
    const [existingRequest] = await pool.query(
      `SELECT * FROM friend_requests 
       WHERE requester_id = ? AND receiver_id = ? AND status = 'pending'`,
      [requesterId, receiver.member_id]
    );

    if (Array.isArray(existingRequest) && existingRequest.length > 0) {
      return res.status(409).json({ error: "이미 친구 요청을 보냈습니다." });
    }

    // 친구 요청 생성
    await pool.query(
      "INSERT INTO friend_requests (requester_id, receiver_id) VALUES (?, ?)",
      [requesterId, receiver.member_id]
    );

    res.status(201).json({
      message: "친구 요청을 보냈습니다.",
      receiver: {
        member_id: receiver.member_id,
        username: receiver.username,
        name: receiver.name,
      },
    });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ error: "친구 요청 중 오류가 발생했습니다." });
  }
};

// 받은 친구 요청 목록 조회
export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;

    const [requests] = await pool.query(
      `SELECT 
        fr.request_id,
        fr.requester_id,
        fr.status,
        fr.created_at,
        m.username,
        m.name,
        m.profile_photo
      FROM friend_requests fr
      JOIN members m ON fr.requester_id = m.member_id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC`,
      [memberId]
    );

    res.json({
      requests: requests || [],
    });
  } catch (error) {
    console.error("Get friend requests error:", error);
    res.status(500).json({ error: "친구 요청 목록 조회 중 오류가 발생했습니다." });
  }
};

// 친구 요청 수락
export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const memberId = (req as any).user.memberId;

    // 요청 정보 확인
    const [requests] = await pool.query(
      `SELECT * FROM friend_requests 
       WHERE request_id = ? AND receiver_id = ? AND status = 'pending'`,
      [requestId, memberId]
    );

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(404).json({ error: "유효하지 않은 친구 요청입니다." });
    }

    const request = requests[0] as any;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 친구 요청 상태 업데이트
      await connection.query(
        "UPDATE friend_requests SET status = 'accepted' WHERE request_id = ?",
        [requestId]
      );

      // 양방향 친구 관계 추가
      await connection.query(
        "INSERT INTO friends (member_id, friend_id) VALUES (?, ?)",
        [request.requester_id, memberId]
      );

      await connection.query(
        "INSERT INTO friends (member_id, friend_id) VALUES (?, ?)",
        [memberId, request.requester_id]
      );

      await connection.commit();
      connection.release();

      // 친구 정보 조회
      const [users] = await pool.query(
        "SELECT member_id, username, name FROM members WHERE member_id = ?",
        [request.requester_id]
      );

      const friend = (users as any[])[0];

      res.json({
        message: "친구 요청을 수락했습니다.",
        friend: {
          member_id: friend.member_id,
          username: friend.username,
          name: friend.name,
        },
      });
    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ error: "친구 요청 수락 중 오류가 발생했습니다." });
  }
};

// 친구 요청 거절
export const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const memberId = (req as any).user.memberId;

    // 요청 정보 확인
    const [requests] = await pool.query(
      `SELECT * FROM friend_requests 
       WHERE request_id = ? AND receiver_id = ? AND status = 'pending'`,
      [requestId, memberId]
    );

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(404).json({ error: "유효하지 않은 친구 요청입니다." });
    }

    // 친구 요청 상태 업데이트
    await pool.query(
      "UPDATE friend_requests SET status = 'rejected' WHERE request_id = ?",
      [requestId]
    );

    res.json({ message: "친구 요청을 거절했습니다." });
  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({ error: "친구 요청 거절 중 오류가 발생했습니다." });
  }
};
