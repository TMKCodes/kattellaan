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
	$account = array();
	$username = $usernames[$i];
	printf("Username: %s\r\n", $username);
	$account['username'] = $username;
	$account['address'] = "tmkcodes@gmx.com";
	$account['password'] = "ikaros123";
	$account['password-confirm'] = "ikaros123";
	
	// submit account form with GET to php/api.php
	
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
	
	$rsr = mt_rand(0, 7);
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

	$sxor = mt_rand(0, 3);
	switch($sxor) {
		case 0: $sxo = "hetero"; break;
		case 1: $sxo = "gay"; break;
		case 2: $sxo = "bi"; break;
		case 3: $sxo = "ase"; break;
	}
	printf("Sexual orientation %s\r\n", $sxo);

	$lfrc = mt_rand(1, 4);
	for($i = 0; $i <= $lfrc; $i++) {	
		$lfr = mt_rand(0, 4);
		switch($lfr) {
			case 0: $lf[$i] = "friends"; break;
			case 1: $lf[$i] = "love"; break;
			case 2: $lf[$i] = "date"; break;
			case 3: $lf[$i] = "sex"; break;
			case 4: $lf[$i] = "other"; break;
		}
	}
	$lf = array_values(array_unique($lf));
	$rlf = $lf[0];
	if(count($lf) > 1) {
		for($i = 1; $i < count($lf); $i++) {
			$rlf .= ", " . $lf[$i];
		}
	}
	printf("Looking for %s\r\n", $rlf);

	$height = mt_rand(130, 220);
	printf("Height %s\r\n", $height);
	
	$weight = mt_rand(30, 160);
	printf("Weight %s\r\n", $weight);

	$btyper = mt_rand(0, 7);
	switch($btyper) {
		case 0: $btype = "slender"; break;
		case 1: $btype = "slim"; break;
		case 2: $btype = "low-fat"; break;
		case 3: $btype = "sporty"; break;
		case 4: $btype = "muscular"; break;
		case 5: $btype = "roundish"; break;
		case 6: $btype = "overweight"; break;
		case 7: $btype = "none"; break;
	}
	printf("Body type %s\r\n", $btype);

	
	$ecr = mt_rand(0, 8);
	switch($ecr) {
		case 0: $eyecolor = "blue"; break;
		case 1: $eyecolor = "brown"; break;
		case 2: $eyecolor = "green"; break;
		case 3: $eyecolor = "gray"; break;
		case 4: $eyecolor = "amber"; break;
		case 5: $eyecolor = "hazel"; break;
		case 6: $eyecolor = "red"; break;
		case 7: $eyecolor = "violet"; break;
		case 8: $eyecolor = "none"; break;
	}
	printf("Eye color %s\r\n", $eyecolor);

	$hlr = mt_rand(0, 4);
	switch($hlr) {
		case 0: $hairlength = "bald"; break;
		case 1: $hairlength = "hedgehog"; break;
		case 2: $hairlength = "short"; break;
		case 3: $hairlength = "long"; break;
		case 4: $hairlength = "none"; break;
	}
	printf("Hair length %s\r\n", $hairlength);

	$hcr = mt_rand(0, 11);
	switch($hcr) {
		case 0: $haircolor = "verylight"; break;
		case 1: $haircolor = "light"; break;
		case 2: $haircolor = "lightbrown"; break;
		case 3: $haircolor = "brown"; break;
		case 4: $haircolor = "black"; break;
		case 5: $haircolor = "gray"; break;
		case 6: $haircolor = "red"; break;
		case 7: $haircolor = "pink"; break;
		case 8: $haircolor = "white"; break;
		case 9: $haircolor = "colorful"; break;
		case 10: $haircolor = "changeable"; break;
		case 11: $haircolor = "none"; break;
	}
	printf("Hair color %s\r\n", $haircolor);

	$kr = mt_rand(0, 13);
	switch($kr) {
		case 0: $kids = "yes"; break;
		case 1: $kids = "no"; break;
		case 2: $kids = "athome"; break;
		case 3: $kids = "somewhereelse"; break;
		case 4: $kids = "jointcustody"; break;
		case 5: $kids = "solecustody"; break;
		case 6: $kids = "iwantkids"; break;
		case 7: $kids = "idontwantkids"; break;
		case 8: $kids = "idontknowifiwantkids"; break;
		case 9: $kids = "kidsdonotmatter"; break;
		case 10: $kids = "weekendparent"; break;
		case 11: $kids = "secondweekendparent"; break;
		case 12: $kids = "monthlyparent"; break;
		case 13: $kids = "none"; break;
	}
	printf("Kids %s\r\n", $kids);

	$acr = mt_rand(0, 6);
	switch($acr) {
		case 0: $ac = "alone"; break;
		case 1: $ac = "withfriend"; break;
		case 2: $ac = "withparents"; break;
		case 3: $ac = "sharedflat"; break;
		case 4: $ac = "withparent"; break;
		case 5: $ac = "homeless"; break;
		case 6: $ac = "none"; break;
	}
	printf("Accomodation %s\r\n", $ac);


	$ethr = mt_rand(0, 7);
	switch($ethr) {
		case 0: $eth = "white"; break;
		case 1: $eth = "black"; break;
		case 2: $eth = "indian"; break;
		case 3: $eth = "latino"; break;
		case 4: $eth = "arab"; break;
		case 5: $eth = "asian"; break;
		case 6: $eth = "midget"; break;
		case 7: $eth = "none"; break;
	}
	printf("Ethnic identity %s\r\n", $eth);
	
	$langr = mt_rand(0, 7);
	switch($langr) {
		case 0: $lang = "finnish"; break;
		case 1: $lang = "swedish"; break;
		case 2: $lang = "english"; break;
		case 3: $lang = "russian"; break;
		case 4: $lang = "german"; break;
		case 5: $lang = "japanese"; break;
		case 6: $lang = "others"; break;
		case 7: $lang = "none"; break;
	}
	printf("Language skill %s\r\n", $lang);

	
	sleep(35);
}

?>
