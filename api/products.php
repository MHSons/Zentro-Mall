// File: api/products.php
// API endpoint to fetch product data from the database.

header('Content-Type: application/json; charset=utf-8');
include('../db_connect.php'); // Include the database connection file

$response = [];

// Get filter and sort parameters from the request (sent by products.js)
$category = $_GET['category'] ?? 'all';
$max_price = $_GET['maxPrice'] ?? 500000;
$sort_by = $_GET['sortBy'] ?? 'default';

// Base SQL Query
$sql = "SELECT id, name, price, category, stock_quantity, image_url FROM products WHERE 1=1";

// 1. Apply Category Filter
if ($category != 'all' && !empty($category)) {
    // Escaping the input for security (Prepared Statements should be used in production!)
    $clean_category = $conn->real_escape_string($category); 
    $sql .= " AND category = '$clean_category'";
}

// 2. Apply Price Filter
// Max price is sanitized to ensure it's a number
$clean_max_price = (int)$max_price;
$sql .= " AND price <= $clean_max_price";

// 3. Apply Sorting
switch ($sort_by) {
    case 'price-asc':
        $sql .= " ORDER BY price ASC";
        break;
    case 'price-desc':
        $sql .= " ORDER BY price DESC";
        break;
    case 'name-asc':
        $sql .= " ORDER BY name ASC";
        break;
    default:
        $sql .= " ORDER BY id DESC"; // Newest products first
}

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $products = [];
    while($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'price' => (float)$row['price'],
            'category' => $row['category'],
            'stock' => (int)$row['stock_quantity'],
            'img' => $row['image_url']
            // Note: Rating and more details would be pulled in a real app
        ];
    }
    $response['success'] = true;
    $response['data'] = $products;
} else {
    $response['success'] = false;
    $response['message'] = 'No products found.';
    $response['data'] = [];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE); // Keep Urdu characters intact
$conn->close();
?>
