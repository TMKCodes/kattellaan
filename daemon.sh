#!/bin/bash

while [ true ]
do
	OUTPUT=`php php/do_distance_work.php`
	echo $OUTPUT
	sleep 1s
done

