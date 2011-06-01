#!/bin/bash

#scp -vpCr `find . -name '*' | grep -v CVS` calvera@shell.sourceforge.net:/home/groups/s/su/suncult/htdocs
if [ $USER == "rob" ]; then
	SF_USER=robbieonsea
else
	SF_USER=calvera
fi
RSYNC_RSH=ssh rsync -aCv ./ $SF_USER@web.sourceforge.net:/home/groups/s/su/suncult/htdocs/
