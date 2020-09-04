import React from 'react';
import socketIOClient from 'socket.io-client';

export default class Body extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contents: '',
      loading: '',
      speechEnabled: false,
      loadBar: 1,
    };

    // This binding is necessary to make `this` work in the callback
    this.addLetter = this.addLetter.bind(this);
    this.addSickNote = this.addSickNote.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.enableSpeech = this.enableSpeech.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.adjustLoadBar = this.adjustLoadBar.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
  }

  addLetter() {
    this.setState({
      contents: 'Dear Sir/Madam,\n\n\n\nYours Sincerely',
    });
  }

  addSickNote() {
    this.setState({
      contents:
        'Dear Sir/Madam,\n \nFollowing a medical consultation, my professional estimation is that PATIENT NAME is not fit for work and has been signed off until DATE. \n\nYours Sincerely',
    });
  }

  adjustLoadBar() {
    if (!this.state.speechEnabled) {
      this.setState({ loading: '' });
    } else {
      if (this.state.loadBar === 5) {
        this.setState({ loadBar: 1 });
      } else {
        this.setState({ loadBar: this.state.loadBar + 1 });
      }

      var loadMsg = 'Listening';
      for (var i = 0; i < this.state.loadBar; i++) {
        loadMsg += '. ';
      }
    }

    this.setState({ loading: loadMsg });
  }

  async stopRecording() {
    const socket = socketIOClient('http://localhost:4000');
    socket.emit('endGoogleCloudStream');
    this.setState({
      speechEnabled: false,
      loading: 'Stopped',
    });
  }

  async enableSpeech() {
    this.setState({
      speechEnabled: true,
      loading: 'Listening...',
    });

    /*
    var loadMsg = this.state.speechEnabled ? 'Loading' : '';
    this.setState({ loading: loadMsg });
    
    this.adjustLoadBar();

    while (this.state.speechEnabled) {
      this.adjustLoadBar();
    }
    this.adjustLoadBar();
    */
    const socket = socketIOClient('http://localhost:4000');

    socket.emit('startGoogleCloudStream');

    socket.on('speechData', (data) => {
      console.log(data);
      const newData = this.state.contents.concat(data);
      this.setState({ contents: newData });
    });

    /*
    const response = await axios.get(
      'http://localhost:4000/api/speech-to-text/'
    );
    console.log(response);
    this.setState({ contents: response.data });
    */
  }

  handleChange(event) {
    this.setState({ contents: event.target.contents });
  }

  copyToClipboard() {
    /* Get the text field */
    var copyText = document.getElementById('textArea');

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/

    /* Copy the text inside the text field */
    document.execCommand('copy');

    /* Alert the copied text */
    alert('Copied the text: ' + copyText.value);
  }

  render() {
    const buttonStyle = {
      backgroundColor: 'green',
      borderWidth: 'medium',
      borderColor: 'black',
      color: 'white',
      padding: 20,
      textAlign: 'center',
      textDecoration: 'none',
      display: 'inline-block',
      fontSize: 16,
      cursor: 'pointer',
      maxWidth: '50%',
      maxHeight: '15%',
      borderRadius: '50%',
      marginLeft: 10,
      position: 'relative',
    };

    return (
      <div>
        <div className="jumbotron text-center">
          <h1>NoteNow</h1>
          <p>A handy tool to save you time.</p>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="col-4">
              <h3>Templates</h3>
              <button
                id="letterTemplate"
                onClick={this.addLetter}
                type="button"
                className="btn btn-primary"
              >
                Letter
              </button>
              <button
                id="sickNote"
                onClick={this.addSickNote}
                type="button"
                className="btn btn-primary"
              >
                Sick Leave
              </button>
              <hr />
              <h3>Record</h3>
              <button>
                <svg
                  onClick={this.enableSpeech}
                  width="3em"
                  height="3em"
                  viewBox="0 0 16 16"
                  className="bi bi-mic-fill"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
                  <path
                    fillRule="evenodd"
                    d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"
                  />
                </svg>
              </button>
              <button
                style={buttonStyle}
                id="stop"
                onClick={this.stopRecording}
              >
                stop
              </button>
              <p>{this.state.loading}</p>
            </div>
            <div className="col-8">
              <textarea
                id="textArea"
                style={{ width: 'inherit' }}
                rows="10"
                value={this.state.contents}
                onChange={this.handleChange}
              ></textarea>

              <button
                onClick={this.copyToClipboard}
                type="button"
                className="btn btn-info"
              >
                Copy Text
              </button>
              <button type="button" className="btn btn-info">
                Email Text
              </button>
              <hr />
              <p style={{ color: 'gray' }}>
                Tip: to switch between different applications, use Alt + Tab
                (Windows) or command + Tab (Mac).
              </p>
            </div>
          </div>
        </div>

        <script
          src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
          integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj"
          crossOrigin="anonymous"
        ></script>
        <script
          src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"
          integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN"
          crossOrigin="anonymous"
        ></script>
        <script
          src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"
          integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV"
          crossOrigin="anonymous"
        ></script>
      </div>
    );
  }
}
