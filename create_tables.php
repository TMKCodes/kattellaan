<?php
require_once("dbwrapper/db.php");
require_once("account.php");


$database = new db("sqlite3");
if($database->open("kattellaan.db") == true) {
	$account = new account($db);
	if($account->create_table() == true) {
		printf("Created account database table.");
	} else {
		printf("Failed to create account database table.");
	}
}

?>
