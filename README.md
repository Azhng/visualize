# Transaction Contention Visualizer

This is built to demo quality, not production ready.

## Run 

Ensure CockroachDB is running. 
Assuming SQL port is 26257
and HTTP port is 8080.

```bash
$ pip3 install -r requirements.txt
$ python3 server.py
```

Visualizer will be available on http://127.0.0.1:5000.

## Screenshot

Using YCSB-A workload

![screenshot](https://github.com/Azhng/visualize/blob/master/screenshot.png?raw=true)
