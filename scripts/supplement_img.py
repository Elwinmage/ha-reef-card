#!/usr/bin/python

import os
import re
from operator import itemgetter

from supplements_list import SUPPLEMENTS


dir_path = os.path.dirname(os.path.realpath(__file__))

supplement_list="## Supplements\nHere is the list of supported images for the supplement. If yours as a ❌, you can request its addition [here](https://github.com/Elwinmage/ha-reef-card/discussions/25).\n"
supplement_list+="<table>"
supplements_sorted=sorted(SUPPLEMENTS, key=lambda d: d['fullname'])

for supplement in supplements_sorted:
    uid=supplement['uid']
    try:
        filename=dir_path+"/../src/devices/img/"+uid+".supplement.png"
        with open(filename):
            supplement_list+="<tr><td>✅</td>"
            supplement_list+="<td>"+supplement['fullname']+"</td>"
            supplement_list+="<td><img style='width:20%;' src='src/devices/img/"+uid+".supplement.png'/></td></tr>"
    except:
        supplement_list+="<tr><td> ❌</td>"
        supplement_list+="<td colspan='2'>"+supplement['fullname']+"</td></tr>"
supplement_list+="</table>\n"
supplement_list+="\n# ReefLed"

with open (dir_path+"/../README.md") as f:
    data = f.read()
    d= re.sub(r"## Supplements([^\$]+)# ReefLed",supplement_list,data,re.M | re.DOTALL)
with open (dir_path+"/../README.md","w") as f:
    f.write(d)


