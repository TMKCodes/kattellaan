#!/bin/bash

while [ true ]
do
	OUTPUT=`php php/do_distance_work.php`
	if [ "$OUTPUT" != "Distance successfully calculated\r\n" ]
	then
		echo $OUTPUT
	fi
	sleep 1s
done

