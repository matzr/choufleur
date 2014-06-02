package com.lesbandit.choufleursensor;

import android.app.Activity;
import android.content.SharedPreferences;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.JsonHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import org.apache.http.client.HttpClient;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.UUID;

public class Sensor extends Activity {
    private static final String LOG_TAG = "ChouFleur Sensor";
    private MediaRecorder mRecorder;
    private String mFileName;
    private boolean mRecording;

    private Button bStartSample;
    private Button bStopSample;


//    private static final String BASE_URL = "http://home.mathieugardere.com:21177/";
    private static final String BASE_URL = "http://192.168.46.116:21177/";

    private static AsyncHttpClient client = new AsyncHttpClient();
    private EditText tSensorName;
    private EditText tLongitude;
    private EditText tLatitude;
    private EditText tAccuracy;
    private TextView tSensorId;


    /**
     * Called when the activity is first created.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        bStartSample = (Button)findViewById(R.id.bStartSample);
        bStopSample = (Button)findViewById(R.id.bStopSample);

        tSensorId = (TextView)findViewById(R.id.txtSensorId);
        tSensorName = (EditText)findViewById(R.id.tSensorName);
        tLongitude = (EditText)findViewById(R.id.tLongitude);
        tLatitude = (EditText)findViewById(R.id.tLatitude);
        tAccuracy = (EditText)findViewById(R.id.tAccuracy);

        loadSensorDetails();
    }

    public void startSample(View v) {
        if (!mRecording) {
            mRecorder = new MediaRecorder();
            mRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            mRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);

            mFileName = UUID.randomUUID().toString();

            mRecorder.setOutputFile(mFileName);
            mRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);

            try {
                mRecorder.prepare();
            } catch (IOException e) {
                Log.e(LOG_TAG, "prepare() failed");
            }

            mRecorder.start();
            mRecording = true;
            bStartSample.setEnabled(false);
            bStopSample.setEnabled(true);
        }
    }

    public void stopSample(View v) {
        if (mRecording) {
            //TODO: send sample to server
            bStartSample.setEnabled(true);
            bStopSample.setEnabled(false);
            mRecording = false;
        }
    }

    public void registerSensor(View v) {
        RequestParams params = new RequestParams();
        params.add("name", tSensorName.getText().toString());
        params.add("longitude", tLongitude.getText().toString());
        params.add("latitude", tLatitude.getText().toString());
        params.add("accuracy", tAccuracy.getText().toString());

        client.post(BASE_URL + "sensor", params, new JsonHttpResponseHandler() {
            @Override
            public void onSuccess(JSONObject response) {
                try {
                    tSensorId.setText(response.getJSONObject("sensor").getString("sensor_id"));
                    saveSensorDetails();
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    private void loadSensorDetails() {
        SharedPreferences prefs = getSharedPreferences("sensor", MODE_PRIVATE);
        tSensorId.setText(prefs.getString("sensor_id", ""));
        tSensorName.setText(prefs.getString("sensor_name", ""));
        tLongitude.setText(prefs.getString("sensor_longitude", ""));
        tLatitude.setText(prefs.getString("sensor_latitude", ""));
        tAccuracy.setText(prefs.getString("sensor_accuracy", ""));
    }

    private void saveSensorDetails() {
        SharedPreferences prefs = getSharedPreferences("sensor", MODE_PRIVATE);
        SharedPreferences.Editor editor =  prefs.edit();
        editor.putString("sensor_id", tSensorId.getText().toString());
        editor.putString("sensor_name", tSensorName.getText().toString());
        editor.putString("sensor_longitude", tLongitude.getText().toString());
        editor.putString("sensor_latitude", tLatitude.getText().toString());
        editor.putString("sensor_accuracy", tAccuracy.getText().toString());
        editor.commit();
    }
}
