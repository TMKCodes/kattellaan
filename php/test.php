<?php
error_reporting(E_ALL);

$world = json_decode(file_get_contents("lists/states-regions-municipalities.json"));

foreach($world->states as $state) {
	printf("%s\r\n", $state->name[0]);
	foreach($state->regions as $region) {
		printf("\t%s\r\n", $region->name[0]);
	}
}

?>
