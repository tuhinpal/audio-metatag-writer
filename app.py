from flask import Flask, request, send_from_directory
import requests
import random
import string
from unidecode import unidecode
from mutagen.mp4 import MP4Cover, MP4
import os
from flask_cors import CORS
import schedule

app = Flask(__name__)
CORS(app)
# get the app url from the environment variable
app_url = os.environ.get('APP_URL', 'https://tagwriter.musicder.net')
port = int(os.environ.get('PORT', 8080))


@app.route('/id3', methods=['GET', 'POST'])
def index():
    try:
        payload = request.json
        filename = (unidecode(payload["name"])).replace(" ", "-") + '-' + ''.join((random.choice(string.ascii_lowercase)
                                                                                   for x in range(5))) + ".m4a"
        r = requests.get(payload["song_url"], allow_redirects=True)
        open(f"./public/{filename}", 'wb').write(r.content)
        artwork = requests.get(payload["cover_url"], allow_redirects=True)

        media_file = MP4(f"./public/{filename}")
        media_file["\xa9nam"] = payload["name"]
        media_file["\xa9ART"] = payload["artist"]
        media_file["\xa9alb"] = payload["album"]
        media_file["covr"] = [MP4Cover(artwork.content, MP4Cover.FORMAT_JPEG)]
        media_file.save()

        return {
            "status": True,
            "path": "/public/" + filename,
            "url": app_url + "/public/" + filename
        }

    except:
        return {
            "status": False
        }


@app.route('/public/<path:path>')
def send_js(path):
    return send_from_directory('public', path)


def deletecache():
    dir = './public'
    for f in os.listdir(dir):
        os.remove(os.path.join(dir, f))


schedule.every(2).hours.do(deletecache)

# if __name__ == '__main__':
#     app.debug = True
#     app.run(host='0.0.0.0', port=port, use_reloader=True, threaded=True)

# Production
if __name__ == '__main__':
    app.debug = False
    app.run(host='0.0.0.0', port=port)
