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
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand` (
  `brand_id` int NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_photo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`brand_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand`
--

LOCK TABLES `brand` WRITE;
/*!40000 ALTER TABLE `brand` DISABLE KEYS */;
INSERT INTO `brand` VALUES (1,'硫붽?',NULL),(2,'?ㅽ?踰낆뒪',NULL),(3,'而댄룷利?,NULL);
/*!40000 ALTER TABLE `brand` ENABLE KEYS */;
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
-- Table structure for table `caffeine_history`
--

DROP TABLE IF EXISTS `caffeine_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caffeine_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `menu_id` int DEFAULT NULL,
  `brand_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `caffeine_mg` int NOT NULL,
  `temp` enum('HOT','ICE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `drinked_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `member_id` (`member_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `caffeine_history_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `caffeine_history_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`menu_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caffeine_history`
--

LOCK TABLES `caffeine_history` WRITE;
/*!40000 ALTER TABLE `caffeine_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `caffeine_history` ENABLE KEYS */;
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
  `challenge_code` int NOT NULL COMMENT '梨뚮┛吏 ???肄붾뱶 (1~6)',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '梨뚮┛吏 ?쒕ぉ',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '梨뚮┛吏 ?곸꽭 ?댁슜 諛?洹쒖튃',
  `target_type` enum('DAILY','CUMULATIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '紐⑺몴 ?좏삎 (?쇱씪, ?꾩쟻)',
  `target_value` decimal(5,2) NOT NULL COMMENT '紐⑺몴 媛?(?쇱닔, ?잛닔, 鍮꾩쑉 ??',
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
INSERT INTO `challenge_definitions` VALUES (1,1,'?붿뭅?섏씤 ?泥?梨뚮┛吏','?섎（ 理쒖냼 1???붿뭅?섏씤 ?뚮즺瑜???랬?⑸땲??','DAILY',1.00,'2025-11-14 15:00:45'),(4,4,'3??沅뚯옣???ъ꽦','?쇱씪 沅뚯옣???댄븯濡?3????랬?됱쓣 ?좎??⑸땲??','CUMULATIVE',3.00,'2025-11-14 15:00:45'),(5,5,'1??袁몄???異쒖꽍?섍린','?섎（ 理쒖냼 1???뚮즺 湲곕줉??1???ъ꽦?⑸땲??','DAILY',1.00,'2025-11-14 15:00:45'),(6,6,'10??異쒖꽍泥댄겕','?섎（ 理쒖냼 1???뚮즺 湲곕줉??10???꾩쟻 ?ъ꽦?⑸땲??','CUMULATIVE',10.00,'2025-11-14 15:00:45');
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
-- Table structure for table `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_rooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_message_at` datetime DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_rooms`
--

LOCK TABLES `chat_rooms` WRITE;
/*!40000 ALTER TABLE `chat_rooms` DISABLE KEYS */;
INSERT INTO `chat_rooms` VALUES (1,'2025-11-12 09:52:33','2025-11-12 09:53:52'),(2,'2025-11-12 11:01:14','2025-11-12 12:10:20'),(3,'2025-11-14 16:47:48','2025-11-18 15:34:31');
/*!40000 ALTER TABLE `chat_rooms` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:03:43
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
-- Table structure for table `custom_menu`
--

DROP TABLE IF EXISTS `custom_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_menu` (
  `custom_menu_id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `menu_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `caffeine_mg` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`custom_menu_id`),
  KEY `idx_member_id` (`member_id`),
  CONSTRAINT `custom_menu_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_menu`
--

LOCK TABLES `custom_menu` WRITE;
/*!40000 ALTER TABLE `custom_menu` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_menu` ENABLE KEYS */;
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
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `member_id` int NOT NULL,
  `friend_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`member_id`,`friend_id`),
  KEY `friend_id` (`friend_id`),
  CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:03:43
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
-- Table structure for table `friend_requests`
--

DROP TABLE IF EXISTS `friend_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friend_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `requester_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `status` enum('pending','accepted','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  UNIQUE KEY `unique_request` (`requester_id`,`receiver_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `friend_requests_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `friend_requests_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friend_requests`
--

LOCK TABLES `friend_requests` WRITE;
/*!40000 ALTER TABLE `friend_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `friend_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:03:40
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
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `member_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `point` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `language_code` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ko' COMMENT '?ъ슜???좏깮 ?몄뼱 肄붾뱶 (?? ko, en, ja)',
  `profile_photo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '?꾨줈???ъ쭊 (base64 ?몄퐫??',
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (10,'t1123213','$2a$10$Cd12KrdbRYVFN6XNgBu2eOs/kD1PzOWgc/8i5mcuHXXGiTKU67feG','議곗긽以',0,'2025-11-24 11:27:20','ko',NULL);
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:03:44
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
-- Table structure for table `members_caffeine`
--

DROP TABLE IF EXISTS `members_caffeine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members_caffeine` (
  `member_id` int NOT NULL,
  `age` date NOT NULL COMMENT '?앸뀈?붿씪',
  `weight_kg` decimal(5,1) NOT NULL,
  `gender` enum('?⑥옄','?ъ옄') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_caffeine` int DEFAULT '0',
  `max_caffeine` int NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`member_id`),
  CONSTRAINT `members_caffeine_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members_caffeine`
--

LOCK TABLES `members_caffeine` WRITE;
/*!40000 ALTER TABLE `members_caffeine` DISABLE KEYS */;
INSERT INTO `members_caffeine` VALUES (10,'2004-12-07',100.0,'?⑥옄',0,600,'2025-11-24 11:27:20');
/*!40000 ALTER TABLE `members_caffeine` ENABLE KEYS */;
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
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: caffeine_app
-- ------------------------------------------------------
-- Server version	8.0.43

SET FOREIGN_KEY_CHECKS = 0;

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
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu` (
  `menu_id` int NOT NULL AUTO_INCREMENT,
  `brand_id` int NOT NULL,
  `menu_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('coffee','decaf') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` enum('Short','Tall','Grande','Venti','Trenta') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `caffeine_mg` float NOT NULL,
  `menu_photo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `temp` enum('HOT','ICE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`menu_id`),
  KEY `brand_id` (`brand_id`),
  CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`brand_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

-- LOCK TABLES `menu` WRITE;
-- /*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES 
(1,1,'?꾨찓由ъ뭅??,'coffee','Venti',200,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610133007_1717993807130_nwB5CATOJJ.jpg','ICE'),
(2,1,'移댄뫖移섎끂','coffee','Venti',192,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132739_1717993659672_JFeCQ5qV53.jpg','ICE'),
(3,1,'移댄럹?쇰뼹','coffee','Venti',199,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132819_1717993699956_cEyZRaBZh5.jpg','ICE'),
(4,1,'移댄럹紐⑥뭅','coffee','Venti',233,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132727_1717993647297_GiQ8g7jOCk.jpg','ICE'),
(5,1,'移대씪硫쒕쭏?ㅼ븘??,'coffee','Venti',200.0,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132714_1717993634339_dshEGyCDsC.jpg','ICE'),
(8,1,'?꾨찓由ъ뭅??,'coffee','Venti',204,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105645_1717984605982_8i5CoHU2NV.jpg','HOT'),
(9,1,'移댄뫖移섎끂','coffee','Venti',201,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105852_1717984732750_WEt0KXVcnQ.jpg','HOT'),
(10,1,'移댄럹?쇰뼹','coffee','Venti',190,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105821_1717984701991_RUKCqSZ_HO.jpg','HOT'),
(11,1,'移댄럹紐⑥뭅','coffee','Venti',233,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105838_1717984718108_ZB6aalHqIU.jpg','HOT'),
(12,1,'移대씪硫쒕쭏?ㅼ븘??,'coffee','Venti',203,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105805_1717984685954_T1qos0ocDV.jpg','HOT'),
(13,1,'?꾨찓由ъ뭅??,'decaf','Venti',11,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240612101052_1718154652699_a0ElVTNb16.jpg','ICE'),
(14,1,'移댄뫖移섎끂','decaf','Venti',11,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132018_1717993218605_64Ij4AhmCE.jpg','ICE'),
(15,1,'移댄럹?쇰뼹','decaf','Venti',14,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132005_1717993205762_9xKCxaSb9P.jpg','ICE'),
(16,1,'移댄럹紐⑥뭅','decaf','Venti',23,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240612101114_1718154674451_BGo4AZa57r.jpg','ICE'),
(17,1,'移대씪硫쒕쭏?ㅼ븘??,'decaf','Venti',7,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610131917_1717993157515_k1yeakRwwv.jpg','ICE'),
(20,1,'?꾨찓由ъ뭅??,'decaf','Venti',11,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105207_1717984327186_Sgj9kfKYCi.jpg','HOT'),
(21,1,'移댄뫖移섎끂','decaf','Venti',11,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105007_1717984207073_HqCto2mw3y.jpg','HOT'),
(22,1,'移댄럹?쇰뼹','decaf','Venti',17,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105117_1717984277710_7BjonXSBFE.jpg','HOT'),
(23,1,'移댄럹紐⑥뭅','decaf','Venti',27,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105145_1717984305671_2_yE7sXma9.jpg','HOT'),
(24,1,'移대씪硫쒕쭏?ㅼ븘??,'decaf','Venti',7,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105238_1717984358779_MvgzcNlZdI.jpg','HOT'),
(25,2,'?꾨찓由ъ뭅??,'coffee','Tall',150,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110563]_20250626094353711.jpg','ICE'),
(26,2,'移댄뫖移섎끂','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110601]_20250626095213930.jpg','ICE'),
(27,2,'移댄럹?쇰뼹','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110569]_20250626094801903.jpg','ICE'),
(28,2,'移댄럹紐⑥뭅','coffee','Tall',95,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110566]_20250626113005628.jpg','ICE'),
(29,2,'移대씪硫쒕쭏?ㅼ븘??,'coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110582]_20250626095111658.jpg','ICE'),
(30,2,'?꾨찓由ъ뭅??,'coffee','Tall',150,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[94]_20210430103337006.jpg','HOT'),
(31,2,'移댄뫖移섎끂','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[38]_20210415154821846.jpg','HOT'),
(32,2,'移댄럹?쇰뼹','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[41]_20210415133833725.jpg','HOT'),
(33,2,'移댄럹紐⑥뭅','coffee','Tall',95,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[46]_20210415134438165.jpg','HOT'),
(34,2,'移대씪硫쒕쭏?ㅼ븘??,'coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[126197]_20210415154609863.jpg','HOT'),
(35,2,'?꾨찓由ъ뭅??,'decaf','Tall',15,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110563]_20250626094353711.jpg','ICE'),
(36,2,'移댄뫖移섎끂','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110601]_20250626095213930.jpg','ICE'),
(37,2,'移댄럹?쇰뼹','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110569]_20250626094801903.jpg','ICE'),
(38,2,'移댄럹紐⑥뭅','decaf','Tall',10,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110566]_20250626113005628.jpg','ICE'),
(39,2,'移대씪硫쒕쭏?ㅼ븘??,'decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110582]_20250626095111658.jpg','ICE'),
(40,2,'?꾨찓由ъ뭅??,'decaf','Tall',15,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[94]_20210430103337006.jpg','HOT'),
(41,2,'移댄뫖移섎끂','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[38]_20210415154821846.jpg','HOT'),
(42,2,'移댄럹?쇰뼹','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[41]_20210415133833725.jpg','HOT'),
(43,2,'移댄럹紐⑥뭅','decaf','Tall',10,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[46]_20210415134438165.jpg','HOT'),
(44,2,'移대씪硫쒕쭏?ㅼ븘??,'decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[126197]_20210415154609863.jpg','HOT'),
(45,3,'?꾨찓由ъ뭅??,'coffee','Venti',200,'https://composecoffee.com/files/thumbnails/451/038/1515x2083.crop.jpg?t=1733792262','ICE'),
(46,3,'移댄럹?쇰뼹','coffee','Venti',199,'https://composecoffee.com/files/thumbnails/459/038/1515x2083.crop.jpg?t=1733792331','ICE'),
(47,3,'移댄럹紐⑥뭅','coffee','Venti',233,'https://composecoffee.com/files/thumbnails/609/038/1515x2083.crop.jpg?t=1733792584','ICE'),
(48,3,'移대씪硫쒕쭏?ㅼ븘??,'coffee','Venti',200.0,'https://composecoffee.com/files/thumbnails/619/038/1515x2083.crop.jpg?t=1733792540','ICE'),
(49,3,'?꾨찓由ъ뭅??,'coffee','Venti',204,'https://composecoffee.com/files/thumbnails/210/1515x2083.crop.jpg?t=1733792233','HOT'),
(50,3,'移댄뫖移섎끂','coffee','Venti',202,'https://composecoffee.com/files/thumbnails/214/1515x2083.crop.jpg?t=1733792372','HOT'),
(51,3,'移댄럹?쇰뼹','coffee','Venti',190,'https://composecoffee.com/files/thumbnails/212/1515x2083.crop.jpg?t=1733792307','HOT'),
(52,3,'移댄럹紐⑥뭅','coffee','Venti',233,'https://composecoffee.com/files/thumbnails/222/1515x2083.crop.jpg?t=1733792562','HOT'),
(53,3,'移대씪硫쒕쭏?ㅼ븘??,'coffee','Venti',203,'https://composecoffee.com/files/thumbnails/220/1515x2083.crop.jpg?t=1733792518','HOT'),
(54,3,'?꾨찓由ъ뭅??,'decaf','Venti',9,'https://composecoffee.com/files/thumbnails/938/121/1515x2083.crop.jpg?t=1761949343','ICE'),
(55,3,'肄쒕뱶釉뚮（?쇰뼹','decaf','Venti',5,'https://composecoffee.com/files/thumbnails/775/038/1515x2083.crop.jpg?t=1761949032','ICE'),
(56,3,'肄쒕뱶釉뚮（','decaf','Venti',5,'https://composecoffee.com/files/thumbnails/769/038/1515x2083.crop.jpg?t=1761948953','ICE'),
(57,3,'?꾨찓由ъ뭅??,'decaf','Venti',45,'https://composecoffee.com/files/thumbnails/936/121/1515x2083.crop.jpg?t=1761949160','HOT'),
(58,3,'肄쒕뱶釉뚮（?쇰뼹','decaf','Venti',5,'https://composecoffee.com/files/thumbnails/142/068/1515x2083.crop.jpg?t=1761948985','HOT'),
(59,3,'肄쒕뱶釉뚮（','decaf','Venti',5,'https://composecoffee.com/files/thumbnails/239/1515x2083.crop.jpg?t=1761948914','HOT');
-- /*!40000 ALTER TABLE `menu` ENABLE KEYS */;
-- UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:03:42
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
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `room_id` (`room_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
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
-- Table structure for table `room_participants`
--

DROP TABLE IF EXISTS `room_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_participants` (
  `room_id` int NOT NULL,
  `member_id` int NOT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `unread_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`room_id`,`member_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `room_participants_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `room_participants_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_participants`
--

LOCK TABLES `room_participants` WRITE;
/*!40000 ALTER TABLE `room_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `room_participants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:03:45
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
  `progress_date` date NOT NULL COMMENT '湲곕줉??諛쒖깮???좎쭨 (?쇱씪 ?뺤씤 湲곗?)',
  `daily_success` tinyint(1) DEFAULT '0' COMMENT '?대떦 ?좎쭨 ?쇱씪 紐⑺몴 ?ъ꽦 ?щ? (CHL 1, 2, 3)',
  `current_value` int DEFAULT '0' COMMENT '?꾩옱 ?곗냽 ?쇱닔 ?먮뒗 ?꾩쟻 ?잛닔 (CHL 4, 5, 6)',
  `is_completed` tinyint(1) DEFAULT '0' COMMENT '梨뚮┛吏 理쒖쥌 ?깃났 ?щ?',
  `claimed_at` datetime DEFAULT NULL COMMENT '?깃났 踰꾪듉 ?대┃(蹂댁긽 ?띾뱷) ?쒓컙',
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
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `member_id` int NOT NULL,
  `profile_image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '?꾨줈???대?吏 ?뚯씪 寃쎈줈 ?먮뒗 URL',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '理쒖쥌 ?낅뜲?댄듃 ?쒓컙',
  PRIMARY KEY (`member_id`),
  CONSTRAINT `fk_profile_member_id` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:03:44
