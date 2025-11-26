-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: caffeine_app
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user_challenge_progress`
--

DROP TABLE IF EXISTS `user_challenge_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_challenge_progress` (
  `progress_id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `challenge_code` int NOT NULL,
  `progress_date` date NOT NULL COMMENT '기록이 발생한 날짜 (일일 확인 기준)',
  `daily_success` tinyint(1) DEFAULT '0' COMMENT '해당 날짜 일일 목표 달성 여부 (CHL 1, 2, 3)',
  `current_value` int DEFAULT '0' COMMENT '현재 연속 일수 또는 누적 횟수 (CHL 4, 5, 6)',
  `is_completed` tinyint(1) DEFAULT '0' COMMENT '챌린지 최종 성공 여부',
  `claimed_at` datetime DEFAULT NULL COMMENT '성공 버튼 클릭(보상 획득) 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`progress_id`),
  UNIQUE KEY `unique_daily_progress` (`member_id`,`challenge_code`,`progress_date`),
  KEY `fk_challenge_code` (`challenge_code`),
  CONSTRAINT `fk_challenge_code` FOREIGN KEY (`challenge_code`) REFERENCES `challenge_definitions` (`challenge_code`) ON DELETE CASCADE,
  CONSTRAINT `fk_member_progress` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_challenge_progress`
--

LOCK TABLES `user_challenge_progress` WRITE;
/*!40000 ALTER TABLE `user_challenge_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_challenge_progress` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:03:42
