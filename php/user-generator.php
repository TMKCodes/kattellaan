<?php
	
$usernames = explode("\n", file_get_contents(__DIR__."/../lists/random-usernames.txt"));
$male_names = explode("\n", file_get_contents(__DIR__."/../lists/male-names.txt"));
$female_names = explode("\n", file_get_contents(__DIR__."/../lists/female-names.txt"));
$lastnames = explode("\n", file_get_contents(__DIR__."/../lists/lastnames.txt"));

$usernames_count = count($usernames);
$male_names_count = count($male_names);
$female_names_count = count($female_names);
$lastnames_count = count($lastnames);

for($i = 0; $i < $usernames_count; $i++) {
	$username = $usernames[$i];
	printf("Username: %s\r\n", $username);
		
	$rgender = mt_rand(0, 1);
	if($rgender == 0) {
		$gender = "man";
		$rname = mt_rand(0, $male_names_count-1);
		$name = $male_names[$rname];
	} else if($rgender == 1) {
		$gender = "woman";
		$rname = mt_rand(0, $female_names_count-1);
		$name = $female_names[$rname];
	}
	printf("Gender: %s\r\n", $gender);
	
	$rlastname = mt_rand(0, $lastnames_count-1);
	$lastname = $lastnames[$rlastname];
	$name = $name . " " . $lastname;
	printf("Name: %s\r\n", $name);
	
	$latitude = mt_rand(600000000, 700000000) / 10000000;
	$longitude = mt_rand(200000000, 320000000) / 10000000;
	printf("Latitude: %s\r\nLongitude: %s\r\n", $latitude, $longitude);
	
	$google_geocode_reply = file_get_contents("http://maps.googleapis.com/maps/api/geocode/json?latlng=" . $latitude . "," . $longitude . "&sensor=true");
	$google_geocode_reply = json_decode($google_geocode_reply, true);
	if($google_geocode_reply['status'] == "OK") {
		$address = $google_geocode_reply['results'][0]['formatted_address'];
		printf("Address: %s\r\n", $address);		
	} else {
		$i--;
		continue;
	}
	
	$age_min = 18;
	$age_max = 100;
	$day = mt_rand(0,31);
	$month = mt_rand(0,12);
	$year = 2014 - mt_rand($age_min, $age_max);
	if($month < 10) {
		$month = "0" . $month;
	}
	if($day < 10) {
		$day = "0" . $day;
	}
	$age = $year . "-" . $month . "-" . $day;	
	printf("Age %s\r\n", $age);
	
	$rsr = mt_rand(0, 8);
	switch($rsr) {
		case 0: $relstatus = "single"; break;
		case 1: $relstatus = "relationship"; break;
		case 2: $relstatus = "cohabitation"; break;
		case 3: $relstatus = "marriage"; break;
		case 4: $relstatus = "divorce"; break;
		case 5: $relstatus = "seperation"; break;
		case 6: $relstatus = "widow"; break;
		case 7: $relstatus = "none"; break;
	}
	printf("Relationship status %s\r\n", $relstatus);
	sleep(35);
}

?>
