<?php

require_once("php/dbwrapper/db.php");

$names = explode("\n", file_get_contents("lists/random-usernames.txt"));


$passwd = explode(":", base64_decode(file_get_contents("/home/temek/kattellaan/.passwd")));
$database = new db("mysqli");
if($database->connect("127.0.0.1", $passwd[0], $passwd[1], "kattellaan") == true) {
	foreach($names as $n) {
		echo $database->escape($n) . "\r\n";
	}

}

?>
