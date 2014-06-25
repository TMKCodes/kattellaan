<?php

require_once("dbwrapper/db.php");
require_once("account.php");
require_once("profile.php");
require_once("position.php");
require_once("distance.php");

$usernames = explode("\n", file_get_contents(__DIR__."/../lists/random-usernames.txt"));
$male_names = explode("\n", file_get_contents(__DIR__."/../lists/male-names.txt"));
$female_names = explode("\n", file_get_contents(__DIR__."/../lists/female-names.txt"));
$lastnames = explode("\n", file_get_contents(__DIR__."/../lists/lastnames.txt"));

$usernames_count = count($usernames);
$male_names_count = count($male_names);
$female_names_count = count($female_names);
$lastnames_count = count($lastnames);

$passwd = explode(":", base64_decode(file_get_contents("/home/temek/kattellaan/.passwd")));
$database = new db("mysqli");
if($database->connect("127.0.0.1", $passwd[0], $passwd[1], "kattellaan") == true) {
	for($i = 0; $i < $usernames_count; $i++) {
		$account = array();
		$username = $usernames[$i];
		$account['username'] = $username;
		$account['address'] = "tmkcodes@gmx.com";
		$account['password'] = "ikaros123";
		$account['password-confirm'] = "ikaros123";
		
		// submit account form with GET to php/api.php

		$profile = array();
		
		$rlastname = mt_rand(0, $lastnames_count-1);
		$lastname = $lastnames[$rlastname];

		$latitude = mt_rand(600000000, 700000000) / 10000000;
		$longitude = mt_rand(200000000, 320000000) / 10000000;
		$profile['latlng'] = "(".$latitude.", ".$longitude.")"; 
		$google_geocode_reply = file_get_contents("http://maps.googleapis.com/maps/api/geocode/json?latlng=" . $latitude . "," . $longitude . "&sensor=true");
		$google_geocode_reply = json_decode($google_geocode_reply, true);
		if($google_geocode_reply['status'] == "OK") {
			$address = $google_geocode_reply['results'][0]['formatted_address'];
			$profile['address'] = $address;
		} else {
			$i--;
			continue;
		}

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
		$profile['gender'] = $gender;
		
		if($gender == "woman") {
			$rfemale_name = mt_rand(0, $female_names_count-1);
			$name = $female_names[$rfemale_name];
		} else {
			$rmale_name = mt_rand(0, $male_names_count-1);
			$name = $male_names[$rmale_name];
		}
		$name = $name . " " . $lastname;
		$profile['name'] = $name;
		
		
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
		$profile['birthday'] = $age;
		
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
		$profile['relationship_status'] = $relstatus;

		$sxor = mt_rand(0, 3);
		switch($sxor) {
			case 0: $sxo = "hetero"; break;
			case 1: $sxo = "gay"; break;
			case 2: $sxo = "bi"; break;
			case 3: $sxo = "ase"; break;
		}
		$profile['sexual_orientation'] = $sxo;

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
		$profile['looking_for'] = $rlf;

		$height = mt_rand(130, 220);
		$profile['height'] = $height;

		$weight = mt_rand(30, 160);
		$profile['weight'] = $weight;

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
		$profile['body_type'] = $btype;
		
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
		$profile['eye_color'] = $eyecolor;

		$hlr = mt_rand(0, 4);
		switch($hlr) {
			case 0: $hairlength = "bald"; break;
			case 1: $hairlength = "hedgehog"; break;
			case 2: $hairlength = "short"; break;
			case 3: $hairlength = "long"; break;
			case 4: $hairlength = "none"; break;
		}
		$profile['hair_length'] = $hairlength;

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
		$profile['hair_color'] = $haircolor;

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
		$profile['kids'] = $kids;

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
		$profile['accomodation'] = $ac;

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
		$profile['ethnic_identity'] = $eth;

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
		$profile['language_skills'] = $lang;
		
		$edur = mt_rand(0, 9);
		switch($edur) {
			case 0: $edu = "untrained"; break;
			case 1: $edu = "lifeschool"; break;
			case 2: $edu = "school"; break;
			case 3: $edu = "vocational"; break;
			case 4: $edu = "high"; break;
			case 5: $edu = "applied"; break;
			case 6: $edu = "colloege"; break;
			case 7: $edu = "masters"; break;
			case 8: $edu = "doctor"; break;
			case 9: $edu = "none"; break;
		}
		$profile['education'] = $edu;

		$worr = mt_rand(0, 9);
		switch($worr) {
			case 0: $work = "unemployed"; break;
			case 1: $work = "student"; break;
			case 2: $work = "part-time"; break;
			case 3: $work = "morning"; break;
			case 4: $work = "day"; break;
			case 5: $work = "evening"; break;
			case 6: $work = "night"; break;
			case 7: $work = "workaholic"; break;
			case 8: $work = "pension"; break;
			case 9: $work = "none"; break;
		}	
		$profile['work'] = $work;

		$income = mt_rand(0, 1000000);
		$profile['income'] = $income;

		$vocationr = mt_rand(0, 10);
		switch($vocationr) {
			case 0: $vocation = "administration/finance"; break;
			case 1: $vocation = "information-technology"; break;
			case 2: $vocation = "social/health"; break;
			case 3: $vocation = "communications/media/culture"; break;
			case 4: $vocation = "marketing/sales"; break;
			case 5: $vocation = "science/technology"; break;
			case 6: $vocation = "education"; break;
			case 7: $vocation = "housewife/-husband"; break;
			case 8: $vocation = "agriculture-forestry"; break;
			case 9: $vocation = "entrepreneur"; break;
			case 10: $vocation = "none"; break;
		}
		$profile['vocation'] = $vocation;

		$dress_style_r = mt_rand(0, 12);
		switch($dress_style_r) {
			case 1: $dress_style = "fashionable"; break;
			case 2: $dress_style = "business"; break;
			case 3: $dress_style = "sporty"; break;
			case 4: $dress_style = "classic"; break;
			case 5: $dress_style = "fleamarket"; break;
			case 6: $dress_style = "self-indulgent"; break;
			case 7: $dress_style = "regular"; break;
			case 8: $dress_style = "hoppers"; break;
			case 9: $dress_style = "rocker"; break;
			case 10: $dress_style = "goth"; break;
			case 11: $dress_style = "allthesame"; break;
			case 12: $dress_style = "nudist"; break;
			case 0: $dress_style = "none"; break;
		}
		$profile['dress_style'] = $dress_style;
		
		$smoking_r = mt_rand(0, 5);
		switch($smoking_r) {
			case 0: $smoking = "smokeless"; break;
			case 1: $smoking = "company"; break;
			case 2: $smoking = "drunken"; break;
			case 3: $smoking = "regular"; break;
			case 4: $smoking = "chimney"; break;
			case 5: $smoking = "none"; break;
		}
		$profile['smoking'] = $smoking;

		$alcohol_r = mt_rand(0, 10);
		switch($alcohol_r) {
			case 0: $alcohol = "alcohol-free"; break;
			case 1: $alcohol = "holidays"; break;
			case 2: $alcohol = "company"; break;
			case 3: $alcohol = "withfood"; break;
			case 4: $alcohol = "occasionally"; break;
			case 5: $alcohol = "everyday"; break;
			case 6: $alcohol = "weekly"; break;
			case 7: $alcohol = "monthly"; break;
			case 8: $alcohol = "yearly"; break;
			case 9: $alcohol = "alcoholic"; break;
			case 10: $alcohol = "none"; break;
		}
		$profile['alcohol'] = $alcohol;
		
		$pet_r = mt_rand(0, 13);
		switch($pet_r) {
			case 0: $pet = "horse"; break;
			case 1: $pet = "pony"; break;
			case 2: $pet = "spider"; break;
			case 3: $pet = "fish"; break;
			case 4: $pet = "rodent"; break;
			case 5: $pet = "turtle"; break;
			case 6: $pet = "dog"; break;
			case 7: $pet = "cat"; break;
			case 8: $pet = "snake"; break;
			case 9: $pet = "bird"; break;
			case 10: $pet = "stuffed-animal"; break;
			case 11: $pet = "nopets"; break;
			case 12: $pet = "likepets"; break;
			case 13: $pet = "none"; break;
		}
		$profile['pets'] = $pet;

		$exercise_r = mt_rand(0, 4);
		switch($exercise_r) {
			case 0: $exercise = "idont"; break;
			case 1: $exercise = "casually"; break;
			case 2: $exercise = "regularly"; break;
			case 3: $exercise = "daily"; break;
			case 4: $exercise = "none"; break;
		}
		$profile['exercise'] = $exercise;

		$travel_r = mt_rand(0, 8);
		switch($travel_r) {
			case 0: $travel = "cottagebatty"; break;
			case 1: $travel = "neighboring-areas"; break;
			case 2: $travel = "occasionally"; break;
			case 3: $travel = "few-times-a-year"; break;
			case 4: $travel = "monthly"; break;
			case 5: $travel = "weekly"; break;
			case 6: $travel = "daily"; break;
			case 7: $travel = "allthetime"; break;
			case 8: $travel = "none"; break;
		}
		$profile['travel'] = $travel;
		
		$religion_r = mt_rand(0, 8);
		switch($religion_r) {
			case 0: $religion = "atheist"; break;
			case 1: $religion = "agnostic"; break;
			case 2: $religion = "buddhism"; break;
			case 3: $religion = "christian"; break;
			case 4: $religion = "hinduism"; break;
			case 5: $religion = "muslism"; break;
			case 6: $religion = "jewish"; break;
			case 7: $religion = "newage"; break;
			case 8: $religion = "none"; break;
		}
		$profile['religion'] = $religion;
		
		$relimp_r = mt_rand(0, 5);
		switch($relimp_r) {
			case 0: $relimp = "insignificant"; break;
			case 1: $relimp = "low"; break;
			case 2: $relimp = "normal"; break;
			case 3: $relimp = "important"; break;
			case 4: $relimp = "true-blue"; break;
			case 5: $relimp = "none"; break;
		}
		$profile['religion_importance'] = $relimp;
		
		$lrpol_r = mt_rand(0, 7);
		switch($lrpol_r) {
			case 0: $lr = "left"; break;
			case 1: $lr = "moderateleft"; break;
			case 2: $lr = "inbetween"; break;
			case 3: $lr = "moderateright"; break;
			case 4: $lr = "right"; break;
			case 5: $lr = "dontknow"; break;
			case 6: $lr = "dontcare"; break;
			case 7: $lr = "none"; break;
		}
		$profile['left_right_politics'] = $lr;

		$cp_r = mt_rand(0, 7);
		switch($cp_r) {
			case 0: $cp = "conservative"; break;
			case 1: $cp = "ratherconservative"; break;
			case 2: $cp = "inbetween"; break;
			case 3: $cp = "ratherliberal"; break;
			case 4: $cp = "liberal"; break;
			case 5: $cp = "dontknow"; break;
			case 6: $cp = "dontcare"; break;
			case 7: $cp = "none"; break;
		}
		$profile['liberal_conservative_politics'] = $cp;
		
		$pi_r = mt_rand(0, 4);
		switch($pi_r) {
			case 0: $pi = "dontcare"; break;
			case 1: $pi = "title-follow"; break;
			case 2: $pi = "active-follow"; break;
			case 3: $pi = "involved"; break;
			case 4: $pi = "none"; break;
		}
		$profile['political_importance'] = $pi;

		$profile['favorite_television_series'] = "";
		$profile['favorite_radio_shows'] = "";
		$profile['favorite_bands'] = "";
		$profile['favorite_movies'] = "";
		$profile['best_things_in_the_world'] = "";
		$profile['ignite_me'] = "";
		$profile['not_exciting'] = "";
			
		//print_r($account);
		//print_r($profile);

		$dbaccount = new account($database);
		$dbaccount->set_username($account['username']);
		$dbaccount->set_address($account['address']);
		$dbaccount->set_password(hash("sha512", $account['password']));
		if($dbaccount->insert() == true) {
			$profile['identifier'] = $dbaccount->get_identifier();
			$dbprofile = new profile($database);
			$dbprofile->set($profile);
			if($dbprofile->insert() == true) {
				$position = new position($database);
				$latlng = $dbprofile->strip_latlng($profile['latlng']);
				$position->set_latitude($latlng[0]);
				$position->set_longitude($latlng[0]);
				if($position->insert() == true) {
					printf("Successfully generated user %s.\r\n", $account['username']);
				} else {
					printf("Failed to save position %s to database.\r\n", $account['username']);
				}		
			} else {
				printf("Failed to save profile %s to database.\r\n", $account['username']);
			}
		} else {
			printf("Failed to save account %s to database.\r\n", $account['username']);
		}
		unset($dbaccount);
		unset($dbprofile);
		unset($position);	
		sleep(35);
	}
}
?>
