import { Request, Response } from "express";
import pool from "../config/database.js";

// 프로필 조회
export const getProfile = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;

    // 회원 기본 정보 조회
    let members;
    try {
      [members] = await pool.query(
        "SELECT member_id, username, name, point, profile_photo, language_code FROM members WHERE member_id = ?",
        [memberId],
      );
    } catch (error: any) {
      // profile_photo 컴럼이 없으면 기본 컴럼만 조회
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.warn('profile_photo or language_code column not found, using fallback query');
        [members] = await pool.query(
          "SELECT member_id, username, name, point FROM members WHERE member_id = ?",
          [memberId],
        );
      } else {
        throw error;
      }
    }

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 카페인 정보 조회
    const [caffeineInfo] = await pool.query(
      "SELECT * FROM members_caffeine WHERE member_id = ?",
      [memberId],
    );

    const member = members[0] as any;
    const caffeine =
      Array.isArray(caffeineInfo) && caffeineInfo.length > 0
        ? caffeineInfo[0]
        : null;

    res.json({
      ...member,
      profile_photo: member.profile_photo || null,
      language_code: member.language_code || 'ko',
      caffeineInfo: caffeine,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "프로필 조회 중 오류가 발생했습니다." });
  }
};

// 프로필 업데이트
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const memberId = (req as any).user.memberId;
    const { name, weight_kg, gender, age, profile_photo, language_code, max_caffeine } = req.body;
    
    console.log("Update profile request:", { memberId, name, weight_kg, gender, age, profile_photo: profile_photo ? 'provided' : 'not provided', language_code });

    // 회원 기본 정보 업데이트
    const memberUpdates: string[] = [];
    const memberParams: any[] = [];

    if (name !== undefined) {
      memberUpdates.push("name = ?");
      memberParams.push(name);
    }

    if (profile_photo !== undefined) {
      // profile_photo 컴럼이 있는지 확인
      try {
        await pool.query("SELECT profile_photo FROM members LIMIT 1");
        memberUpdates.push("profile_photo = ?");
        memberParams.push(profile_photo);
      } catch (error: any) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.warn('profile_photo column not found, skipping photo update');
        } else {
          throw error;
        }
      }
    }

    if (language_code !== undefined) {
      // language_code 컴럼이 있는지 확인
      try {
        await pool.query("SELECT language_code FROM members LIMIT 1");
        memberUpdates.push("language_code = ?");
        memberParams.push(language_code);
      } catch (error: any) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.warn('language_code column not found, skipping language update');
        } else {
          throw error;
        }
      }
    }

    if (memberUpdates.length > 0) {
      memberParams.push(memberId);
      await pool.query(
        `UPDATE members SET ${memberUpdates.join(", ")} WHERE member_id = ?`,
        memberParams,
      );
    }

    // 카페인 정보 업데이트
    if (weight_kg !== undefined || gender !== undefined || age !== undefined || max_caffeine !== undefined) {
      // 기존 레코드 확인
      const [existingRecord] = await pool.query(
        "SELECT * FROM members_caffeine WHERE member_id = ?",
        [memberId],
      );
      
      console.log("Existing caffeine record:", existingRecord);

      // age(생년월일)로부터 나이 계산
      let calculatedAge = null;
      if (age) {
        try {
          const birthYear = new Date(age).getFullYear();
          const currentYear = new Date().getFullYear();
          calculatedAge = currentYear - birthYear + 1; // 한국 나이
          console.log("Calculated age:", calculatedAge, "from birth date:", age);
        } catch (e) {
          console.error("Error calculating age:", e);
        }
      }

      // 최대 카페인 섭취량: 사용자가 직접 입력한 값이 있으면 최우선, 없으면 자동 계산
      let maxCaffeine = 400; // 기본값 (WHO 권장)
      if (typeof max_caffeine === 'number' && !isNaN(max_caffeine)) {
        maxCaffeine = max_caffeine;
      } else if (weight_kg !== undefined && calculatedAge !== null) {
        // 체중 기반 계산: 체중(kg) × 6mg
        maxCaffeine = Math.round(weight_kg * 6);
        // 나이에 따른 조정
        if (calculatedAge < 18) {
          maxCaffeine = Math.round(maxCaffeine * 0.5); // 청소년은 50%
        } else if (calculatedAge >= 65) {
          maxCaffeine = Math.round(maxCaffeine * 0.75); // 노년층은 75%
        }
        // 최소/최대 제한
        maxCaffeine = Math.max(100, Math.min(maxCaffeine, 400));
      }
      console.log("Calculated/Selected max caffeine:", maxCaffeine);

      if (Array.isArray(existingRecord) && existingRecord.length > 0) {
        // 레코드가 있으면 UPDATE
        const updates: string[] = [];
        const params: any[] = [];

        if (weight_kg !== undefined) {
          updates.push("weight_kg = ?");
          params.push(weight_kg);
        }

        if (gender !== undefined) {
          updates.push("gender = ?");
          params.push(gender);
        }

        if (age !== undefined) {
          updates.push("age = ?");
          params.push(age); // DATE 타입으로 생년월일 저장
        }

        // 자동 계산된 max_caffeine 업데이트
        updates.push("max_caffeine = ?");
        params.push(maxCaffeine);

        if (updates.length > 0) {
          params.push(memberId);

          console.log("Executing UPDATE:", `UPDATE members_caffeine SET ${updates.join(", ")}, updated_at = NOW() WHERE member_id = ?`, params);
          
          await pool.query(
            `UPDATE members_caffeine SET ${updates.join(", ")}, updated_at = NOW() WHERE member_id = ?`,
            params,
          );
          
          console.log("UPDATE successful");
        } else {
          console.log("No fields to update");
        }
      } else {
        // 레코드가 없으면 INSERT
        const insertParams = [
          memberId,
          weight_kg || 70,
          gender || "M",
          age || null,
          maxCaffeine,
        ];
        
        console.log("Executing INSERT:", insertParams);
        
        await pool.query(
          `INSERT INTO members_caffeine (member_id, weight_kg, gender, age, max_caffeine, current_caffeine, updated_at) 
           VALUES (?, ?, ?, ?, ?, 0, NOW())`,
          insertParams,
        );
        
        console.log("INSERT successful");
      }
    }

    // 업데이트된 프로필 조회
    let members;
    try {
      [members] = await pool.query(
        "SELECT member_id, username, name, point, profile_photo, language_code FROM members WHERE member_id = ?",
        [memberId],
      );
    } catch (error: any) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        [members] = await pool.query(
          "SELECT member_id, username, name, point FROM members WHERE member_id = ?",
          [memberId],
        );
      } else {
        throw error;
      }
    }

    const [caffeineInfo] = await pool.query(
      "SELECT * FROM members_caffeine WHERE member_id = ?",
      [memberId],
    );

    res.json({
      message: "프로필이 업데이트되었습니다.",
      profile: {
        ...(members as any[])[0],
        caffeineInfo: Array.isArray(caffeineInfo) ? caffeineInfo[0] : null,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({ error: "프로필 업데이트 중 오류가 발생했습니다." });
  }
};
