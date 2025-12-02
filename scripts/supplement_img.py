#!/usr/bin/python

import os
import re
from supplements_list import SUPPLEMENTS

dir_path = os.path.dirname(os.path.realpath(__file__))

supplement_list="## Supplements\nHere is the list of supported images for the supplement. If yours as a ❌, you can request its addition [here](https://github.com/Elwinmage/ha-reef-card/discussions/25).\n"

for supplement in SUPPLEMENTS:
    uid=supplement['uid']
    try:
        open(dir_path+"/../src/devices/img/"+uid+".supplement.png")
        supplement_list+="- ✅"
    except:

        supplement_list+="- ❌"
    supplement_list+=supplement['fullname']+"\n"
supplement_list+="\n# ReefLed"

with open (dir_path+"/../README.md") as f:
    data = f.read()
    d= re.sub(r"## Supplements([^\$]+)# ReefLed",supplement_list,data,re.M| re.DOTALL)
with open (dir_path+"/../README.md","w") as f:
    f.write(d)


