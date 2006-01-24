#!/bin/bash

scp -vpCBr `find . -name '*' | grep -v CVS` calvera@shell.sourceforge.net:/home/groups/s/su/suncult/htdocs
