#!/bin/bash

scp -vpCr `find . -name '*' | grep -v CVS` calvera@shell.sourceforge.net:/home/groups/s/su/suncult/htdocs
