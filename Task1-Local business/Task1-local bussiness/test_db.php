<?php
/**
 * test_db.php — Database Connection & Insert Tester
 * ──────────────────────────────────────────────────
 * Run this file at: http://localhost/brewhaven/test_db.php
 * It will tell you EXACTLY what is working and what is not.
 * DELETE this file after you fix the issue (security).
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
<!DOCTYPE html>
<html>
<head>
<title>Brew Haven — DB Test</title>
<style>
  body { font-family: sans-serif; padding: 40px; background: #fdf6ec; }
  h1   { color: #2c1810; }
  .box { padding: 16px 20px; border-radius: 8px; margin: 12px 0; font-size: 15px; }
  .ok  { background: #e8f5ee; border-left: 4px solid #2d7a4f; color: #1a4a30; }
  .err { background: #fde8e8; border-left: 4px solid #b33030; color: #6b1010; }
  .info{ background: #e8f0fe; border-left: 4px solid #3b5bdb; color: #1a2a6b; }
  pre  { background: #fff; padding: 12px; border-radius: 6px; overflow-x:auto; font-size:13px; }
  table{ border-collapse:collapse; width:100%; margin-top:12px; }
  th,td{ border:1px solid #ccc; padding:8px 12px; text-align:left; font-size:13px; }
  th   { background:#2c1810; color:#fff; }
  .btn { display:inline-block; padding:10px 22px; background:#a0522d; color:#fff;
         border-radius:6px; text-decoration:none; margin-top:16px; font-weight:600; }
</style>
</head>
<body>
<h1>☕ Brew Haven — Database Diagnostic Tool</h1>
<p style="color:#666;">This file tests every step of the booking system. Run it at <code>http://localhost/brewhaven/test_db.php</code></p>
<hr/>

<?php

// ══════════════════════════════════════════════════════
// TEST 1: PHP is working
// ══════════════════════════════════════════════════════
echo "<h2>Test 1 — PHP</h2>";
echo "<div class='box ok'>✅ PHP is working. Version: " . phpversion() . "</div>";

// ══════════════════════════════════════════════════════
// TEST 2: MySQL connection
// ══════════════════════════════════════════════════════
echo "<h2>Test 2 — MySQL Connection</h2>";

$host     = "localhost";
$username = "root";
$password = "";
$database = "brewhaven_db";

$conn = mysqli_connect($host, $username, $password, $database);

if (!$conn) {
    echo "<div class='box err'>
        ❌ <strong>MySQL connection FAILED</strong><br/>
        Error: " . mysqli_connect_error() . "<br/><br/>
        <strong>Fix:</strong> Make sure MySQL is running in XAMPP Control Panel.
    </div>";
    exit();
}
echo "<div class='box ok'>✅ Connected to MySQL successfully.</div>";

// ══════════════════════════════════════════════════════
// TEST 3: Database exists
// ══════════════════════════════════════════════════════
echo "<h2>Test 3 — Database 'brewhaven_db'</h2>";
$db_check = mysqli_select_db($conn, "brewhaven_db");
if (!$db_check) {
    echo "<div class='box err'>
        ❌ <strong>Database 'brewhaven_db' NOT found.</strong><br/>
        Go to <a href='http://localhost/phpmyadmin' target='_blank'>phpMyAdmin</a>
        → Import → select brewhaven.sql → Go.
    </div>";
    exit();
}
echo "<div class='box ok'>✅ Database 'brewhaven_db' exists.</div>";

// ══════════════════════════════════════════════════════
// TEST 4: Table exists and show its structure
// ══════════════════════════════════════════════════════
echo "<h2>Test 4 — Table 'bookings' Structure</h2>";
$table_check = mysqli_query($conn, "SHOW TABLES LIKE 'bookings'");
if (mysqli_num_rows($table_check) == 0) {
    echo "<div class='box err'>
        ❌ <strong>Table 'bookings' does NOT exist.</strong><br/>
        Go to phpMyAdmin → Import → select brewhaven.sql → Go.
    </div>";
    exit();
}
echo "<div class='box ok'>✅ Table 'bookings' exists.</div>";

// Show exact column structure
$desc = mysqli_query($conn, "DESCRIBE bookings");
echo "<div class='box info'>ℹ️ <strong>Your table columns (must match booking.php exactly):</strong>
<table>
<tr><th>Column Name</th><th>Type</th><th>Null</th><th>Default</th></tr>";
$columns = [];
while ($row = mysqli_fetch_assoc($desc)) {
    echo "<tr>
        <td><strong>{$row['Field']}</strong></td>
        <td>{$row['Type']}</td>
        <td>{$row['Null']}</td>
        <td>{$row['Default']}</td>
    </tr>";
    $columns[] = $row['Field'];
}
echo "</table></div>";

// Check required columns exist
$required = ['id','name','phone','guests','booking_date','booking_time','message','status','created_at'];
$missing  = array_diff($required, $columns);
if (!empty($missing)) {
    echo "<div class='box err'>
        ❌ <strong>Missing columns:</strong> " . implode(', ', $missing) . "<br/>
        Re-import brewhaven.sql in phpMyAdmin to fix this.
    </div>";
} else {
    echo "<div class='box ok'>✅ All required columns are present.</div>";
}

// ══════════════════════════════════════════════════════
// TEST 5: Try a real INSERT with sample data
// ══════════════════════════════════════════════════════
echo "<h2>Test 5 — Insert a Test Booking</h2>";

$test_name    = "Test User";
$test_phone   = "9876543210";
$test_guests  = "2";
$test_date    = date('Y-m-d', strtotime('+1 day')); // tomorrow
$test_time    = "18:00";
$test_message = "This is a test booking from test_db.php";

$sql  = "INSERT INTO bookings (name, phone, guests, booking_date, booking_time, message)
         VALUES (?, ?, ?, ?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
    echo "<div class='box err'>
        ❌ <strong>mysqli_prepare() failed.</strong><br/>
        MySQL Error: " . mysqli_error($conn) . "<br/><br/>
        This usually means the column names in the SQL don't match the table.
    </div>";
    exit();
}

mysqli_stmt_bind_param($stmt, "ssssss",
    $test_name, $test_phone, $test_guests,
    $test_date, $test_time, $test_message
);

$result = mysqli_stmt_execute($stmt);

if ($result) {
    $new_id = mysqli_stmt_insert_id($stmt);
    echo "<div class='box ok'>
        ✅ <strong>Test booking inserted successfully!</strong><br/>
        New row ID: <strong>$new_id</strong><br/>
        Data saved: $test_name | $test_phone | $test_guests guests | $test_date | $test_time
    </div>";
} else {
    echo "<div class='box err'>
        ❌ <strong>INSERT failed.</strong><br/>
        MySQL Error: " . mysqli_stmt_error($stmt) . "<br/><br/>
        <strong>Common causes:</strong><br/>
        • Data too long for a column<br/>
        • Wrong date/time format<br/>
        • Column type mismatch
    </div>";
}
mysqli_stmt_close($stmt);

// ══════════════════════════════════════════════════════
// TEST 6: Read back all rows
// ══════════════════════════════════════════════════════
echo "<h2>Test 6 — All Bookings in Database</h2>";
$rows = mysqli_query($conn, "SELECT * FROM bookings ORDER BY created_at DESC");
$count = mysqli_num_rows($rows);

if ($count == 0) {
    echo "<div class='box err'>⚠️ No bookings found — even the test insert above didn't save. Something is seriously wrong with the table.</div>";
} else {
    echo "<div class='box ok'>✅ Found <strong>$count</strong> booking(s) in the database.</div>";
    echo "<table>
        <tr>
            <th>ID</th><th>Name</th><th>Phone</th><th>Guests</th>
            <th>Date</th><th>Time</th><th>Message</th><th>Status</th><th>Created</th>
        </tr>";
    while ($row = mysqli_fetch_assoc($rows)) {
        echo "<tr>
            <td>{$row['id']}</td>
            <td>{$row['name']}</td>
            <td>{$row['phone']}</td>
            <td>{$row['guests']}</td>
            <td>{$row['booking_date']}</td>
            <td>{$row['booking_time']}</td>
            <td>{$row['message']}</td>
            <td>{$row['status']}</td>
            <td>{$row['created_at']}</td>
        </tr>";
    }
    echo "</table>";
}

mysqli_close($conn);

// ══════════════════════════════════════════════════════
// TEST 7: Check booking.php file exists
// ══════════════════════════════════════════════════════
echo "<h2>Test 7 — File Check</h2>";
$files = ['index.html','style.css','script.js','booking.php','db.php','brewhaven.sql'];
echo "<table><tr><th>File</th><th>Status</th><th>Size</th></tr>";
foreach ($files as $f) {
    $exists = file_exists($f);
    $size   = $exists ? filesize($f) . ' bytes' : '—';
    $icon   = $exists ? '✅' : '❌';
    $color  = $exists ? '#2d7a4f' : '#b33030';
    echo "<tr>
        <td><code>$f</code></td>
        <td style='color:$color;font-weight:600;'>$icon " . ($exists ? 'Found' : 'MISSING') . "</td>
        <td>$size</td>
    </tr>";
}
echo "</table>";

?>

<hr/>
<h2>✅ What To Do Next</h2>
<div class="box info">
    <strong>If all tests passed (all green):</strong><br/>
    → The database works fine. The issue is in booking.php or the form. Replace booking.php with the latest version.<br/><br/>
    <strong>If Test 5 failed (INSERT failed):</strong><br/>
    → Re-import brewhaven.sql in phpMyAdmin and try again.<br/><br/>
    <strong>If Test 2 failed (connection failed):</strong><br/>
    → Start MySQL in XAMPP Control Panel.<br/><br/>
    <strong>After fixing everything:</strong><br/>
    → Delete this test_db.php file from your project folder (don't leave it on a live site).
</div>

<a class="btn" href="index.html">← Back to Website</a>
<a class="btn" href="test_db.php" style="background:#3b5bdb;margin-left:10px;">🔄 Run Tests Again</a>

</body>
</html>