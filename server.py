from flask import Flask, Response
import requests

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

# run the application
if __name__ == "__main__":
    app.run(debug=True)
