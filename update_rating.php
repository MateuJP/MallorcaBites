<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['firaId']) && isset($_POST['rating'])) {
        $firaId = $_POST['firaId'];
        $ratingValue = $_POST['rating'];
        if (!empty($firaId) && !empty($ratingValue)) {
            $file = './assets/Fires.json';

            if (file_exists($file)) {
                $jsonString = file_get_contents($file);
                $events = json_decode($jsonString, true);
                foreach ($events['itemListElement'] as &$event) {

                    if ($event['@identifier'] == intval($firaId)) {
                        $aggregateRating = &$event['aggregateRating'];
                        foreach ($aggregateRating as &$rating) {
                            if ($rating['ratingValue'] == $ratingValue) {
                                $value = intval($rating['reviewCount']) + 1;
                                var_dump(strval($value));
                                $rating['reviewCount'] = strval($value);
                            }
                        }
                        file_put_contents($file, json_encode($events, JSON_PRETTY_PRINT));
                        http_response_code(200);

                        exit;
                    }
                }
                http_response_code(404);
            } else {
                http_response_code(404);
            }
        } else {
            http_response_code(400);
        }
    } else {
        http_response_code(400);
    }
} else {
    http_response_code(400);
}
