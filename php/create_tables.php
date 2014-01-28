<?php
require_once("dbwrapper/db.php");
require_once("account.php");


$database = new db("sqlite3");
if($database->open("kattellaan.db") == true) {
	$account = new account($database);
	if($account->create_table() == true) {
		printf("Created account database table.\r\n");
	} else {
		printf("Failed to create account database table.\r\n");
	}
}

?>
