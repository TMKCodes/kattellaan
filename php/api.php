<?php

require_once("dbwrapper/db.php");
require_once("account.php");

$database = new db("sqlite3");
if($database->open("kattellaan.db") == true) {
	printf("Connection success.\r\n");

}

?>
