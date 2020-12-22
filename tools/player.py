#import subprocess, os, time
import sys, tempfile, os, os.path, shutil, subprocess, time, requests

if len(sys.argv) < 2:
    raise Exception("The first argument must be the stream url")

url = sys.argv[1]

while True:
    try:
        print("started new process")
        os.system("omxplayer -o hdmi --threshold 0.5 " + url)
        # os.system("streamlink --player \"omxplayer -o hdmi --threshold 0.5\" \"" + url + "\" best --player-fifo")
    except:
        pass