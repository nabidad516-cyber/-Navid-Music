import JSZip from 'jszip';

export interface AndroidProjectFile {
  path: string;
  content: string;
  description: string;
}

export function getAndroidProjectFiles(): AndroidProjectFile[] {
  return [
    {
      path: 'settings.gradle.kts',
      description: 'Root Gradle settings defining project repositories and modules',
      content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "NavidMusic"
include(":app")
`
    },
    {
      path: 'build.gradle.kts',
      description: 'Top-level build script',
      content: `plugins {
    id("com.android.application") version "8.5.2" apply false
}
`
    },
    {
      path: 'gradle.properties',
      description: 'Gradle JVM and AndroidX configuration',
      content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=false
android.nonTransitiveRClass=true
`
    },
    {
      path: 'gradle/wrapper/gradle-wrapper.properties',
      description: 'Gradle wrapper distribution configuration',
      content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
    },
    {
      path: 'app/build.gradle.kts',
      description: 'Application module build configuration with ExoPlayer/Media3 & Material Design',
      content: `plugins {
    id("com.android.application")
}

android {
    namespace = "com.navid.music"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.navid.music"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.viewpager2:viewpager2:1.1.0")

    // Media3 / ExoPlayer for high fidelity background playback
    implementation("androidx.media3:media3-exoplayer:1.3.1")
    implementation("androidx.media3:media3-session:1.3.1")
    implementation("androidx.media3:media3-ui:1.3.1")
    implementation("androidx.media:media:1.7.0")

    // Image loading for album covers
    implementation("com.github.bumptech.glide:glide:4.16.0")
    annotationProcessor("com.github.bumptech.glide:compiler:4.16.0")
}
`
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      description: 'Application Manifest with complete Android 7 through 16 audio & foreground permissions',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.navid.music">

    <!-- Storage permissions for Android 7 through 12 (API 24-32) -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission
        android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="29"
        tools:ignore="ScopedStorage" />

    <!-- Modern Granular Media Permissions for Android 13 through 16 (API 33-36) -->
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

    <!-- Notifications for Android 13+ lock screen and status bar controls -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Background playback & service permissions -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.NavidMusic"
        android:requestLegacyExternalStorage="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.NavidMusic">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Intent filter to open audio files directly with Navid Music -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:scheme="content" />
                <data android:mimeType="audio/*" />
            </intent-filter>
        </activity>

        <activity
            android:name=".ui.NowPlayingActivity"
            android:exported="false"
            android:theme="@style/Theme.NavidMusic.Fullscreen" />

        <activity
            android:name=".ui.EqualizerActivity"
            android:exported="false"
            android:label="@string/equalizer"
            android:theme="@style/Theme.NavidMusic" />

        <!-- Foreground Service for background music playback -->
        <service
            android:name=".service.MusicPlaybackService"
            android:exported="false"
            android:foregroundServiceType="mediaPlayback">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
                <action android:name="android.media.browse.MediaBrowserService" />
            </intent-filter>
        </service>

        <receiver
            android:name=".receiver.MediaNotificationReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="com.navid.music.ACTION_PLAY_PAUSE" />
                <action android:name="com.navid.music.ACTION_NEXT" />
                <action android:name="com.navid.music.ACTION_PREVIOUS" />
            </intent-filter>
        </receiver>

    </application>
</manifest>
`
    },
    {
      path: 'app/src/main/java/com/navid/music/model/Song.java',
      description: 'Song domain model representing device audio track',
      content: `package com.navid.music.model;

import android.net.Uri;
import android.os.Parcel;
import android.os.Parcelable;

public class Song implements Parcelable {
    private final long id;
    private final String title;
    private final String artist;
    private final String album;
    private final long duration; // in milliseconds
    private final String path;
    private final long albumId;
    private final String folder;
    private final long size;
    private boolean isFavorite;

    public Song(long id, String title, String artist, String album, long duration, String path, long albumId, String folder, long size) {
        this.id = id;
        this.title = title != null && !title.isEmpty() ? title : "Unknown Title";
        this.artist = artist != null && !artist.isEmpty() ? artist : "Unknown Artist";
        this.album = album != null && !album.isEmpty() ? album : "Unknown Album";
        this.duration = duration;
        this.path = path;
        this.albumId = albumId;
        this.folder = folder;
        this.size = size;
        this.isFavorite = false;
    }

    protected Song(Parcel in) {
        id = in.readLong();
        title = in.readString();
        artist = in.readString();
        album = in.readString();
        duration = in.readLong();
        path = in.readString();
        albumId = in.readLong();
        folder = in.readString();
        size = in.readLong();
        isFavorite = in.readByte() != 0;
    }

    public static final Creator<Song> CREATOR = new Creator<Song>() {
        @Override
        public Song createFromParcel(Parcel in) {
            return new Song(in);
        }

        @Override
        public Song[] newArray(int size) {
            return new Song[size];
        }
    };

    public long getId() { return id; }
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public String getAlbum() { return album; }
    public long getDuration() { return duration; }
    public String getPath() { return path; }
    public long getAlbumId() { return albumId; }
    public String getFolder() { return folder; }
    public long getSize() { return size; }
    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }

    public Uri getAlbumArtUri() {
        return Uri.parse("content://media/external/audio/albumart/" + albumId);
    }

    @Override
    public int describeContents() { return 0; }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeLong(id);
        dest.writeString(title);
        dest.writeString(artist);
        dest.writeString(album);
        dest.writeLong(duration);
        dest.writeString(path);
        dest.writeLong(albumId);
        dest.writeString(folder);
        dest.writeLong(size);
        dest.writeByte((byte) (isFavorite ? 1 : 0));
    }
}
`
    },
    {
      path: 'app/src/main/java/com/navid/music/util/MediaStoreLoader.java',
      description: 'MediaStore audio scanner querying phone storage',
      content: `package com.navid.music.util;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import com.navid.music.model.Song;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class MediaStoreLoader {

    public static List<Song> loadAudioFiles(Context context) {
        List<Song> songsList = new ArrayList<>();
        ContentResolver contentResolver = context.getContentResolver();

        Uri collection;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            collection = MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL);
        } else {
            collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
        }

        String[] projection = {
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.DATA,
                MediaStore.Audio.Media.ALBUM_ID,
                MediaStore.Audio.Media.SIZE
        };

        // Filter only music files longer than 15 seconds to omit notification sounds
        String selection = MediaStore.Audio.Media.IS_MUSIC + " != 0 AND " +
                MediaStore.Audio.Media.DURATION + " >= 15000";
        String sortOrder = MediaStore.Audio.Media.TITLE + " ASC";

        try (Cursor cursor = contentResolver.query(collection, projection, selection, null, sortOrder)) {
            if (cursor != null && cursor.moveToFirst()) {
                int idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID);
                int titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE);
                int artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST);
                int albumCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM);
                int durationCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION);
                int dataCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA);
                int albumIdCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID);
                int sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE);

                do {
                    long id = cursor.getLong(idCol);
                    String title = cursor.getString(titleCol);
                    String artist = cursor.getString(artistCol);
                    String album = cursor.getString(albumCol);
                    long duration = cursor.getLong(durationCol);
                    String path = cursor.getString(dataCol);
                    long albumId = cursor.getLong(albumIdCol);
                    long size = cursor.getLong(sizeCol);

                    // Extract folder name
                    String folder = "Storage/Music";
                    if (path != null) {
                        File file = new File(path);
                        File parent = file.getParentFile();
                        if (parent != null) {
                            folder = parent.getName();
                        }
                    }

                    songsList.add(new Song(id, title, artist, album, duration, path, albumId, folder, size));
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return songsList;
    }
}
`
    },
    {
      path: 'app/src/main/java/com/navid/music/util/PermissionHelper.java',
      description: 'Permissions management covering Android 7 up to Android 16',
      content: `package com.navid.music.util;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

public class PermissionHelper {
    public static final int REQ_CODE_MEDIA_PERMISSIONS = 1001;

    public static boolean hasAudioPermission(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) { // Android 13 - 16
            return ContextCompat.checkSelfPermission(context, Manifest.permission.READ_MEDIA_AUDIO)
                    == PackageManager.PERMISSION_GRANTED;
        } else { // Android 7 - 12
            return ContextCompat.checkSelfPermission(context, Manifest.permission.READ_EXTERNAL_STORAGE)
                    == PackageManager.PERMISSION_GRANTED;
        }
    }

    public static void requestAudioPermissions(Activity activity) {
        List<String> permissions = new ArrayList<>();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.READ_MEDIA_AUDIO);
            // Notification permission for background playback controls
            if (ContextCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        } else {
            permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE);
        }

        if (!permissions.isEmpty()) {
            ActivityCompat.requestPermissions(
                    activity,
                    permissions.toArray(new String[0]),
                    REQ_CODE_MEDIA_PERMISSIONS
            );
        }
    }
}
`
    },
    {
      path: 'app/src/main/java/com/navid/music/service/MusicPlaybackService.java',
      description: 'Background Foreground Service with ExoPlayer Media3 and Notification Controls',
      content: `package com.navid.music.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

import androidx.media3.common.MediaItem;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;

import com.navid.music.MainActivity;
import com.navid.music.R;
import com.navid.music.model.Song;

import java.util.ArrayList;
import java.util.List;

public class MusicPlaybackService extends Service {
    public static final String CHANNEL_ID = "navid_music_playback";
    public static final int NOTIFICATION_ID = 404;

    public static final String ACTION_PLAY = "com.navid.music.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.navid.music.ACTION_PAUSE";
    public static final String ACTION_NEXT = "com.navid.music.ACTION_NEXT";
    public static final String ACTION_PREV = "com.navid.music.ACTION_PREVIOUS";

    private final IBinder binder = new MusicBinder();
    private ExoPlayer player;
    private List<Song> playlist = new ArrayList<>();
    private int currentIndex = -1;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;

    public class MusicBinder extends Binder {
        public MusicPlaybackService getService() {
            return MusicPlaybackService.this;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);

        player = new ExoPlayer.Builder(this).build();
        player.addListener(new Player.Listener() {
            @Override
            public void onPlaybackStateChanged(int playbackState) {
                if (playbackState == Player.STATE_ENDED) {
                    playNext();
                }
                updateNotification();
            }

            @Override
            public void onIsPlayingChanged(boolean isPlaying) {
                updateNotification();
            }
        });
    }

    public void setPlaylist(List<Song> songs, int startIndex) {
        this.playlist = new ArrayList<>(songs);
        this.currentIndex = startIndex;
        playSong(startIndex);
    }

    public void playSong(int index) {
        if (playlist == null || index < 0 || index >= playlist.size()) return;
        currentIndex = index;
        Song song = playlist.get(index);

        requestAudioFocus();

        MediaItem mediaItem = MediaItem.fromUri(Uri.parse(song.getPath()));
        player.setMediaItem(mediaItem);
        player.prepare();
        player.play();

        startForeground(NOTIFICATION_ID, buildNotification());
    }

    public void togglePlayPause() {
        if (player.isPlaying()) {
            player.pause();
        } else {
            requestAudioFocus();
            player.play();
        }
        updateNotification();
    }

    public void playNext() {
        if (playlist.isEmpty()) return;
        currentIndex = (currentIndex + 1) % playlist.size();
        playSong(currentIndex);
    }

    public void playPrevious() {
        if (playlist.isEmpty()) return;
        currentIndex = (currentIndex - 1 + playlist.size()) % playlist.size();
        playSong(currentIndex);
    }

    public void seekTo(long positionMs) {
        player.seekTo(positionMs);
    }

    public Song getCurrentSong() {
        if (currentIndex >= 0 && currentIndex < playlist.size()) {
            return playlist.get(currentIndex);
        }
        return null;
    }

    public boolean isPlaying() {
        return player != null && player.isPlaying();
    }

    public long getCurrentPosition() {
        return player != null ? player.getCurrentPosition() : 0;
    }

    public long getDuration() {
        return player != null ? player.getDuration() : 0;
    }

    public int getAudioSessionId() {
        return player != null ? player.getAudioSessionId() : 0;
    }

    private void requestAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes playbackAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();

            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(playbackAttributes)
                    .setAcceptsDelayedFocusGain(true)
                    .setOnAudioFocusChangeListener(focusChange -> {
                        if (focusChange == AudioManager.AUDIOFOCUS_LOSS) {
                            if (player.isPlaying()) player.pause();
                        } else if (focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                            if (player.isPlaying()) player.pause();
                        } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
                            player.play();
                        }
                    })
                    .build();

            audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        }
    }

    private Notification buildNotification() {
        Song song = getCurrentSong();
        String title = song != null ? song.getTitle() : "Navid Music";
        String artist = song != null ? song.getArtist() : "Offline Player";

        Intent openAppIntent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(
                this, 0, openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        PendingIntent prevIntent = PendingIntent.getBroadcast(
                this, 1, new Intent(ACTION_PREV),
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        PendingIntent playPauseIntent = PendingIntent.getBroadcast(
                this, 2, new Intent(ACTION_PLAY),
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        PendingIntent nextIntent = PendingIntent.getBroadcast(
                this, 3, new Intent(ACTION_NEXT),
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        int playPauseIcon = isPlaying() ? R.drawable.ic_pause : R.drawable.ic_play;

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(artist)
                .setSmallIcon(R.drawable.ic_music_note)
                .setContentIntent(contentIntent)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .addAction(R.drawable.ic_skip_previous, "Previous", prevIntent)
                .addAction(playPauseIcon, "Play/Pause", playPauseIntent)
                .addAction(R.drawable.ic_skip_next, "Next", nextIntent)
                .setStyle(new MediaStyle()
                        .setShowActionsInCompactView(0, 1, 2))
                .setOngoing(isPlaying())
                .build();
    }

    private void updateNotification() {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, buildNotification());
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Navid Music Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Controls for Navid Music playback on lock screen and notification shade");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public void onDestroy() {
        if (player != null) {
            player.release();
            player = null;
        }
        super.onDestroy();
    }
}
`
    },
    {
      path: 'app/src/main/java/com/navid/music/receiver/MediaNotificationReceiver.java',
      description: 'Broadcast Receiver for lock-screen and status notification buttons',
      content: `package com.navid.music.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.navid.music.service.MusicPlaybackService;

public class MediaNotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action == null) return;

        Intent serviceIntent = new Intent(context, MusicPlaybackService.class);
        serviceIntent.setAction(action);
        context.startService(serviceIntent);
    }
}
`
    },
    {
      path: 'app/src/main/java/com/navid/music/ui/EqualizerActivity.java',
      description: 'Hardware Audio Equalizer Activity with 5-bands, BassBoost, Virtualizer, and Presets',
      content: `package com.navid.music.ui;

import android.media.audiofx.BassBoost;
import android.media.audiofx.Equalizer;
import android.media.audiofx.Virtualizer;
import android.os.Bundle;
import android.view.MenuItem;
import android.widget.ArrayAdapter;
import android.widget.SeekBar;
import android.widget.Spinner;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SwitchCompat;
import com.navid.music.R;

public class EqualizerActivity extends AppCompatActivity {
    private Equalizer equalizer;
    private BassBoost bassBoost;
    private Virtualizer virtualizer;

    private SwitchCompat switchEqualizer;
    private Spinner spinnerPresets;
    private SeekBar seekBass, seekVirtualizer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_equalizer);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(R.string.equalizer);
        }

        int audioSessionId = getIntent().getIntExtra("audio_session_id", 0);

        try {
            equalizer = new Equalizer(0, audioSessionId);
            equalizer.setEnabled(true);

            bassBoost = new BassBoost(0, audioSessionId);
            bassBoost.setEnabled(true);

            virtualizer = new Virtualizer(0, audioSessionId);
            virtualizer.setEnabled(true);
        } catch (Exception e) {
            e.printStackTrace();
        }

        initViews();
        setupPresets();
    }

    private void initViews() {
        switchEqualizer = findViewById(R.id.switch_eq_enable);
        spinnerPresets = findViewById(R.id.spinner_presets);
        seekBass = findViewById(R.id.seek_bass_boost);
        seekVirtualizer = findViewById(R.id.seek_virtualizer);

        switchEqualizer.setChecked(equalizer != null && equalizer.getEnabled());
        switchEqualizer.setOnCheckedChangeListener((btn, isChecked) -> {
            if (equalizer != null) equalizer.setEnabled(isChecked);
            if (bassBoost != null) bassBoost.setEnabled(isChecked);
            if (virtualizer != null) virtualizer.setEnabled(isChecked);
        });

        seekBass.setMax(1000);
        seekBass.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (bassBoost != null && bassBoost.getStrengthSupported()) {
                    bassBoost.setStrength((short) progress);
                }
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        seekVirtualizer.setMax(1000);
        seekVirtualizer.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (virtualizer != null && virtualizer.getStrengthSupported()) {
                    virtualizer.setStrength((short) progress);
                }
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });
    }

    private void setupPresets() {
        if (equalizer == null) return;
        short numPresets = equalizer.getNumberOfPresets();
        String[] presetNames = new String[numPresets];

        for (short i = 0; i < numPresets; i++) {
            presetNames[i] = equalizer.getPresetName(i);
        }

        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, presetNames);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerPresets.setAdapter(adapter);

        spinnerPresets.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, android.view.View view, int position, long id) {
                if (equalizer != null) {
                    equalizer.usePreset((short) position);
                }
            }
            @Override public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (equalizer != null) equalizer.release();
        if (bassBoost != null) bassBoost.release();
        if (virtualizer != null) virtualizer.release();
    }
}
`
    },
    {
      path: 'app/src/main/java/com/navid/music/MainActivity.java',
      description: 'Main Activity with Tab navigation, song list, folder browser, permissions dispatcher',
      content: `package com.navid.music;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.IBinder;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.navid.music.adapter.SongAdapter;
import com.navid.music.model.Song;
import com.navid.music.service.MusicPlaybackService;
import com.navid.music.ui.EqualizerActivity;
import com.navid.music.ui.NowPlayingActivity;
import com.navid.music.util.MediaStoreLoader;
import com.navid.music.util.PermissionHelper;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private SongAdapter songAdapter;
    private List<Song> allSongs = new ArrayList<>();

    private View layoutMiniPlayer;
    private TextView tvMiniTitle, tvMiniArtist;
    private ImageView btnMiniPlayPause, imgMiniCover;

    private MusicPlaybackService musicService;
    private boolean isBound = false;

    private final ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            MusicPlaybackService.MusicBinder binder = (MusicPlaybackService.MusicBinder) service;
            musicService = binder.getService();
            isBound = true;
            updateMiniPlayer();
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            isBound = false;
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        songAdapter = new SongAdapter(this, allSongs, (song, position) -> {
            if (isBound && musicService != null) {
                musicService.setPlaylist(allSongs, position);
                updateMiniPlayer();
            }
        });
        recyclerView.setAdapter(songAdapter);

        initMiniPlayer();

        // Request Audio Permissions for Android 7 through 16
        if (PermissionHelper.hasAudioPermission(this)) {
            loadLocalMusic();
        } else {
            PermissionHelper.requestAudioPermissions(this);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        Intent intent = new Intent(this, MusicPlaybackService.class);
        startService(intent);
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (isBound) {
            unbindService(serviceConnection);
            isBound = false;
        }
    }

    private void loadLocalMusic() {
        allSongs = MediaStoreLoader.loadAudioFiles(this);
        songAdapter.updateList(allSongs);
        if (allSongs.isEmpty()) {
            findViewById(R.id.layout_empty_state).setVisibility(View.VISIBLE);
        } else {
            findViewById(R.id.layout_empty_state).setVisibility(View.GONE);
        }
    }

    private void initMiniPlayer() {
        layoutMiniPlayer = findViewById(R.id.layout_mini_player);
        tvMiniTitle = findViewById(R.id.tv_mini_title);
        tvMiniArtist = findViewById(R.id.tv_mini_artist);
        btnMiniPlayPause = findViewById(R.id.btn_mini_play_pause);
        imgMiniCover = findViewById(R.id.img_mini_cover);

        btnMiniPlayPause.setOnClickListener(v -> {
            if (isBound && musicService != null) {
                musicService.togglePlayPause();
                btnMiniPlayPause.setImageResource(musicService.isPlaying() ? R.drawable.ic_pause : R.drawable.ic_play);
            }
        });

        layoutMiniPlayer.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, NowPlayingActivity.class);
            startActivity(intent);
        });
    }

    private void updateMiniPlayer() {
        if (!isBound || musicService == null) return;
        Song song = musicService.getCurrentSong();
        if (song != null) {
            layoutMiniPlayer.setVisibility(View.VISIBLE);
            tvMiniTitle.setText(song.getTitle());
            tvMiniArtist.setText(song.getArtist());
            btnMiniPlayPause.setImageResource(musicService.isPlaying() ? R.drawable.ic_pause : R.drawable.ic_play);
        } else {
            layoutMiniPlayer.setVisibility(View.GONE);
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);
        MenuItem searchItem = menu.findItem(R.id.action_search);
        SearchView searchView = (SearchView) searchItem.getActionView();
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) { return false; }

            @Override
            public boolean onQueryTextChange(String newText) {
                songAdapter.filter(newText);
                return true;
            }
        });
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == R.id.action_equalizer) {
            Intent intent = new Intent(this, EqualizerActivity.class);
            if (isBound && musicService != null) {
                intent.putExtra("audio_session_id", musicService.getAudioSessionId());
            }
            startActivity(intent);
            return true;
        } else if (item.getItemId() == R.id.action_rescan) {
            loadLocalMusic();
            Toast.makeText(this, "Music Library Refreshed", Toast.LENGTH_SHORT).show();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PermissionHelper.REQ_CODE_MEDIA_PERMISSIONS) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                loadLocalMusic();
            } else {
                Toast.makeText(this, "Permission denied. Cannot scan device audio.", Toast.LENGTH_LONG).show();
            }
        }
    }
}
`
    },
    {
      path: 'app/src/main/java/com/navid/music/adapter/SongAdapter.java',
      description: 'Song RecyclerView Adapter with search filtering and fast scrolling',
      content: `package com.navid.music.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.navid.music.R;
import com.navid.music.model.Song;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class SongAdapter extends RecyclerView.Adapter<SongAdapter.SongViewHolder> {
    private final Context context;
    private List<Song> songsList;
    private final List<Song> fullList;
    private final OnSongClickListener listener;

    public interface OnSongClickListener {
        void onSongClick(Song song, int position);
    }

    public SongAdapter(Context context, List<Song> songs, OnSongClickListener listener) {
        this.context = context;
        this.songsList = new ArrayList<>(songs);
        this.fullList = new ArrayList<>(songs);
        this.listener = listener;
    }

    public void updateList(List<Song> newSongs) {
        this.songsList = new ArrayList<>(newSongs);
        this.fullList = new ArrayList<>(newSongs);
        notifyDataSetChanged();
    }

    public void filter(String query) {
        songsList.clear();
        if (query == null || query.trim().isEmpty()) {
            songsList.addAll(fullList);
        } else {
            String lower = query.toLowerCase(Locale.getDefault());
            for (Song s : fullList) {
                if (s.getTitle().toLowerCase().contains(lower) ||
                    s.getArtist().toLowerCase().contains(lower) ||
                    s.getAlbum().toLowerCase().contains(lower)) {
                    songsList.add(s);
                }
            }
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public SongViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_song, parent, false);
        return new SongViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SongViewHolder holder, int position) {
        Song song = songsList.get(position);
        holder.tvTitle.setText(song.getTitle());
        holder.tvArtist.setText(song.getArtist() + " • " + formatDuration(song.getDuration()));

        Glide.with(context)
                .load(song.getAlbumArtUri())
                .placeholder(R.drawable.ic_album_placeholder)
                .error(R.drawable.ic_album_placeholder)
                .into(holder.imgCover);

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onSongClick(song, position);
            }
        });
    }

    private String formatDuration(long ms) {
        long sec = (ms / 1000) % 60;
        long min = (ms / (1000 * 60)) % 60;
        return String.format(Locale.getDefault(), "%d:%02d", min, sec);
    }

    @Override
    public int getItemCount() {
        return songsList.size();
    }

    static class SongViewHolder extends RecyclerView.ViewHolder {
        ImageView imgCover;
        TextView tvTitle, tvArtist;

        public SongViewHolder(@NonNull View itemView) {
            super(itemView);
            imgCover = itemView.findViewById(R.id.img_cover);
            tvTitle = itemView.findViewById(R.id.tv_title);
            tvArtist = itemView.findViewById(R.id.tv_artist);
        }
    }
}
`
    },
    {
      path: 'app/src/main/res/values/strings.xml',
      description: 'Application localized strings',
      content: `<resources>
    <string name="app_name">Navid Music</string>
    <string name="all_songs">All Songs</string>
    <string name="folders">Folders</string>
    <string name="albums">Albums</string>
    <string name="artists">Artists</string>
    <string name="playlists">Playlists</string>
    <string name="favorites">Favorites</string>
    <string name="equalizer">Equalizer</string>
    <string name="settings">Settings</string>
    <string name="no_songs_found">No music files found on this device</string>
    <string name="scan_storage">Scan Storage</string>
    <string name="bass_boost">Bass Boost</string>
    <string name="virtualizer">3D Virtualizer</string>
    <string name="presets">Presets</string>
    <string name="enable_eq">Enable Audio FX</string>
</resources>
`
    },
    {
      path: 'app/src/main/res/values/colors.xml',
      description: 'Color palette definition for Navid Music',
      content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#7C3AED</color>
    <color name="primary_dark">#5B21B6</color>
    <color name="accent">#06B6D4</color>
    <color name="bg_dark">#0F172A</color>
    <color name="bg_card">#1E293B</color>
    <color name="text_primary">#F8FAFC</color>
    <color name="text_secondary">#94A3B8</color>
    <color name="divider">#334155</color>
</resources>
`
    },
    {
      path: 'app/src/main/res/values/themes.xml',
      description: 'Material 3 Dark and Fullscreen themes',
      content: `<resources>
    <style name="Theme.NavidMusic" parent="Theme.Material3.Dark.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorSecondary">@color/accent</item>
        <item name="android:windowBackground">@color/bg_dark</item>
        <item name="android:statusBarColor">@color/bg_dark</item>
        <item name="android:navigationBarColor">@color/bg_dark</item>
    </style>

    <style name="Theme.NavidMusic.Fullscreen" parent="Theme.NavidMusic">
        <item name="android:windowFullscreen">true</item>
    </style>
</resources>
`
    },
    {
      path: 'app/src/main/res/layout/activity_main.xml',
      description: 'Main activity XML layout with Toolbar, RecyclerView and floating Mini Player',
      content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_dark">

    <com.google.android.material.appbar.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@color/bg_dark">

        <androidx.appcompat.widget.Toolbar
            android:id="@+id/toolbar"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            app:title="@string/app_name"
            app:titleTextColor="@color/text_primary" />

    </com.google.android.material.appbar.AppBarLayout>

    <FrameLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_behavior="@string/appbar_scrolling_view_behavior">

        <androidx.recyclerview.widget.RecyclerView
            android:id="@+id/recycler_view"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:paddingBottom="80dp"
            android:clipToPadding="false" />

        <LinearLayout
            android:id="@+id/layout_empty_state"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="center"
            android:gravity="center"
            android:orientation="vertical"
            android:visibility="gone">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="@string/no_songs_found"
                android:textColor="@color/text_secondary"
                android:textSize="16sp" />

        </LinearLayout>

    </FrameLayout>

    <!-- Mini Player at bottom -->
    <include
        android:id="@+id/layout_mini_player"
        layout="@layout/layout_mini_player"
        android:layout_width="match_parent"
        android:layout_height="64dp"
        android:layout_gravity="bottom"
        android:visibility="gone" />

</androidx.coordinatorlayout.widget.CoordinatorLayout>
`
    },
    {
      path: 'app/src/main/res/layout/layout_mini_player.xml',
      description: 'Floating bottom mini player widget',
      content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="64dp"
    android:layout_margin="8dp"
    app:cardCornerRadius="16dp"
    app:cardElevation="6dp"
    app:cardBackgroundColor="@color/bg_card">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:padding="8dp">

        <ImageView
            android:id="@+id/img_mini_cover"
            android:layout_width="48dp"
            android:layout_height="48dp"
            android:scaleType="centerCrop"
            android:src="@drawable/ic_album_placeholder" />

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="12dp"
            android:orientation="vertical">

            <TextView
                android:id="@+id/tv_mini_title"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Song Title"
                android:textColor="@color/text_primary"
                android:textSize="14sp"
                android:textStyle="bold"
                android:maxLines="1"
                android:ellipsize="end" />

            <TextView
                android:id="@+id/tv_mini_artist"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Artist"
                android:textColor="@color/text_secondary"
                android:textSize="12sp"
                android:maxLines="1"
                android:ellipsize="end" />

        </LinearLayout>

        <ImageView
            android:id="@+id/btn_mini_play_pause"
            android:layout_width="40dp"
            android:layout_height="40dp"
            android:padding="6dp"
            android:src="@drawable/ic_play"
            app:tint="@color/text_primary" />

    </LinearLayout>

</androidx.cardview.widget.CardView>
`
    },
    {
      path: 'app/src/main/res/layout/item_song.xml',
      description: 'Single song row item layout',
      content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="72dp"
    android:orientation="horizontal"
    android:gravity="center_vertical"
    android:paddingStart="16dp"
    android:paddingEnd="16dp"
    android:background="?selectableItemBackground">

    <ImageView
        android:id="@+id/img_cover"
        android:layout_width="48dp"
        android:layout_height="48dp"
        android:scaleType="centerCrop"
        android:src="@drawable/ic_album_placeholder" />

    <LinearLayout
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:layout_marginStart="16dp"
        android:orientation="vertical">

        <TextView
            android:id="@+id/tv_title"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textColor="@color/text_primary"
            android:textSize="15sp"
            android:textStyle="bold"
            android:maxLines="1"
            android:ellipsize="end" />

        <TextView
            android:id="@+id/tv_artist"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textColor="@color/text_secondary"
            android:textSize="13sp"
            android:maxLines="1"
            android:ellipsize="end" />

    </LinearLayout>

</LinearLayout>
`
    },
    {
      path: 'app/src/main/res/layout/activity_equalizer.xml',
      description: 'Hardware audio Equalizer UI layout',
      content: `<?xml version="1.0" encoding="utf-8"?>
<ScrollView
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_dark"
    android:padding="20dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <androidx.appcompat.widget.SwitchCompat
            android:id="@+id/switch_eq_enable"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="@string/enable_eq"
            android:textColor="@color/text_primary"
            android:textSize="16sp" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="24dp"
            android:text="@string/presets"
            android:textColor="@color/text_secondary" />

        <Spinner
            android:id="@+id/spinner_presets"
            android:layout_width="match_parent"
            android:layout_height="48dp"
            android:layout_marginTop="8dp"
            android:background="@color/bg_card" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="28dp"
            android:text="@string/bass_boost"
            android:textColor="@color/text_primary" />

        <SeekBar
            android:id="@+id/seek_bass_boost"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="12dp" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="28dp"
            android:text="@string/virtualizer"
            android:textColor="@color/text_primary" />

        <SeekBar
            android:id="@+id/seek_virtualizer"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="12dp" />

    </LinearLayout>

</ScrollView>
`
    },
    {
      path: 'app/src/main/res/menu/menu_main.xml',
      description: 'Toolbar options menu with search, equalizer, rescan',
      content: `<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto">
    <item
        android:id="@+id/action_search"
        android:icon="@android:drawable/ic_menu_search"
        android:title="Search"
        app:actionViewClass="androidx.appcompat.widget.SearchView"
        app:showAsAction="ifRoom|collapseActionView" />

    <item
        android:id="@+id/action_equalizer"
        android:icon="@drawable/ic_equalizer"
        android:title="@string/equalizer"
        app:showAsAction="ifRoom" />

    <item
        android:id="@+id/action_rescan"
        android:title="@string/scan_storage"
        app:showAsAction="never" />
</menu>
`
    },
    {
      path: 'app/src/main/res/drawable/ic_play.xml',
      description: 'Vector drawable for Play action',
      content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M8,5v14l11,-7z"/>
</vector>`
    },
    {
      path: 'app/src/main/res/drawable/ic_pause.xml',
      description: 'Vector drawable for Pause action',
      content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M6,19h4V5H6v14zm8,-14v14h4V5h-4z"/>
</vector>`
    },
    {
      path: 'app/src/main/res/drawable/ic_skip_next.xml',
      description: 'Vector drawable for Next track',
      content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M6,18l8.5,-6L6,6v12zM16,6v12h2V6h-2z"/>
</vector>`
    },
    {
      path: 'app/src/main/res/drawable/ic_skip_previous.xml',
      description: 'Vector drawable for Previous track',
      content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M6,6h2v12H6zm3.5,6l8.5,6V6z"/>
</vector>`
    },
    {
      path: 'app/src/main/res/drawable/ic_equalizer.xml',
      description: 'Vector drawable for Equalizer',
      content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M10,20h4V4h-4v16zm-6,0h4v-8H4v8zM16,9v11h4V9h-4z"/>
</vector>`
    },
    {
      path: 'app/src/main/res/drawable/ic_music_note.xml',
      description: 'Vector drawable for Music Note',
      content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M12,3v10.55c-0.59,-0.34 -1.27,-0.55 -2,-0.55 -2.21,0 -4,1.79 -4,4s1.79,4 4,4 4,-1.79 4,-4V7h4V3h-6z"/>
</vector>`
    },
    {
      path: 'app/src/main/res/drawable/ic_album_placeholder.xml',
      description: 'Placeholder icon for tracks without embedded cover art',
      content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="48dp"
    android:height="48dp"
    android:viewportWidth="48"
    android:viewportHeight="48">
    <path
        android:fillColor="#334155"
        android:pathData="M0,0h48v48h-48z"/>
    <path
        android:fillColor="#94A3B8"
        android:pathData="M24,8c-8.84,0 -16,7.16 -16,16s7.16,16 16,16 16,-7.16 16,-16S32.84,8 24,8zm0,22c-3.31,0 -6,-2.69 -6,-6s2.69,-6 6,-6 6,2.69 6,6 -2.69,6 -6,6z"/>
</vector>`
    },
    {
      path: 'README.md',
      description: 'Detailed instructions to build and install APK on real Android devices',
      content: `# Navid Music — Android Studio Project (v1.0.0)

**Navid Music** is a complete, modern, high-performance offline music player for Android with automatic MediaStore audio discovery, ExoPlayer/Media3 foreground service, lockscreen controls, folder browsing, customizable themes, and a working 5-band hardware Equalizer with Bass Boost and 3D Virtualizer.

Package Name: \`com.navid.music\`

---

## 🚀 How to Build & Install on Your Android Phone

### Option A: Using Android Studio (Recommended)
1. Extract the downloaded \`NavidMusic-AndroidStudio.zip\` to a folder on your computer.
2. Open **Android Studio** (Hedgehog, Iguana, Jellyfish, Koala or newer).
3. Select **File > Open...** and choose the extracted folder.
4. Allow Gradle to sync dependencies automatically.
5. Connect your Android phone via USB with **USB Debugging enabled** (or launch an Android Emulator).
6. Click the green **Run (▶)** button or select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
7. Your installable APK will be created at:
   \`app/build/outputs/apk/debug/app-debug.apk\`

---

### Option B: Using Command Line (Terminal / Mac / Linux / Windows)
\`\`\`bash
# Linux / macOS
./gradlew assembleDebug

# Windows CMD / PowerShell
gradlew.bat assembleDebug

# Install directly to your connected phone:
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`

---

## 📱 Android Version & Permission Handling
- **Android 13 through 16 (API 33-36)**:
  Uses modern granular \`android.permission.READ_MEDIA_AUDIO\` and \`POST_NOTIFICATIONS\` for lock screen media controls.
- **Android 7 through 12 (API 24-32)**:
  Uses legacy \`android.permission.READ_EXTERNAL_STORAGE\`.
- Background playback powered by **ExoPlayer Media3** running in a Foreground Service with Audio Focus interruption management (e.g. pauses during phone calls, resumes after).
`
    }
  ];
}

// Generate ZIP blob for 1-click download
export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const files = getAndroidProjectFiles();

  files.forEach((file) => {
    zip.file(file.path, file.content);
  });

  return await zip.generateAsync({ type: 'blob' });
}
