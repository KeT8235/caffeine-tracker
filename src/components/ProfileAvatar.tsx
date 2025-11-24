import { useState, useEffect } from "react";
import { profileAPI } from "@/lib/api";

interface ProfileAvatarProps {
  memberId?: number;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  profilePhoto?: string | null;
}

export function ProfileAvatar({ 
  memberId, 
  name, 
  size = "md", 
  className = "",
  profilePhoto: propProfilePhoto
}: ProfileAvatarProps) {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(propProfilePhoto || null);
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-[22px]",
  };

  const initials = name.substring(0, 2).toUpperCase();

  useEffect(() => {
    // propProfilePhoto가 제공되면 그것을 사용
    if (propProfilePhoto !== undefined) {
      setProfilePhoto(propProfilePhoto);
      return;
    }

    // memberId가 현재 로그인한 사용자인 경우에만 프로필 로드
    const loadProfilePhoto = async () => {
      if (!memberId) return;
      
      setLoading(true);
      try {
        const profile = await profileAPI.getProfile();
        if (profile.member_id === memberId && profile.profile_photo) {
          setProfilePhoto(profile.profile_photo);
        }
      } catch (error) {
        console.error("Failed to load profile photo:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfilePhoto();
  }, [memberId, propProfilePhoto]);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden ${className}`}
    >
      {profilePhoto ? (
        <img
          src={profilePhoto}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-primary-foreground font-medium">
          {initials}
        </span>
      )}
    </div>
  );
}
