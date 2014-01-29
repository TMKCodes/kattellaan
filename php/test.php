<?php
error_reporting(E_ALL);
require_once("dbwrapper/db.php");
require_once("account.php");

printf("Hello fuckers!\r\n");
if($_GET['lol'] == "lol") {
	printf("Another fucker there!\r\n");
}
print_r($_GET);

//$db = new db("sqlite3");
//$db->open("kattellaan.db");

echo base64_decode(file_get_contents("/home/temek/kattellaan/.passwd"));
?>
