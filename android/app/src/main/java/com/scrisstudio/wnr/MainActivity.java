package com.scrisstudio.wnr;

import android.os.Bundle;
import android.content.Intent;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;
import com.scrisstudio.wnr.Opener;
import com.scrisstudio.wnr.NotificationManagerSpecified;
import com.scrisstudio.wnr.RingtonePlayer;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class)
      add(Opener.class);
      add(NotificationManagerSpecified.class);
      add(RingtonePlayer.class);
    }});
  }

  @Override
  public void onPause(){
    super.onPause();  // Always call the superclass method first
    if(NotificationManagerSpecified.isFocusMode) {
      startActivity(new Intent(this, MainActivity.class));
    }
  }
}