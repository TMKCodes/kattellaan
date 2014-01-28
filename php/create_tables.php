<?php
require_once("dbwrapper/db.php");
require_once("account.php");


$database = new db("mysqli");
if($database->connect("127.0.0.1", "root", "ikaros123", "kattellaan") == true) {
	$account = new account($database);
	if($account->create_table() == true) {
		printf("Created account database table.\r\n");
	} else {
		printf("Failed to create account database table.\r\n");
	}
}

?>
