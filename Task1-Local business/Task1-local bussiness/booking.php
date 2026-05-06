<?php
/**
 * booking.php — Brew Haven Café Booking Handler (FINAL FIXED)
 * ─────────────────────────────────────────────────────────────
 * Validations fixed:
 *  - Phone: EXACTLY 10 digits, must start with 6/7/8/9 (Indian numbers)
 *  - Date:  Must be STRICTLY future — today + past are both BLOCKED
 *  - Date:  Cannot be more than 90 days ahead
 *  - Name:  At least 2 characters
 *  - All fields: required check
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit();
}

require_once 'db.php';

// Collect and clean inputs
$name    = trim($_POST['name']    ?? '');
$phone   = trim($_POST['phone']   ?? '');
$guests  = trim($_POST['guests']  ?? '');
$date    = trim($_POST['date']    ?? '');
$time    = trim($_POST['time']    ?? '');
$message = trim($_POST['message'] ?? '');

// Strip non-digit characters from phone
$phone = preg_replace('/[^0-9]/', '', $phone);

// ── VALIDATION ────────────────────────────────────────────────
$errors = [];

// Name: at least 2 chars
if (strlen($name) < 2) {
    $errors[] = "Full name must be at least 2 characters.";
}

// Phone: EXACTLY 10 digits, Indian mobile (starts with 6,7,8,9)
if (strlen($phone) === 0) {
    $errors[] = "Phone number is required.";
} elseif (strlen($phone) !== 10) {
    $errors[] = "Phone must be exactly 10 digits. You entered " . strlen($phone) . " digit(s).";
} elseif (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {
    $errors[] = "Enter a valid Indian mobile number (must start with 6, 7, 8 or 9).";
}

// Guests: must be valid option
$valid_guests = ['1','2','3','4','5','6','7+'];
if (!in_array($guests, $valid_guests)) {
    $errors[] = "Please select a valid number of guests.";
}

// Date: MUST be a FUTURE date — today and past are BLOCKED
if (empty($date)) {
    $errors[] = "Booking date is required.";
} else {
    $selected_ts = strtotime($date);
    $today_ts    = mktime(0, 0, 0, date('n'), date('j'), date('Y')); // today midnight
    $max_ts      = strtotime('+90 days');

    if ($selected_ts === false) {
        $errors[] = "Invalid date format.";
    } elseif ($selected_ts <= $today_ts) {
        // <= means today is also blocked, only tomorrow onwards allowed
        $errors[] = "Booking date must be a future date. Today's and past dates are not accepted.";
    } elseif ($selected_ts > $max_ts) {
        $errors[] = "Bookings can only be made up to 90 days in advance.";
    }
}

// Time: required
if (empty($time)) {
    $errors[] = "Please select a preferred time.";
}

// ── If errors found — show them clearly ──────────────────────
if (!empty($errors)) {
    echo "<!DOCTYPE html><html><head><title>Booking Error</title>
    <style>
      body{font-family:sans-serif;padding:40px;background:#fdf6ec;}
      h2{color:#b33030;}
      ul{background:#fde8e8;border-left:4px solid #b33030;padding:20px 20px 20px 40px;border-radius:8px;}
      li{color:#6b1010;margin:8px 0;font-weight:600;}
      .data{background:#fff;padding:16px;border-radius:8px;margin:16px 0;font-family:monospace;font-size:13px;}
      a{display:inline-block;margin-top:16px;padding:12px 28px;background:#a0522d;
        color:#fff;border-radius:6px;text-decoration:none;font-weight:600;}
    </style></head><body>
    <h2>❌ Booking Not Submitted — Please Fix These Errors:</h2>
    <ul>";
    foreach ($errors as $e) echo "<li>$e</li>";
    echo "</ul>
    <div class='data'>
      <strong>What you submitted:</strong><br/>
      Name: " . htmlspecialchars($name) . "<br/>
      Phone: " . htmlspecialchars($phone) . " (" . strlen($phone) . " digits)<br/>
      Guests: " . htmlspecialchars($guests) . "<br/>
      Date: " . htmlspecialchars($date) . "<br/>
      Time: " . htmlspecialchars($time) . "
    </div>
    <a href='javascript:history.back()'>← Go Back & Fix</a>
    </body></html>";
    exit();
}

// ── INSERT into database ──────────────────────────────────────
$sql  = "INSERT INTO bookings (name, phone, guests, booking_date, booking_time, message)
         VALUES (?, ?, ?, ?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
    die("<h2 style='color:red;font-family:sans-serif;padding:40px;'>
        ❌ Database error: " . mysqli_error($conn) . "
        <br/><a href='index.html#booking'>← Go Back</a></h2>");
}

mysqli_stmt_bind_param($stmt, "ssssss", $name, $phone, $guests, $date, $time, $message);
$result = mysqli_stmt_execute($stmt);

if ($result) {
    $new_id = mysqli_stmt_insert_id($stmt);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    header("Location: index.html?status=success&id=" . $new_id . "#booking");
    exit();
} else {
    $err = mysqli_stmt_error($stmt);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    die("<div style='font-family:sans-serif;padding:40px;'>
        <h2 style='color:red;'>❌ Could not save booking.</h2>
        <p>MySQL Error: $err</p>
        <a href='index.html#booking' style='background:#a0522d;color:#fff;
        padding:10px 20px;border-radius:6px;text-decoration:none;'>← Go Back</a></div>");
}
?>