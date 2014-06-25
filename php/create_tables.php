<?php
ini_set('display_startup_errors',1);
ini_set('display_errors',1);
error_reporting(-1);

require_once("dbwrapper/db.php");
require_once("account.php");
require_once("session.php");
require_once("invite.php");
require_once("file.php");
require_once("profile.php");
require_once("position.php");
require_once("distance.php");

$passwd = explode(":", base64_decode(file_get_contents("/home/temek/kattellaan/.passwd")));
$database = new db("mysqli");
if($database->connect("127.0.0.1", $passwd[0], $passwd[1], "kattellaan") == true) {
	$account = new account($database);
	if($account->create_table() == true) {
		printf("Created account database table.\r\n");
	} else {
		printf("Failed to create account database table.\r\n");
	}
	$session = new session($database, "sha512");
	if($session->create_table() == true) {
		printf("Created session database table.\r\n");
	} else {
		printf("Failed to create session database table.\r\n");
	}
	$invite = new invite($database);
	if($invite->create_table() == true) {
		printf("Created invite database table.\r\n");
	} else {
		printf("Failed to create invite database table.\r\n");
	}
	$file = new file($database, "", "");
	if($file->create_table() == true) {
		printf("Created file database table.\r\n");
	} else {
		printf("Failed to create file database table.\r\n");
	}
	$profile = new profile($database);
	if($profile->create_table() == true) {
		printf("Created profile database table.\r\n");
	} else {
		printf("Failed to create profile database table.\r\n");
	}
	$position = new position($database);
	if($position->create_table() == true) {
		printf("Created position database table.\r\n");
	} else {
		printf("Failed to create position database table.\r\n";
	}
	$distance = new distance($database);
	if($distance->create_table() == true) {
		printf("Created distance database table.\r\n");
	} else {
		printf("Failed to create distance database table.\r\n";
	}
}

?>
