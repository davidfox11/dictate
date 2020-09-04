const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
//const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = socketIo(server);
app.use(bodyParser.json());
app.use(cors());
var recognizeStream;

const recorder = require('node-record-lpcm16');

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

// Creates a client
const speechClient = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
function startRecognitionStream(client, recognizeStream) {
  const encoding = 'LINEAR16';
  const sampleRateHertz = 16000;
  const languageCode = 'en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    interimResults: false, // If you want interim results, set this to true
  };

  let output = '';
  // Create a recognize stream
  recognizeStream = speechClient
    .streamingRecognize(request)
    .on('error', console.error)
    //.on('data', (data) => {
    .on('data', (chunk) => {
      output += chunk.results[0].alternatives[0].transcript;
      /*
      process.stdout.write(
        //console.log(
        data.results[0] && data.results[0].alternatives[0]
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : '\n\nReached transcription time limit, press Ctrl+C\n'
      );
      */

      client.emit('speechData', output);
      output = '';

      // if end of utterance, let's restart stream
      // this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
      /*
      if (data.results[0] && data.results[0].isFinal) {
        //stopRecognitionStream();
        startRecognitionStream(client);
        // console.log('restarted stream serverside');
      }
      */
    });

  // Start recording and send the microphone input to the Speech API.
  // Ensure SoX is installed, see https://www.npmjs.com/package/node-record-lpcm16#dependencies
  recorder
    .record({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '1.0',
    })
    .stream()
    .on('error', console.error)
    .pipe(recognizeStream);
}

function dictate() {
  const encoding = 'LINEAR16';
  const sampleRateHertz = 16000;
  const languageCode = 'en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    interimResults: false, // If you want interim results, set this to true
  };

  let output = '';
  // Create a recognize stream
  var recognizeStream = speechClient
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', (data) => {
      //.on('data', (chunk) => {
      //  output += chunk.results[0].alternatives[0].transcript;

      //process.stdout.write(
      console.log(
        data.results[0] && data.results[0].alternatives[0]
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : '\n\nReached transcription time limit, press Ctrl+C\n'
      );

      //client.emit('speechData', output);

      // if end of utterance, let's restart stream
      // this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
      /*
      if (data.results[0] && data.results[0].isFinal) {
        //stopRecognitionStream();
        startRecognitionStream(client);
        // console.log('restarted stream serverside');
      }
      */
    });

  // Start recording and send the microphone input to the Speech API.
  // Ensure SoX is installed, see https://www.npmjs.com/package/node-record-lpcm16#dependencies
  recorder
    .record({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '1.0',
    })
    .stream()
    .on('error', console.error)
    .pipe(recognizeStream);
}

function stopRecognitionStream(recognizeStream) {
  if (recognizeStream) {
    recognizeStream.end();
  }
  recognizeStream = null;
}

let interval;

io.on('connection', (socket) => {
  console.log('New client connected');
  /*
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 100);
  */
  socket.on('startGoogleCloudStream', function (data) {
    startRecognitionStream(this, recognizeStream, data);
  });

  socket.on('endGoogleCloudStream', function () {
    console.log('stopping stream');
    socket.disconnect();
    stopRecognitionStream(recognizeStream);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

/*
const getApiAndEmit = (socket) => {
  //const response = new Date();
  const response = dictate(this, data);
  dictate(function (err, result) {
    if (err) {
      console.log('Error retrieving transcription: ', err);
      res.status(500).send('Error 500');
      return;
    }
    socket.emit('FromAPI', data);
  });
  socket.emit('FromAPI', response);
  // Emitting a new message. Will be consumed by the client
};
*/

server.listen(4000, () => {
  //dictate();
  console.log('Listening on port 4000');
});
