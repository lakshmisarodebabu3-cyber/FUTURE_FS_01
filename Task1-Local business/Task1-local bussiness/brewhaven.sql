-- ================================================================
-- brewhaven.sql — Run this in phpMyAdmin → Import tab
-- ================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS `brewhaven_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `brewhaven_db`;

-- Drop table if it exists (clean slate — removes old broken table)
DROP TABLE IF EXISTS `bookings`;

-- Create the bookings table with exact column names used in booking.php
CREATE TABLE `bookings` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(100) NOT NULL,
  `phone`        VARCHAR(15)  NOT NULL,
  `guests`       VARCHAR(5)   NOT NULL,
  `booking_date` DATE         NOT NULL,
  `booking_time` TIME         NOT NULL,
  `message`      TEXT,
  `status`       ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- Verify it worked — you should see the table structure below
-- ================================================================
DESCRIBE `bookings`;