#!/bin/bash

git add \*
git commit -am '$1'
upto = `git pull`
if[upto == "Already up-to-date.\n"]
	then
		git push
	else
		echo "Pull conflict. Needs checking."
fi 