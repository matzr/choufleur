package com.lesbandit.choufleursensor;

import android.app.Activity;
import android.content.SharedPreferences;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.*;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.JsonHttpResponseHandler;
import com.loopj.android.http.RequestParams;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.UUID;

public class Sensor extends Activity {
    private static final String LOG_TAG = "ChouFleur Sensor";

    //    private static final String BASE_URL = "http://home.mathieugardere.com:21177/";
    private static final String BASE_URL = "http://192.168.1.8:21177/";

    private static AsyncHttpClient client = new AsyncHttpClient();
    private MediaRecorder mRecorder;
    private String mFileName;
    private boolean mRecording;
    private Button bStartSample;
    private Button bStopSample;
    private EditText tSensorName;
    private EditText tLongitude;
    private EditText tLatitude;
    private EditText tAccuracy;
    private TextView tSensorId;
    private SeekBar sbDuration;
    private Switch swAutorestart;

    private String mSensorId;
    private String mCurrentToken;


    /**
     * Called when the activity is first created.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        bStartSample = (Button) findViewById(R.id.bStartSample);
        bStopSample = (Button) findViewById(R.id.bStopSample);

        tSensorId = (TextView) findViewById(R.id.txtSensorId);
        tSensorName = (EditText) findViewById(R.id.tSensorName);
        tLongitude = (EditText) findViewById(R.id.tLongitude);
        tLatitude = (EditText) findViewById(R.id.tLatitude);
        tAccuracy = (EditText) findViewById(R.id.tAccuracy);
        sbDuration = (SeekBar) findViewById(R.id.sbDuration);
        swAutorestart = (Switch) findViewById(R.id.swAutorestart);

        loadSensorDetails();
    }

    public void startSample(View v) {
        if (!mRecording) {
            mRecorder = new MediaRecorder();
            mRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            mRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);

            mFileName = Environment.getExternalStorageDirectory().getAbsolutePath();
            mFileName += "/" + UUID.randomUUID().toString();
            mCurrentToken = System.currentTimeMillis() + "_" + sbDuration.getProgress();

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

            Handler handler = new Handler();
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    stopSample(null);
                }
            }, sbDuration.getProgress() * 1000);
        }
    }

    public void stopSample(View v) {
        if (mRecording) {
            sendSample();
            bStartSample.setEnabled(true);
            bStopSample.setEnabled(false);
            mRecording = false;
            mRecorder.stop();
        }
        if (swAutorestart.isChecked()) {
            startSample(v);
        }
    }

    private void sendSample() {
        final String fileName = mFileName;
        new Thread(new Runnable() {
            //Thread to stop network calls on the UI thread
            public void run() {
                String quality = "44000";
                String maxLevel = "1";
                String averageLevel = ".5";

                String url = BASE_URL + "sampleData/" + mSensorId + "/" + mCurrentToken + "/" + quality + "/" + maxLevel + '_' + averageLevel;

                File file = new File(fileName);
                try {
                    HttpClient httpclient = new DefaultHttpClient();

                    HttpPost httppost = new HttpPost(url);

                    InputStreamEntity reqEntity = new InputStreamEntity(new FileInputStream(file), -1);
                    reqEntity.setContentType("binary/octet-stream");
                    reqEntity.setChunked(false);
                    httppost.setEntity(reqEntity);
                    httpclient.execute(httppost);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                file.delete();
            }
        }).start();
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

            @Override
            public void onFailure(Throwable e, JSONObject errorResponse) {
                super.onFailure(e, errorResponse);
            }
        });
    }

    private void loadSensorDetails() {
        SharedPreferences prefs = getSharedPreferences("sensor", MODE_PRIVATE);
        mSensorId = prefs.getString("sensor_id", "");
        tSensorId.setText(mSensorId);
        tSensorName.setText(prefs.getString("sensor_name", ""));
        tLongitude.setText(prefs.getString("sensor_longitude", ""));
        tLatitude.setText(prefs.getString("sensor_latitude", ""));
        tAccuracy.setText(prefs.getString("sensor_accuracy", ""));

    }

    private void saveSensorDetails() {
        SharedPreferences prefs = getSharedPreferences("sensor", MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("sensor_id", tSensorId.getText().toString());
        editor.putString("sensor_name", tSensorName.getText().toString());
        editor.putString("sensor_longitude", tLongitude.getText().toString());
        editor.putString("sensor_latitude", tLatitude.getText().toString());
        editor.putString("sensor_accuracy", tAccuracy.getText().toString());
        editor.commit();
    }
}