#!/bin/bash
curl http://localhost:5000/entities | json_reformat -m > src/data/entities.json
curl http://localhost:5000/entities/bridges | json_reformat -m > src/data/bridges.json
curl http://localhost:5000/linenos | json_reformat -m > src/data/linenos.json
curl http://localhost:5000/percentdone | json_reformat -m > src/data/percentdone.json

for BOOK_NO in {1..24}
do
  curl http://localhost:5000/interactions\?book\=$BOOK_NO | json_reformat -m > public/interactions/book-$BOOK_NO.json
done
