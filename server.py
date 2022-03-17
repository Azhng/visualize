from flask import Flask, Response, request
import requests
import psycopg2
import struct


conn = psycopg2.connect(
    database="defaultdb",
    user="root",
    password="",
    host="127.0.0.1",
    port="26257",
)

# with conn.cursor() as cur:
#     cur.execute("SELECT 1")
#     print(cur.fetchall())

# creates a Flask application, named app
app = Flask(__name__,
            static_url_path='',
            static_folder='static')


@app.route('/api/<path:subpath>', methods=['GET'])
def api_filter(subpath):
    resp = requests.get("http://localhost:8080/{}".format(subpath))

    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    headers = [(name, value) for (name, value) in resp.raw.headers.items()
               if name.lower() not in excluded_headers]

    response = Response(resp.content, resp.status_code, headers)
    return response


@app.route('/getAggTs', methods=['POST'])
def get_agg_ts():
    resp = dict()
    # Quad word with bigEndian.
    txn_fingerprint_ids = map(lambda x: struct.pack('>Q', int(x)), request.get_json())
    args = tuple(txn_fingerprint_ids)
    with conn.cursor() as cur:
        cur.execute("""
        SELECT fingerprint_id, max(aggregated_ts::int8)
        FROM crdb_internal.transaction_statistics
        WHERE fingerprint_id IN %s
        GROUP BY fingerprint_id
        """, (args,))
        resp["data"] = list(map(lambda x: (str(int.from_bytes(x[0], 'big')), x[1]), cur.fetchall()))
        return resp
    return resp


# run the application
if __name__ == "__main__":
    app.run(debug=True)
