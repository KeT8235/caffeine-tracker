import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import type { SignupRequest, LoginRequest } from "../types/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 회원가입
export const signup = async (req: Request, res: Response) => {
  try {
    const {
      username,
      password,
      name,
      birthDate,
      gender,
      weight_kg,
    }: SignupRequest = req.body;

    // 유효성 검사
    if (!username || username.length < 4) {
      return res.status(400).json({ error: "아이디는 4자 이상이어야 합니다." });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "비밀번호는 6자 이상이어야 합니다." });
    }

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "이름을 올바르게 입력해주세요." });
    }

    if (!birthDate) {
      return res.status(400).json({ error: "생년월일을 선택해주세요." });
    }

    if (!gender) {
      return res.status(400).json({ error: "성별을 선택해주세요." });
    }

    if (!weight_kg || weight_kg < 30 || weight_kg > 200) {
      return res
        .status(400)
        .json({ error: "몸무게를 올바르게 입력해주세요 (30-200kg)." });
    }

    // 나이 계산
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (age < 14) {
      return res
        .status(400)
        .json({ error: "만 14세 이상부터 가입 가능합니다." });
    }

    // 중복 확인
    const [existingUsers] = await pool.query(
      "SELECT member_id FROM members WHERE username = ?",
      [username],
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(409).json({ error: "이미 존재하는 아이디입니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 트랜잭션 시작
    const connection = await pool.getConnection();
    // UTF-8 인코딩 강제 설정
    await connection.query("SET NAMES utf8mb4");
    await connection.beginTransaction();

    try {
      // 회원 정보 저장
      const [result] = await connection.query(
        "INSERT INTO members (username, password, name, point) VALUES (?, ?, ?, ?)",
        [username, hashedPassword, name, 0],
      );

      const memberId = (result as any).insertId;

      // 카페인 정보 초기화 (권장량 계산)
      // 나이와 성별에 따른 적정 카페인량 계산
      let coefficient = 6; // 기본값: 성인 남성

      if (age >= 19) {
        // 성인
        coefficient = gender === "남자" ? 6 : 5;
      } else if (age >= 13 && age <= 18) {
        // 청소년 (13~18세)
        coefficient = 2.5;
      } else {
        // 어린이 (12세 이하) - 카페인 섭취 비권장
        coefficient = 2;
      }

      const maxCaffeine = Math.round(weight_kg * coefficient);

      await connection.query(
        `INSERT INTO members_caffeine 
         (member_id, age, weight_kg, gender, current_caffeine, max_caffeine) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [memberId, birthDate, weight_kg, gender, 0, maxCaffeine],
      );

      // 트랜잭션 커밋
      await connection.commit();
      connection.release();

      // JWT 토큰 생성
      const token = jwt.sign({ memberId, username }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        message: "회원가입이 완료되었습니다.",
        token,
        user: {
          member_id: memberId,
          username,
          name,
          profile_photo: null,
        },
      });
    } catch (transactionError) {
      // 트랜잭션 롤백
      await connection.rollback();
      connection.release();
      console.error("Transaction error:", transactionError);
      throw transactionError;
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "회원가입 중 오류가 발생했습니다." });
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "아이디와 비밀번호를 입력해주세요." });
    }

    // 사용자 조회
    const [users] = await pool.query(
      "SELECT * FROM members WHERE username = ?",
      [username],
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res
        .status(401)
        .json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    const user = users[0] as any;

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { memberId: user.member_id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "로그인 성공",
      token,
      user: {
        member_id: user.member_id,
        username: user.username,
        name: user.name,
        point: user.point,
        profile_photo: user.profile_photo,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "로그인 중 오류가 발생했습니다." });
  }
};
