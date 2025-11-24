import { Request, Response } from "express";
import pool from "../config/database.js";

// 채팅방 생성 또는 가져오기 (1:1 채팅)
export const getOrCreateChatRoom = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.body;
    const memberId = (req as any).user.memberId;

    if (!friendId) {
      return res.status(400).json({ error: "친구 ID가 필요합니다." });
    }

    // 친구 관계 확인
    const [friendships] = await pool.query(
      `SELECT * FROM friends 
       WHERE member_id = ? AND friend_id = ?`,
      [memberId, friendId]
    );

    if (!Array.isArray(friendships) || friendships.length === 0) {
      return res.status(403).json({ error: "친구가 아닌 사용자와는 채팅할 수 없습니다." });
    }

    // 기존 채팅방 확인
    const [existingRooms] = await pool.query(
      `SELECT DISTINCT rp1.room_id
       FROM room_participants rp1
       JOIN room_participants rp2 ON rp1.room_id = rp2.room_id
       WHERE rp1.member_id = ? AND rp2.member_id = ?`,
      [memberId, friendId]
    );

    let roomId;

    if (Array.isArray(existingRooms) && existingRooms.length > 0) {
      // 기존 채팅방 사용
      roomId = (existingRooms[0] as any).room_id;
    } else {
      // 새 채팅방 생성
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [result] = await connection.query(
          "INSERT INTO chat_rooms () VALUES ()"
        );

        roomId = (result as any).insertId;

        // 참가자 추가
        await connection.query(
          "INSERT INTO room_participants (room_id, member_id) VALUES (?, ?), (?, ?)",
          [roomId, memberId, roomId, friendId]
        );

        await connection.commit();
        connection.release();
      } catch (transactionError) {
        await connection.rollback();
        connection.release();
        throw transactionError;
      }
    }

    res.json({ roomId });
  } catch (error) {
    console.error("Get or create chat room error:", error);
    res.status(500).json({ error: "채팅방 생성 중 오류가 발생했습니다." });
  }
};

// 메시지 전송
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { roomId, content } = req.body;
    const senderId = (req as any).user.memberId;

    if (!roomId || !content) {
      return res.status(400).json({ error: "채팅방 ID와 메시지 내용이 필요합니다." });
    }

    // 채팅방 참가자인지 확인
    const [participants] = await pool.query(
      "SELECT * FROM room_participants WHERE room_id = ? AND member_id = ?",
      [roomId, senderId]
    );

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(403).json({ error: "해당 채팅방에 접근할 수 없습니다." });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 메시지 저장
      const [result] = await connection.query(
        "INSERT INTO messages (room_id, sender_id, content) VALUES (?, ?, ?)",
        [roomId, senderId, content]
      );

      const messageId = (result as any).insertId;

      // 채팅방 마지막 메시지 시간 업데이트
      await connection.query(
        "UPDATE chat_rooms SET last_message_at = NOW() WHERE room_id = ?",
        [roomId]
      );

      // 다른 참가자의 읽지 않은 메시지 수 증가
      await connection.query(
        `UPDATE room_participants 
         SET unread_count = unread_count + 1 
         WHERE room_id = ? AND member_id != ?`,
        [roomId, senderId]
      );

      await connection.commit();
      connection.release();

      // 전송된 메시지 정보 조회
      const [messages] = await pool.query(
        `SELECT 
          m.message_id,
          m.room_id,
          m.sender_id,
          m.content,
          m.sent_at,
          mem.name as sender_name
         FROM messages m
         JOIN members mem ON m.sender_id = mem.member_id
         WHERE m.message_id = ?`,
        [messageId]
      );

      res.status(201).json({
        message: "메시지가 전송되었습니다.",
        data: (messages as any[])[0],
      });
    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "메시지 전송 중 오류가 발생했습니다." });
  }
};

// 채팅방 메시지 조회
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const memberId = (req as any).user.memberId;

    // 채팅방 참가자인지 확인
    const [participants] = await pool.query(
      "SELECT * FROM room_participants WHERE room_id = ? AND member_id = ?",
      [roomId, memberId]
    );

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(403).json({ error: "해당 채팅방에 접근할 수 없습니다." });
    }

    // 메시지 조회
    const [messages] = await pool.query(
      `SELECT 
        m.message_id,
        m.room_id,
        m.sender_id,
        m.content,
        m.sent_at,
        mem.name as sender_name,
        mem.username as sender_username
       FROM messages m
       JOIN members mem ON m.sender_id = mem.member_id
       WHERE m.room_id = ?
       ORDER BY m.sent_at ASC`,
      [roomId]
    );

    // 읽지 않은 메시지 수 초기화
    await pool.query(
      "UPDATE room_participants SET unread_count = 0 WHERE room_id = ? AND member_id = ?",
      [roomId, memberId]
    );

    res.json({
      messages: messages || [],
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "메시지 조회 중 오류가 발생했습니다." });
  }
};

// 내 채팅방 목록 조회
export const getChatRooms = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;

    const [rooms] = await pool.query(
      `SELECT 
        cr.room_id,
        cr.last_message_at,
        rp.unread_count,
        m.member_id as friend_id,
        m.name as friend_name,
        m.username as friend_username,
        (SELECT content FROM messages WHERE room_id = cr.room_id ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT sent_at FROM messages WHERE room_id = cr.room_id ORDER BY sent_at DESC LIMIT 1) as last_message_time
       FROM room_participants rp
       JOIN chat_rooms cr ON rp.room_id = cr.room_id
       JOIN room_participants rp2 ON cr.room_id = rp2.room_id AND rp2.member_id != rp.member_id
       JOIN members m ON rp2.member_id = m.member_id
       WHERE rp.member_id = ?
       ORDER BY cr.last_message_at DESC`,
      [memberId]
    );

    res.json({
      rooms: rooms || [],
    });
  } catch (error) {
    console.error("Get chat rooms error:", error);
    res.status(500).json({ error: "채팅방 목록 조회 중 오류가 발생했습니다." });
  }
};
