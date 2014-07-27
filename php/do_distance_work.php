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
if($database->connect("127.0.01", $passwd[0], $passwd[1], "kattellaan") == true) {
	$distance = new distance($database);
	$distance_work = $distance->get_uncalculated();
	printf("%s\r\n", $distance_work);
	/*
	$r = 6378137;
	$distance->set_start();
	$distance->set_end();
	$distance->set_distance();
	if($distance->insert() == true) {
		printf("Distance successfully calculated.");
	} else {
		printf("Distance calculation failed.");
	}*/
} else {
	printf("Failed to connect to database\r\n");
}


?>
