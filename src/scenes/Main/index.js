import React, { Component } from 'react';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import Sound from 'react-native-sound';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'steelblue',
  },
  subContainer: {
    marginTop: 50,
    width: 200,
    height: 50,
    backgroundColor: '#161840',
    borderRadius: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: 'white',
    fontSize: 20,
  }
});

export class MainScene extends Component {
  static propTypes = {
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentTime: 0.0,
      recording: false,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
      hasPermission: undefined,
    };
  }
  componentDidMount() {
    this._checkPermission().then((hasPermission) => {
      this.setState({ hasPermission });
      if (!hasPermission) return;
      const audioPath = this.getCurrentDate();
      this.prepareRecordingPath(audioPath);
      AudioRecorder.onProgress = (data) => {
        this.setState({ currentTime: Math.floor(data.currentTime) });
      };
      AudioRecorder.onFinished = (data) => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
          this._finishRecording(data.status === 'OK', data.audioFileURL);
        }
      };
      this.setState({ audioPath });
    });
  }
  getCurrentDate = () => {
    const date = new Date;
    const currentDate = `${date.getUTCDay()}${date.getUTCMonth()}`;
    const currentTime = `${date.getUTCHours()}${date.getUTCMinutes()}${date.getUTCSeconds()}`;
    return AudioUtils.DocumentDirectoryPath + `/${currentDate}${currentTime}.aac`;
  };
  prepareRecordingPath = (audioPath) => {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'Low',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000
    });
  };
  _checkPermission = () => {
    if (Platform.OS !== 'android') {
      return Promise.resolve(true);
    }
    const rationale = {
      title: 'Microphone Permission',
      message: 'AudioExample needs access to your microphone so you can record audio.'
    };
    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
    .then((result) => {
      console.log('Permission result:', result);
      return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
    });
  };
  _play = async () => {
    if (this.state.recording) {
      await this._stop();
    }
    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      const sound = new Sound(this.state.audioPath, '', (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });
      setTimeout(() => {
        sound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
  };
  _pause = async () => {
    if (!this.state.recording) {
      console.warn('Can\'t pause, not recording!');
      return;
    }
    this.setState({ stoppedRecording: true, recording: false });
    try {
      const filePath = await AudioRecorder.pauseRecording();
      // Pause is currently equivalent to stop on Android.
      if (Platform.OS === 'android') {
        this._finishRecording(true, filePath);
      }
    } catch (error) {
      console.error(error);
    }
  };
  _stop = async () => {
    if (!this.state.recording) {
      console.warn('Can\'t stop, not recording!');
      return;
    }
    this.setState({ stoppedRecording: true, recording: false });
    try {
      const filePath = await AudioRecorder.stopRecording();
      if (Platform.OS === 'android') {
        this._finishRecording(true, filePath);
      }
      console.info('stop-filepath', filePath);
    } catch (error) {
      console.error(error);
    }
  };
  _record = async () => {
    if (this.state.recording) {
      console.warn('Already recording!');
      return;
    }
    if (!this.state.hasPermission) {
      console.warn('Can\'t record, no permission granted!');
      return;
    }
    if (this.state.stoppedRecording) {
      const audioPath = this.getCurrentDate();
      this.prepareRecordingPath(audioPath);
      this.setState({ audioPath });
    }
    this.setState({ recording: true });
    try {
      const filePath = await AudioRecorder.startRecording();
      console.info('filePath', filePath);
    } catch (error) {
      console.error(error);
    }
  };
  _finishRecording = (didSucceed, filePath) => {
    this.setState({ finished: didSucceed });
    console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
  }
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.subContainer} onPress={this._record}>
          <Text style={styles.text}>
            Record
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subContainer} onPress={this._play}>
          <Text style={styles.text}>
            Play
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subContainer} onPress={this._stop}>
          <Text style={styles.text}>
            Stop
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subContainer} onPress={this._pause}>
          <Text style={styles.text}>
            Pause
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}
