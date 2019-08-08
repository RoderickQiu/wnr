package com.scrisstudio.wnr;

import android.content.Context;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class NotificationManagerSpecified extends Plugin {
    public static int notifyID = 2004;
    public static String notifyChannelID = "default";
    public NotificationManager mNotifyManager;
    public NotificationChannel channel;
    public Notification.Builder mBuilder;
    public static boolean isFocusMode = false;

    @PluginMethod()
    public static void setIsFocusMode(PluginCall call) {
        boolean isFocusMode = call.getBoolean("isFocusMode");
        NotificationManagerSpecified.isFocusMode = isFocusMode;
        call.resolve();
    }

    @PluginMethod()
    public void buildProgressNotification(PluginCall call) {
        mNotifyManager =
                (NotificationManager) getActivity().getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        channel = new NotificationChannel(notifyChannelID, "Default", NotificationManager.IMPORTANCE_LOW);
        channel.setSound(null, null);
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);// try lock-screen notifications
        mNotifyManager.createNotificationChannel(channel);
        mBuilder = new Notification.Builder(getActivity().getApplicationContext(), notifyChannelID);
        mBuilder.setContentTitle("wnr")
                .setSmallIcon(R.drawable.ic_stat_name)
                .setChannelId(notifyChannelID)
                .setOngoing(true);
    }

    @PluginMethod()
    public void setProgressNotificationContent(PluginCall call) {
        String title = call.getString("title");
        String content = call.getString("content");
        mBuilder.setContentTitle(title)
                .setContentText(content);
        call.resolve();
    }

    @PluginMethod()
    public void setProgressNotification(PluginCall call) {
        // set new progress
        mBuilder.setProgress(100, 100 - call.getInt("progress"), false);
        // send notification
        mNotifyManager.notify(notifyID, mBuilder.build());
        call.resolve();
    }

    @PluginMethod()
    public void cancelProgressNotification(PluginCall call) {
        //delete progress bar
        mBuilder.setProgress(0, 0, false);
        mNotifyManager.cancel(notifyID);
        mNotifyManager.deleteNotificationChannel(notifyChannelID);
        call.resolve();
    }
}
