<?php
/**
 * @author Myxo victor
 * Venjs v4.1 Notification Handler
 * * This script receives device subscription data from the Venjs framework 
 * and stores it in a secure text file for later use in server-side push.
 */

// --- SECURITY HEADERS ---
// Allow cross-origin requests (CORS) if your frontend is on a different domain
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- DATA PROCESSING ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw JSON data sent by venjs.notification.ask()
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate that we have a deviceId
    if (isset($data['deviceId']) && !empty($data['deviceId'])) {
        
        $deviceId  = htmlspecialchars($data['deviceId']);
        $type      = isset($data['type']) ? htmlspecialchars($data['type']) : 'unknown';
        $timestamp = date("Y-m-d H:i:s");
        $ipAddress = $_SERVER['REMOTE_ADDR'];
        $userAgent = $_SERVER['HTTP_USER_AGENT'];

        // Format the entry for the log file
        $logEntry = "------------------------------------------------" . PHP_EOL;
        $logEntry .= "Date: $timestamp" . PHP_EOL;
        $logEntry .= "Device ID: $deviceId" . PHP_EOL;
        $logEntry .= "Type: $type" . PHP_EOL;
        $logEntry .= "IP: $ipAddress" . PHP_EOL;
        $logEntry .= "User Agent: $userAgent" . PHP_EOL;

        // Path to your repository's text file
        $filePath = 'notification_handler.txt';

        /**
         * SAVE TO FILE
         * FILE_APPEND: Don't overwrite, add to the end.
         * LOCK_EX: Prevent other scripts from writing at the same exact millisecond.
         */
        if (file_put_contents($filePath, $logEntry, FILE_APPEND | LOCK_EX)) {
            echo json_encode([
                "status" => "success",
                "code" => 200,
                "message" => "Device successfully registered to Venjs ecosystem."
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "code" => 500,
                "message" => "Failed to write to notification_handler.txt. Check folder permissions."
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "code" => 400,
            "message" => "Invalid payload. 'deviceId' is required."
        ]);
    }
} else {
    // If someone tries to access this file directly via a browser (GET)
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "code" => 405,
        "message" => "Method Not Allowed. Use POST via Venjs framework."
    ]);
}
?>
