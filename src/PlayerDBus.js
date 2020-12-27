"use strict";

const EventEmitter = require('events');
const os = require('os');
const fs = require('fs');
const dbus = require('dbus-native');

const USER = os.userInfo().username;
const DBUS_ADDR = `/tmp/omxplayerdbus.${USER}`;
const DBUS_NAME = 'org.mpris.MediaPlayer2.omxplayer';
const DBUS_PATH = '/org/mpris/MediaPlayer2';
const DBUS_INTERFACE_PROPERTIES = 'org.freedesktop.DBus.Properties';
const DBUS_INTERFACE_PLAYER = 'org.mpris.MediaPlayer2.Player';
const DBUS_INTERFACE_ROOT = 'org.mpris.MediaPlayer2';

class PlayerDBus extends EventEmitter {

    constructor() {
        super();
    }

    quit(cb) {
        return this._invokeDBus('Quit', DBUS_INTERFACE_ROOT, null, null, cb);
    }

    next(cb) {
        return this._invokeDBus('Next', DBUS_INTERFACE_PLAYER, null, null, cb);
    }

    previous(cb) {
        return this._invokeDBus('Previous', DBUS_INTERFACE_PLAYER, null, null, cb);
    }

    play(cb) {
        // this is described in the api, but does not seem to work
        // this._invokeDBus('Play', DBUS_INTERFACE_PLAYER, null, null, cb);
        return this.getPlaying((err, playing) => {
            if (err) return cb && cb(err);
            if (playing) return cb && cb();
        }).then((playing) => {
            if (playing) return Promise.resolve();
            return this.togglePlay(cb);
        });
    }

    pause(cb) {
        return this._invokeDBus('Pause', DBUS_INTERFACE_PLAYER, null, null, cb);
    }

    togglePlay(cb) {
        return this._invokeDBus('PlayPause', DBUS_INTERFACE_PLAYER, null, null, cb);
    }

    stop(cb) {
        return this._invokeDBus('Stop', DBUS_INTERFACE_PLAYER, null, null, cb);
    }

    seek(seconds, cb) {
        return this._invokeDBus('Seek', DBUS_INTERFACE_PLAYER, 'x', [seconds * 1000000], (err, offset) => {
            if (err || offset == null) return cb && cb(err, null);
            return cb && cb(null, offset / 1000000);
        }).then((offset) => {
            if (offset == null) return Promise.reject();
            return offset / 1000000;
        });
    }

    setPosition(seconds, cb) {
        return this._invokeDBus('SetPosition', DBUS_INTERFACE_PLAYER, 'ox', ['/not/used', seconds * 1000000], (err, position) => {
            if (err || position == null) return cb && cb(err, null);
            return cb && cb(null, position / 1000000);
        }).then((position) => {
            if (position == null) return Promise.reject();
            return position / 1000000;
        });
    }

    mute(cb) {
        return this._invokeDBus('Mute', DBUS_INTERFACE_PLAYER, null, null, cb);
    }

    unmute(cb) {
        return this._invokeDBus('Unmute', DBUS_INTERFACE_PLAYER, null, null, cb);
    }

    getCanSeek(cb) {
        return this._invokeDBus('CanSeek', DBUS_INTERFACE_PROPERTIES, null, null, cb);
    }

    getCanPlay(cb) {
        return this._invokeDBus('CanPlay', DBUS_INTERFACE_PROPERTIES, null, null, cb);
    }

    getCanPause(cb) {
        return this._invokeDBus('CanPause', DBUS_INTERFACE_PROPERTIES, null, null, cb);
    }

    getPlaybackStatus(cb) {
        return this._invokeDBus('PlaybackStatus', DBUS_INTERFACE_PROPERTIES, null, null, cb);
    }

    getPlaying(cb) {
        return this.getPlaybackStatus((err, status) => {
            return cb && cb(err, status == 'Playing');
        }).then((status) => {
            return status == 'Playing';
        });
    }

    getPaused(cb) {
        return this.getPlaybackStatus((err, status) => {
            return cb && cb(err, status == 'Paused');
        }).then((status) => {
            return status == 'Paused';
        });
    }

    getVolume(cb) {
        return this._invokeDBus('Volume', DBUS_INTERFACE_PROPERTIES, null, null, cb);
    }

    setVolume(volume, cb) {
        return this._invokeDBus('Volume', DBUS_INTERFACE_PROPERTIES, 'd', [volume], cb);
    }

    getPosition(cb) {
        return this._invokeDBus('Position', DBUS_INTERFACE_PROPERTIES, null, null, (err, ...result) => {
            if (err) return cb && cb(err, null);
            return cb && cb(null, result / 1000000);
        }).then((position) => {
            return position / 1000000;
        });
    }

    getDuration(cb) {
        return this._invokeDBus('Duration', DBUS_INTERFACE_PROPERTIES, null, null, (err, ...result) => {
            if (err) return cb && cb(err, null);
            return cb && cb(null, result / 1000000);
        }).then((result) => {
            return result / 1000000;
        });
    }

    getResWidth(cb) {
        return this._invokeDBus('ResWidth', DBUS_INTERFACE_PROPERTIES, null, null, cb);
    }

    getResHeight(cb) {
        return this._invokeDBus('ResHeight', DBUS_INTERFACE_PROPERTIES, null, null, cb);
    }

    //copied from dbuscontrol.sh
    setAlpha(alpha, cb) {
        return this._invokeDBus('SetAlpha', DBUS_INTERFACE_PLAYER, 'ox', ['/not/used', alpha], cb);
    }

    setVideoPos(x1, y1, x2, y2, cb) {
        let unpack = function (result) {
            result = result.split(' ');
            result.forEach((r, i, l) => {
                l[i] = parseInt(r);
            });
            return result;
        }

        return this._invokeDBus('VideoPos', DBUS_INTERFACE_PLAYER, 'os', ['/not/used', `${x1} ${y1} ${x2} ${y2}`], (err, ...result) => {
            if (err) return cb && cb(err, null);
            return cb && cb(null, unpack(result));
        }).then((result) => {
            return unpack(result);
        });
    }

    setVideoCropPos(x1, y1, x2, y2, cb) {
        let unpack = function (result) {
            result = result.split(' ');
            result.forEach((r, i, l) => {
                l[i] = parseInt(r);
            });
            return result;
        }

        return this._invokeDBus('SetVideoCropPos', DBUS_INTERFACE_PLAYER, 'os', ['/not/used', `${x1} ${y1} ${x2} ${y2}`], (err, ...result) => {
            if (err) return cb && cb(err, null);
            return cb && cb(null, unpack(result));
        }).then((result) => {
            return unpack(result);
        });
    }

    setAspectMode(mode, cb) {
        return this._invokeDBus('SetAspectMode', DBUS_INTERFACE_PLAYER, 'os', ['/not/used', mode], cb);
    }

    _getDBus() {
        if (this.dbus) {
            return Promise.resolve(this.dbus);
        }

        return new Promise((resolve, reject) => {
            fs.readFile(DBUS_ADDR, 'utf8', (err, data) => {
                if (err) return reject(err);
                if (!data.length) return reject('no data in dbus file');

                try {
                    this.dbus = dbus.sessionBus({
                        busAddress: data.trim()
                    });

                    resolve(this.dbus);
                } catch (e) {
                    reject(e)
                }
            });
        });
    }

    _invokeDBus(member, iface, signature, body, cb) {
        return this._getDBus()
            .then((dbus) => {
                if (!dbus) {
                    cb && cb('dbus not initialized');
                    return Promise.reject('dbus not initialized');
                }

                return new Promise((resolve, reject) => {
                    dbus.invoke({
                        path: DBUS_PATH,
                        destination: DBUS_NAME,
                        interface: iface,
                        member,
                        signature,
                        body
                    }, (err, ...results) => {
                        console.log(`DBus [${member}] invoke resuls: ${err} | ${results}`)

                        cb && cb(err, ...results);

                        if (err) return reject(err);

                        resolve(...results);
                    });
                });
            });
    }
}

module.exports = {
    PlayerDBus
};