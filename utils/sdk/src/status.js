;
(function () {
    var connIndex = 0,
        uploadIndex = 100,
        downloadIndex = 200,
        msgIndex = 300,
        statusIndex = 400;

    exports.code = {
        WEBIM_CONNCTION_USER_NOT_ASSIGN_ERROR: connIndex++,
        WEBIM_CONNCTION_OPEN_ERROR: connIndex++,
        WEBIM_CONNCTION_AUTH_ERROR: connIndex++,
        WEBIM_CONNCTION_OPEN_USERGRID_ERROR: connIndex++,
        WEBIM_CONNCTION_ATTACH_ERROR: connIndex++,
        WEBIM_CONNCTION_ATTACH_USERGRID_ERROR: connIndex++,
        WEBIM_CONNCTION_REOPEN_ERROR: connIndex++,
        WEBIM_CONNCTION_SERVER_CLOSE_ERROR: connIndex++,  //7: client-side network offline (net::ERR_INTERNET_DISCONNECTED)
        WEBIM_CONNCTION_SERVER_ERROR: connIndex++,        //8: offline by multi login
        WEBIM_CONNCTION_IQ_ERROR: connIndex++,

        WEBIM_CONNCTION_PING_ERROR: connIndex++,
        WEBIM_CONNCTION_NOTIFYVERSION_ERROR: connIndex++,
        WEBIM_CONNCTION_GETROSTER_ERROR: connIndex++,
        WEBIM_CONNCTION_CROSSDOMAIN_ERROR: connIndex++,
        WEBIM_CONNCTION_LISTENING_OUTOF_MAXRETRIES: connIndex++,
        WEBIM_CONNCTION_RECEIVEMSG_CONTENTERROR: connIndex++,
        WEBIM_CONNCTION_DISCONNECTED: connIndex++,    //16: server-side close the websocket connection
        WEBIM_CONNCTION_AJAX_ERROR: connIndex++,
        WEBIM_CONNCTION_JOINROOM_ERROR: connIndex++,
        WEBIM_CONNCTION_GETROOM_ERROR: connIndex++,

        WEBIM_CONNCTION_GETROOMINFO_ERROR: connIndex++,
        WEBIM_CONNCTION_GETROOMMEMBER_ERROR: connIndex++,
        WEBIM_CONNCTION_GETROOMOCCUPANTS_ERROR: connIndex++,
        WEBIM_CONNCTION_LOAD_CHATROOM_ERROR: connIndex++,
        WEBIM_CONNCTION_NOT_SUPPORT_CHATROOM_ERROR: connIndex++,
        WEBIM_CONNCTION_JOINCHATROOM_ERROR: connIndex++,
        WEBIM_CONNCTION_QUITCHATROOM_ERROR: connIndex++,
        WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR: connIndex++,
        WEBIM_CONNCTION_TOKEN_NOT_ASSIGN_ERROR: connIndex++,
        WEBIM_CONNCTION_SESSIONID_NOT_ASSIGN_ERROR: connIndex++,

        WEBIM_CONNCTION_RID_NOT_ASSIGN_ERROR: connIndex++,
        WEBIM_CONNCTION_CALLBACK_INNER_ERROR: connIndex++,
        WEBIM_CONNCTION_CLIENT_OFFLINE: connIndex++,        //32: client offline
        WEBIM_CONNCTION_CLIENT_LOGOUT: connIndex++,        //33: client logout


        WEBIM_UPLOADFILE_BROWSER_ERROR: uploadIndex++,
        WEBIM_UPLOADFILE_ERROR: uploadIndex++,
        WEBIM_UPLOADFILE_NO_LOGIN: uploadIndex++,
        WEBIM_UPLOADFILE_NO_FILE: uploadIndex++,


        WEBIM_DOWNLOADFILE_ERROR: downloadIndex++,
        WEBIM_DOWNLOADFILE_NO_LOGIN: downloadIndex++,
        WEBIM_DOWNLOADFILE_BROWSER_ERROR: downloadIndex++,


        WEBIM_MESSAGE_REC_TEXT: msgIndex++,
        WEBIM_MESSAGE_REC_TEXT_ERROR: msgIndex++,
        WEBIM_MESSAGE_REC_EMOTION: msgIndex++,
        WEBIM_MESSAGE_REC_PHOTO: msgIndex++,
        WEBIM_MESSAGE_REC_AUDIO: msgIndex++,
        WEBIM_MESSAGE_REC_AUDIO_FILE: msgIndex++,
        WEBIM_MESSAGE_REC_VEDIO: msgIndex++,
        WEBIM_MESSAGE_REC_VEDIO_FILE: msgIndex++,
        WEBIM_MESSAGE_REC_FILE: msgIndex++,
        WEBIM_MESSAGE_SED_TEXT: msgIndex++,
        WEBIM_MESSAGE_SED_EMOTION: msgIndex++,
        WEBIM_MESSAGE_SED_PHOTO: msgIndex++,
        WEBIM_MESSAGE_SED_AUDIO: msgIndex++,
        WEBIM_MESSAGE_SED_AUDIO_FILE: msgIndex++,
        WEBIM_MESSAGE_SED_VEDIO: msgIndex++,
        WEBIM_MESSAGE_SED_VEDIO_FILE: msgIndex++,
        WEBIM_MESSAGE_SED_FILE: msgIndex++,


        STATUS_INIT: statusIndex++,
        STATUS_DOLOGIN_USERGRID: statusIndex++,
        STATUS_DOLOGIN_IM: statusIndex++,
        STATUS_OPENED: statusIndex++,
        STATUS_CLOSING: statusIndex++,
        STATUS_CLOSED: statusIndex++,
        STATUS_ERROR: statusIndex++
    };
}());
