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
-- Table structure for table `challenge_definitions`
--

DROP TABLE IF EXISTS `challenge_definitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challenge_definitions` (
  `challenge_id` int NOT NULL AUTO_INCREMENT,
  `challenge_code` int NOT NULL COMMENT '챌린지 타입 코드 (1~6)',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '챌린지 제목',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '챌린지 상세 내용 및 규칙',
  `target_type` enum('DAILY','CUMULATIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '목표 유형 (일일, 누적)',
  `target_value` decimal(5,2) NOT NULL COMMENT '목표 값 (일수, 횟수, 비율 등)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`challenge_id`),
  UNIQUE KEY `challenge_code` (`challenge_code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challenge_definitions`
--

LOCK TABLES `challenge_definitions` WRITE;
/*!40000 ALTER TABLE `challenge_definitions` DISABLE KEYS */;
INSERT INTO `challenge_definitions` VALUES (1,1,'디카페인 대체 챌린지','하루 최소 1회 디카페인 음료를 섭취합니다.','DAILY',1.00,'2025-11-14 15:00:45'),(4,4,'3일 권장량 달성','일일 권장량 이하로 3일 섭취량을 유지합니다.','CUMULATIVE',3.00,'2025-11-14 15:00:45'),(5,5,'1회 꾸준히 출석하기','하루 최소 1회 음료 기록을 1회 달성합니다.','DAILY',1.00,'2025-11-14 15:00:45'),(6,6,'10회 출석체크','하루 최소 1회 음료 기록을 10회 누적 달성합니다.','CUMULATIVE',10.00,'2025-11-14 15:00:45');
/*!40000 ALTER TABLE `challenge_definitions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:03:41
