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
(1,1,'아메리카노','coffee','Venti',200,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610133007_1717993807130_nwB5CATOJJ.jpg','ICE'),
(2,1,'카푸치노','coffee','Venti',192,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132739_1717993659672_JFeCQ5qV53.jpg','ICE'),
(3,1,'카페라떼','coffee','Venti',199,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132819_1717993699956_cEyZRaBZh5.jpg','ICE'),
(4,1,'카페모카','coffee','Venti',233,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132727_1717993647297_GiQ8g7jOCk.jpg','ICE'),
(5,1,'카라멜마키아또','coffee','Venti',200.0,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132714_1717993634339_dshEGyCDsC.jpg','ICE'),
(8,1,'아메리카노','coffee','Venti',204,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105645_1717984605982_8i5CoHU2NV.jpg','HOT'),
(9,1,'카푸치노','coffee','Venti',201,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105852_1717984732750_WEt0KXVcnQ.jpg','HOT'),
(10,1,'카페라떼','coffee','Venti',190,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105821_1717984701991_RUKCqSZ_HO.jpg','HOT'),
(11,1,'카페모카','coffee','Venti',233,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105838_1717984718108_ZB6aalHqIU.jpg','HOT'),
(12,1,'카라멜마키아또','coffee','Venti',203,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105805_1717984685954_T1qos0ocDV.jpg','HOT'),
(13,1,'아메리카노','decaf','Venti',11,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240612101052_1718154652699_a0ElVTNb16.jpg','ICE'),
(14,1,'카푸치노','decaf','Venti',11,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132018_1717993218605_64Ij4AhmCE.jpg','ICE'),
(15,1,'카페라떼','decaf','Venti',14,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610132005_1717993205762_9xKCxaSb9P.jpg','ICE'),
(16,1,'카페모카','decaf','Venti',23,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240612101114_1718154674451_BGo4AZa57r.jpg','ICE'),
(17,1,'카라멜마키아또','decaf','Venti',7,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610131917_1717993157515_k1yeakRwwv.jpg','ICE'),
(20,1,'아메리카노','decaf','Venti',11,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105207_1717984327186_Sgj9kfKYCi.jpg','HOT'),
(21,1,'카푸치노','decaf','Venti',11,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105007_1717984207073_HqCto2mw3y.jpg','HOT'),
(22,1,'카페라떼','decaf','Venti',17,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105117_1717984277710_7BjonXSBFE.jpg','HOT'),
(23,1,'카페모카','decaf','Venti',27,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105145_1717984305671_2_yE7sXma9.jpg','HOT'),
(24,1,'카라멜마키아또','decaf','Venti',7,'https://img.79plus.co.kr/megahp/manager/upload/menu/20240610105238_1717984358779_MvgzcNlZdI.jpg','HOT'),
(25,2,'아메리카노','coffee','Tall',150,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110563]_20250626094353711.jpg','ICE'),
(26,2,'카푸치노','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110601]_20250626095213930.jpg','ICE'),
(27,2,'카페라떼','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110569]_20250626094801903.jpg','ICE'),
(28,2,'카페모카','coffee','Tall',95,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110566]_20250626113005628.jpg','ICE'),
(29,2,'카라멜마키아또','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110582]_20250626095111658.jpg','ICE'),
(30,2,'아메리카노','coffee','Tall',150,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[94]_20210430103337006.jpg','HOT'),
(31,2,'카푸치노','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[38]_20210415154821846.jpg','HOT'),
(32,2,'카페라떼','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[41]_20210415133833725.jpg','HOT'),
(33,2,'카페모카','coffee','Tall',95,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[46]_20210415134438165.jpg','HOT'),
(34,2,'카라멜마키아또','coffee','Tall',75,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[126197]_20210415154609863.jpg','HOT'),
(35,2,'아메리카노','decaf','Tall',15,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110563]_20250626094353711.jpg','ICE'),
(36,2,'카푸치노','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110601]_20250626095213930.jpg','ICE'),
(37,2,'카페라떼','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110569]_20250626094801903.jpg','ICE'),
(38,2,'카페모카','decaf','Tall',10,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110566]_20250626113005628.jpg','ICE'),
(39,2,'카라멜마키아또','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2025/06/[110582]_20250626095111658.jpg','ICE'),
(40,2,'아메리카노','decaf','Tall',15,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[94]_20210430103337006.jpg','HOT'),
(41,2,'카푸치노','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[38]_20210415154821846.jpg','HOT'),
(42,2,'카페라떼','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[41]_20210415133833725.jpg','HOT'),
(43,2,'카페모카','decaf','Tall',10,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[46]_20210415134438165.jpg','HOT'),
(44,2,'카라멜마키아또','decaf','Tall',8,'https://image.istarbucks.co.kr/upload/store/skuimg/2021/04/[126197]_20210415154609863.jpg','HOT'),
(45,3,'아메리카노','coffee','Venti',200,'https://composecoffee.com/files/thumbnails/451/038/1515x2083.crop.jpg?t=1733792262','ICE'),
(46,3,'카페라떼','coffee','Venti',199,'https://composecoffee.com/files/thumbnails/459/038/1515x2083.crop.jpg?t=1733792331','ICE'),
(47,3,'카페모카','coffee','Venti',233,'https://composecoffee.com/files/thumbnails/609/038/1515x2083.crop.jpg?t=1733792584','ICE'),
(48,3,'카라멜마키아또','coffee','Venti',200.0,'https://composecoffee.com/files/thumbnails/619/038/1515x2083.crop.jpg?t=1733792540','ICE'),
(49,3,'아메리카노','coffee','Venti',204,'https://composecoffee.com/files/thumbnails/210/1515x2083.crop.jpg?t=1733792233','HOT'),
(50,3,'카푸치노','coffee','Venti',202,'https://composecoffee.com/files/thumbnails/214/1515x2083.crop.jpg?t=1733792372','HOT'),
(51,3,'카페라떼','coffee','Venti',190,'https://composecoffee.com/files/thumbnails/212/1515x2083.crop.jpg?t=1733792307','HOT'),
(52,3,'카페모카','coffee','Venti',233,'https://composecoffee.com/files/thumbnails/222/1515x2083.crop.jpg?t=1733792562','HOT'),
(53,3,'카라멜마키아또','coffee','Venti',203,'https://composecoffee.com/files/thumbnails/220/1515x2083.crop.jpg?t=1733792518','HOT'),
(54,3,'아메리카노','decaf','Venti',9,'https://composecoffee.com/files/thumbnails/938/121/1515x2083.crop.jpg?t=1761949343','ICE'),
(55,3,'콜드브루라떼','decaf','Venti',5,'https://composecoffee.com/files/thumbnails/775/038/1515x2083.crop.jpg?t=1761949032','ICE'),
(56,3,'콜드브루','decaf','Venti',5,'https://composecoffee.com/files/thumbnails/769/038/1515x2083.crop.jpg?t=1761948953','ICE'),
(57,3,'아메리카노','decaf','Venti',45,'https://composecoffee.com/files/thumbnails/936/121/1515x2083.crop.jpg?t=1761949160','HOT'),
(58,3,'콜드브루라떼','decaf','Venti',5,'https://composecoffee.com/files/thumbnails/142/068/1515x2083.crop.jpg?t=1761948985','HOT'),
(59,3,'콜드브루','decaf','Venti',5,'https://composecoffee.com/files/thumbnails/239/1515x2083.crop.jpg?t=1761948914','HOT');
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
