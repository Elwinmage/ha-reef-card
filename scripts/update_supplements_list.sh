#!/bin/bash

ONLINE_LIST='https://github.com/Elwinmage/ha-reefbeat-component/raw/refs/heads/main/custom_components/redsea/supplements_list.py'
LOCAL_LIST='/config/git/ha-reefbeat-component/custom_components/redsea/supplements_list.py'
CURRENT_LIST='/config/git/ha-reef-card/scripts/supplements_list.py'
JS_LIST='/config/git/ha-reef-card/src/devices/supplements_list.js'

if [ -f ${LOCAL_LIST} ]
then
    diff ${CURRENT_LIST} ${LOCAL_LIST}
    [ $? -ne 0 ] && cp ${LOCAL_LIST} ${CURRENT_LIST}
else
    rm ${CURRENT_LIST}
    wget ${ONLINE_LIST} -O ${CURRENT_LIST}
fi

echo -n "export const " > ${JS_LIST}
cat ${CURRENT_LIST}  |sed s/'None'/'null'/g |sed s/'True'/'true'/g| sed s/'False'/'false'/g >> ${JS_LIST}
echo ";" >>  ${JS_LIST}  
