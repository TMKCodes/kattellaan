<?php
require_once("dbwrapper/db.php");
require_once("account.php");
require_once("session.php");

$passwd = explode(":", base64_decode(file_get_contents("home/temek/kattellaan/.passwd")));
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
}

?>
