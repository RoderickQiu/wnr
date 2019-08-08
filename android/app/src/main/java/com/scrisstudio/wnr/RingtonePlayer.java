package com.scrisstudio.wnr;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import android.net.Uri;
import android.media.Ringtone;
import android.media.RingtoneManager;

@NativePlugin()
public class RingtonePlayer extends Plugin {
    private void ringtonePlay() {
        Uri notification = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        Ringtone r = RingtoneManager.getRingtone(getActivity().getApplicationContext(), notification);
        r.play();
    }

    @PluginMethod()
    public void play(PluginCall call) {//silent notification so need ringtone
        ringtonePlay();
        call.resolve();
    }
}
