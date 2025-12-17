-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 16, 2025 at 02:57 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `truck_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `default_bill_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `default_bill_rate`, `created_at`, `updated_at`) VALUES
(1, 'Aecon Construction', 135.00, '2025-12-16 10:03:49', '2025-12-16 12:23:45'),
(2, 'PCL Construction', 120.00, '2025-12-16 10:03:49', '2025-12-16 12:23:45'),
(3, 'EllisDon', 110.00, '2025-12-16 10:03:49', '2025-12-16 12:23:45'),
(4, 'GrindStone', 140.00, '2025-12-16 10:03:49', '2025-12-16 12:23:45');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_id_code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `default_pay_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `pin` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `user_id`, `user_id_code`, `name`, `phone`, `default_pay_rate`, `pin`, `created_at`, `updated_at`) VALUES
(1, 2, 'DRV001', 'John Smith', '555-0103', 26.00, '$2a$10$dMF7Gxmg9k7Ud3RjPmyvq.Ttr4NzmdiFFcmMbggP65H9Yh7QWJygS', '2025-12-16 10:28:32', '2025-12-16 10:38:19'),
(3, 4, 'DRV002', 'ram', '23254235346', 50.00, '$2a$10$z1vFYSvAG/c1vuQkblhxzeQk0ZFJJ7qen6Y4BqXc.r.O1x9W5.y56', '2025-12-16 11:57:21', '2025-12-16 11:57:38'),
(5, 6, 'DRV006', 'Ritika Pirag', '23254235346', 999.00, '$2a$10$XyakTVJ0V24CnFH.GSSMvOUH/nu8CF5.zlh2A4ZII57bryxmOndNK', '2025-12-16 13:56:40', '2025-12-16 13:56:40');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `truck_number` varchar(50) DEFAULT NULL,
  `customer` varchar(255) NOT NULL,
  `job_type` varchar(255) DEFAULT NULL,
  `ticket_number` varchar(100) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `photo_path` varchar(500) DEFAULT NULL,
  `bill_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `pay_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_bill` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_pay` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `driver_id`, `date`, `truck_number`, `customer`, `job_type`, `ticket_number`, `quantity`, `photo_path`, `bill_rate`, `pay_rate`, `total_bill`, `total_pay`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-11-19', '9728', 'Aecon', 'Tri Endump Demo', '9109', 9.00, '/uploads/ticket-photo-1765882338190-385675101.png', 22144.00, 113.00, 199296.00, 1017.00, 'Approved', '2025-12-16 10:52:18', '2025-12-16 12:51:41'),
(2, 3, '2025-12-16', '#mp09', 'Aecon Construction', 'demo', '1', 9.00, '/uploads/ticket-photo-1765886949722-709036796.png', 136.00, 50.00, 1224.00, 450.00, 'Approved', '2025-12-16 12:09:09', '2025-12-16 12:18:02'),
(3, 1, '2025-09-10', '#mp10', 'Aecon Construction', 'Tri dmo', '#mp2025', 10.00, '/uploads/ticket-photo-1765887978468-763919297.png', 135.00, 26.00, 1350.00, 260.00, 'Pending', '2025-12-16 12:26:18', '2025-12-16 12:26:18');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','driver') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin@gmail.com', '$2a$12$Fle2katby6l8EuXWMHAJsObhowqWo6UZro/k8IGUx3.gmfmLs7h0q', 'admin', '2025-12-16 10:03:49', '2025-12-16 10:14:56'),
(2, 'driver_DRV001@trucking.com', '$2a$10$dMF7Gxmg9k7Ud3RjPmyvq.Ttr4NzmdiFFcmMbggP65H9Yh7QWJygS', 'driver', '2025-12-16 10:28:32', '2025-12-16 10:38:19'),
(4, 'driver_DRV002@trucking.com', '$2a$10$z1vFYSvAG/c1vuQkblhxzeQk0ZFJJ7qen6Y4BqXc.r.O1x9W5.y56', 'driver', '2025-12-16 11:57:21', '2025-12-16 11:57:37'),
(6, 'driver_DRV006@trucking.com', '$2a$10$XyakTVJ0V24CnFH.GSSMvOUH/nu8CF5.zlh2A4ZII57bryxmOndNK', 'driver', '2025-12-16 13:56:40', '2025-12-16 13:56:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id_code` (`user_id_code`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_user_id_code` (`user_id_code`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_driver_id` (`driver_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_customer` (`customer`),
  ADD KEY `idx_ticket_number` (`ticket_number`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
