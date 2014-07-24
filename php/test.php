<?php
error_reporting(E_ALL);

$world = json_decode(file_get_contents("lists/states-regions-municipalities.json"));

foreach($world->states as $state) {
	foreach($state->regions as $region) {
		printf("%s\r\n", $region->name[0]);
	}
}

?>
