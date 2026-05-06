<?php
/**
 * db.php — Database Connection
 * ─────────────────────────────────────────────────────────
 * This file connects PHP to MySQL.
 * Include it in any PHP file that needs the database with:
 *   require_once 'db.php';
 * ─────────────────────────────────────────────────────────
 */

// Your database settings (XAMPP defaults — don't change)
$host     = "localhost";     // Always localhost for XAMPP
$username = "root";          // Default XAMPP MySQL username
$password = "";              // Default XAMPP password is EMPTY
$database = "brewhaven_db";  // The database you'll create in Step 4

// Connect to MySQL
$conn = mysqli_connect($host, $username, $password, $database);

// If connection fails, show a helpful error message
if (!$conn) {
    die("
        <div style='font-family:sans-serif;padding:40px;color:red;'>
            <h2>❌ Database Connection Failed</h2>
            <p><strong>Error:</strong> " . mysqli_connect_error() . "</p>
            <p>✅ Fix: Make sure MySQL is running in XAMPP Control Panel.</p>
            <p>✅ Fix: Make sure you created 'brewhaven_db' in phpMyAdmin.</p>
        </div>
    ");
}

// Set UTF-8 encoding so names/messages with special characters work
mysqli_set_charset($conn, "utf8mb4");

// If we reach here — connection is successful!
// $conn is now ready to use in booking.php
?>