#!/usr/bin/env bash

PGPASSWORD=secret

psql -t -p 5432 -U mrd_user -h localhost -d make_recall_decision -c "select data from recommendations where id = $1" | jq


