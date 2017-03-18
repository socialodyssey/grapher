#!/bin/bash
curl http://localhost:5000/entities > src/data/entities.json
curl http://localhost:5000/entities/bridges > src/data/bridges.json
curl http://localhost:5000/linenos > src/data/linenos.json
curl http://localhost:5000/percentdone > src/data/percentdone.json

for BOOK_NO in {1..24}
do
  curl http://localhost:5000/interactions\?book\=$BOOK_NO > public/interactions/book-$BOOK_NO.json
done
