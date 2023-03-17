
#!/usr/bin/env bash

PGPASSWORD=secret

psql -p 5432 -U mrd_user -h localhost -d make_recall_decision -c "select id from recommendations"


