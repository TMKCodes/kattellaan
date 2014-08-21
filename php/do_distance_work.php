<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('max_execution_time', 120);

require_once("dbwrapper/db.php");
require_once("position.php");
require_once("distance.php");

function rad($x) {
	return $x * pi() / 180;
}

$passwd = explode(":", base64_decode(file_get_contents("/home/temek/kattellaan/.passwd")));
$database = new db("mysqli");
if($database->connect("127.0.0.1", $passwd[0], $passwd[1], "kattellaan") == true) {
	$distance = new distance($database);
	$distance_work = $distance->get_uncalculated();
	printf("%s\r\n", $distance_work);
	if($distance_work != false) {	
		$completed = false;
		$r = 6378137;
		$dLat = rad($distance_work['end']['latitude'] - $distance_work['start']['latitude']);
		$dLong = rad($distance_work['end']['longitude'] - $distance_work['end']['longitude']);
		$a = sin($dLat / 2) * sin($dLat / 2) + cos(rad($distance_work['start']['latitude'])) * cos(rad($distance_work['end']['latitude'])) * sin($dLong / 2) * sin($dLong / 2);
		$c = 2 * atan2(sqrt($a), sqrt(1 - $a));
		$d = $r * $c;

		$distance->set_start($distance_work['start']['identifier']);
		$distance->set_end($distance_work['end']['identifier']);
		$distance->set_identifier(null);
		$distance->set_distance($d);
		
		// printf("Distance:\r\nStart: %s\r\nEnd: %s\r\n", $distance->get_start(), $distance->get_end());
		try {
			if($distance->insert() == true) {
				printf("Distance successfully calculated.\r\n");
			}
		} catch (Exception $e) {
			
		}

	}
} else {
	printf("Failed to connect to database\r\n");
}

?>
