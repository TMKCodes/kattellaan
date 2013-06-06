#!/bin/bash

git add \*
git commit -am '$1'
upto = `git pull`
if[upto == "Already up-to-date.\n"]
	then
		git push
		rm -rf /home/TMKCodes/.gvfs/ftp:host=ftp2.shellit.org,user=u32169/public_html
		mv -rf /home/TMKCodes/projects/kattellaan /home/TMKCodes/.gvfs/ftp:host=ftp2.shellit.org,user=u32169/public_html
	else
		echo "Pull conflict. Needs checking."
fi 