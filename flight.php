<?php
/**
 * Flight - The Ven.js Serverless Bridge
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Empty Request"]);
    exit;
}

$db = $input['config'];
$action = $input['action'];
$table = preg_replace('/[^a-zA-Z0-9_]/', '', $input['table']);
$data = $input['data'];
$id = $input['id'];

try {
    $dsn = "mysql:host={$db['host']};dbname={$db['name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $res = ["success" => true];

    switch ($action) {
        case 'fetch':
            $stmt = $pdo->query("SELECT * FROM $table");
            $res['data'] = $stmt->fetchAll();
            break;
            
        case 'send':
            $cols = implode(",", array_keys($data));
            $vals = ":" . implode(",:", array_keys($data));
            $stmt = $pdo->prepare("INSERT INTO $table ($cols) VALUES ($vals)");
            $stmt->execute($data);
            $res['id'] = $pdo->lastInsertId();
            break;

        case 'delete':
            $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->execute([$id]);
            break;

        case 'update':
            $sets = [];
            foreach ($data as $key => $val) $sets[] = "$key = :$key";
            $stmt = $pdo->prepare("UPDATE $table SET " . implode(",", $sets) . " WHERE id = :id");
            $data['id'] = $id;
            $stmt->execute($data);
            break;
    }

    echo json_encode($res);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
