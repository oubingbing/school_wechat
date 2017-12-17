import StropheAll from '../../strophe.js'
    ;
(function () {
    'use strict';

    var _utils = require('./utils').utils;
    var Message = function (type, id) {
        if (!this instanceof Message) {
            return new Message(type);
        }

        this._msg = {};

        if (typeof Message[type] === 'function') {
            Message[type].prototype.setGroup = this.setGroup;
            this._msg = new Message[type](id);
        }
        return this._msg;
    }
    Message.prototype.setGroup = function (group) {
        this.body.group = group;
    }


    /*
     * text message
     */
    Message.txt = function (id) {
        this.id = id;
        this.type = 'txt';
        this.body = {};
    };
    Message.txt.prototype.set = function (opt) {
        this.value = opt.msg;
        this.body = {
            id: this.id
            , to: opt.to
            , msg: this.value
            , type: this.type
            , roomType: opt.roomType
            , ext: opt.ext || {}
            , success: opt.success
            , fail: opt.fail
        };

        !opt.roomType && delete this.body.roomType;

    };

    /*
     * cmd message
     */
    Message.cmd = function (id) {
        this.id = id;
        this.type = 'cmd';
        this.body = {};
    };
    Message.cmd.prototype.set = function (opt) {
        this.value = '';

        this.body = {
            to: opt.to
            , action: opt.action
            , msg: this.value
            , type: this.type
            , roomType: opt.roomType
            , ext: opt.ext || {}
        };
        !opt.roomType && delete this.body.roomType;
    };

    /*
     * loc message
     */
    Message.location = function (id) {
        this.id = id;
        this.type = 'loc';
        this.body = {};
    };
    Message.location.prototype.set = function (opt) {
        this.body = {
            to: opt.to
            , type: this.type
            , roomType: opt.roomType
            , addr: opt.addr
            , lat: opt.lat
            , lng: opt.lng
            , ext: opt.ext || {}
        };
    };

    /*
     * img message
     */
    Message.img = function (id) {
        this.id = id;
        this.type = 'img';
        this.body = {};
    };
    Message.img.prototype.set = function (opt) {
        // opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);
        ////console.log(opt)
        this.value = opt.file;
        this.body = {
            id: this.id,
            file: this.value,
            apiUrl: opt.apiUrl,
            to: opt.to,
            type: this.type,
            ext: opt.ext || {},
            roomType: opt.roomType,
            onFileUploadError: opt.onFileUploadError,
            onFileUploadComplete: opt.onFileUploadComplete,
            success: opt.success,
            fail: opt.fail,
            flashUpload: opt.flashUpload,
            width: opt.width,
            height: opt.height,
            body: opt.body
        };
        !opt.roomType && delete this.body.roomType;
    };

    /*
     * audio message
     */
    Message.audio = function (id) {
        this.id = id;
        this.type = 'audio';
        this.body = {};
    };
    Message.audio.prototype.set = function (opt) {
        opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

        this.value = opt.file;
        this.filename = opt.filename || this.value.filename;

        this.body = {
            id: this.id
            , file: this.value
            , filename: this.filename
            , apiUrl: opt.apiUrl
            , to: opt.to
            , type: this.type
            , ext: opt.ext || {}
            , length: opt.length || 0
            , roomType: opt.roomType
            , file_length: opt.file_length
            , onFileUploadError: opt.onFileUploadError
            , onFileUploadComplete: opt.onFileUploadComplete
            , success: opt.success
            , fail: opt.fail
            , flashUpload: opt.flashUpload
            , body: opt.body
        };
        !opt.roomType && delete this.body.roomType;
    };

    /*
     * file message
     */
    Message.file = function (id) {
        this.id = id;
        this.type = 'file';
        this.body = {};
    };
    Message.file.prototype.set = function (opt) {
        opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

        this.value = opt.file;
        this.filename = opt.filename || this.value.filename;

        this.body = {
            id: this.id
            , file: this.value
            , filename: this.filename
            , apiUrl: opt.apiUrl
            , to: opt.to
            , type: this.type
            , ext: opt.ext || {}
            , roomType: opt.roomType
            , onFileUploadError: opt.onFileUploadError
            , onFileUploadComplete: opt.onFileUploadComplete
            , success: opt.success
            , fail: opt.fail
            , flashUpload: opt.flashUpload
            , body: opt.body
        };
        !opt.roomType && delete this.body.roomType;
    };

    /*
     * video message
     */
    Message.video = function (id) {

    };
    Message.video.prototype.set = function (opt) {

    };

    var _Message = function (message) {

        if (!this instanceof _Message) {
            return new _Message(message, conn);
        }

        this.msg = message;
    }

    _Message.prototype.send = function (conn) {
        var me = this;
        ////console.log(this)           // 消息对象
        var _send = function (message) {

            message.ext = message.ext || {};
            message.ext.weichat = message.ext.weichat || {};
            message.ext.weichat.originType = message.ext.weichat.originType || 'webim';
            // //console.log('message',message)     msg对象
            var json = {
                from: conn.context.userId || ''
                , to: message.to
                , bodies: [message.body]
                , ext: message.ext || {}
            };

            var jsonstr = _utils.stringify(json);
            var dom = StropheAll.$msg({
                type: message.group || 'chat'
                , to: message.toJid
                , id: message.id
                , xmlns: 'jabber:client'
            }).c('body').t(jsonstr);
            //console.log("dommmmmmmm",dom)
            if (message.roomType) {
                dom.up().c('roomtype', {xmlns: 'easemob:x:roomtype', type: 'chatroom'});
            }

            setTimeout(function () {
                if (typeof _msgHash !== 'undefined' && _msgHash[message.id]) {
                    _msgHash[message.id].msg.fail instanceof Function
                    && _msgHash[message.id].msg.fail(message.id);
                }
            }, 60000);
            conn.sendCommand(dom.tree(), message.id);
        }


        if (me.msg.file) {
            if (me.msg.body && me.msg.body.url) {// Only send msg
                _send(me.msg);
                return;
            }
            var _tmpComplete = me.msg.onFileUploadComplete;
            var _complete = function (data) {

                if (data.entities[0]['file-metadata']) {
                    var file_len = data.entities[0]['file-metadata']['content-length'];
                    me.msg.file_length = file_len;
                    me.msg.filetype = data.entities[0]['file-metadata']['content-type'];
                    if (file_len > 204800) {
                        me.msg.thumbnail = true;
                    }
                }

                me.msg.body = {
                    type: me.msg.type || 'file'
                    , url: data.uri + '/' + data.entities[0]['uuid']
                    , secret: data.entities[0]['share-secret']
                    , filename: me.msg.file.filename || me.msg.filename
                    , size: {
                        width: me.msg.width || 0
                        , height: me.msg.height || 0
                    }
                    , length: me.msg.length || 0
                    , file_length: me.msg.file_length || 0
                    , filetype: me.msg.filetype
                }

                _send(me.msg);
                _tmpComplete instanceof Function && _tmpComplete(data, me.msg.id);
            };

            me.msg.onFileUploadComplete = _complete;
            _utils.uploadFile.call(conn, me.msg);
        } else {
            if (me.msg.type === 'img') {                                             //  添加img判断规则   wjy
                _send(me.msg);
            } else {
                me.msg.body = {
                    type: me.msg.type === 'chat' ? 'txt' : me.msg.type
                    , msg: me.msg.msg
                };
                if (me.msg.type === 'cmd') {
                    me.msg.body.action = me.msg.action;
                } else if (me.msg.type === 'loc') {
                    me.msg.body.addr = me.msg.addr;
                    me.msg.body.lat = me.msg.lat;
                    me.msg.body.lng = me.msg.lng;
                }
                _send(me.msg);
                //console.log('ooooooooooooooooooo')
            }

        }
    };

    exports._msg = _Message;
    exports.message = Message;
}());
