#!/bin/bash
 curl http://localhost:5000/interactions > src/data/interactions.json
 curl http://localhost:5000/entities > src/data/entities.json
 curl http://localhost:5000/entities/bridges > src/data/bridges.json
