import React from 'react';
import socketIOClient from 'socket.io-client';
//import RichEditorExample from './draft-js/RichEditorExample';
import Draft, { convertFromRaw } from 'draft-js';
import './draft-js/rich-editor-example.css';
import { Modifier, ContentState } from 'draft-js';

export default class Body extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contents: '',
      loading: '',
      speechEnabled: false,
      loadBar: 1,
      editorState: EditorState.createEmpty(),
    };

    // This binding is necessary to make `this` work in the callback
    this.addLetter = this.addLetter.bind(this);
    this.addSickNote = this.addSickNote.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.enableSpeech = this.enableSpeech.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.adjustLoadBar = this.adjustLoadBar.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.updateChild = this.updateChild.bind(this);
    this.insertNewText = this.insertNewText.bind(this);
    this.resetEditor = this.resetEditor.bind(this);

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => this.setState({ editorState });

    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.onTab = (e) => this._onTab(e);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
  }

  insertNewText(text) {
    const currentContent = this.state.editorState.getCurrentContent(),
      currentSelection = this.state.editorState.getSelection();

    const newContent = Modifier.replaceText(
      currentContent,
      currentSelection,
      text
    );

    const newEditorState = EditorState.push(this.state.editorState, newContent);

    this.setState({ editorState: newEditorState });
    //return  newEditorState;
  }

  addLetter() {
    const newContents = 'Dear Sir/Madam,\n\n\n\nYours Sincerely';
    this.insertNewText(newContents);
  }

  addSickNote() {
    const newContents =
      'Dear Sir/Madam,\n \nFollowing a medical consultation, my professional estimation is that PATIENT NAME is not fit for work and has been signed off until DATE. \n\nYours Sincerely';
    this.insertNewText(newContents);
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
      this.insertNewText(data);
      //const newData = this.state.editorState.concat(data);
      //this.setState({ editorState: data });
      //const cnvData = convertFromRaw(data);
      /*
      const newEditorState = this.state.editorState.push(
        this.state.editorState,
        data
      );
      this.setState({ editorState: newEditorState });
      //this.onChange(data);
      */
    });

    /*
    const response = await axios.get(
      'http://localhost:4000/api/speech-to-text/'
    );
    console.log(response);
    this.setState({ contents: response.data });
    */
  }

  updateChild(text) {
    updateState(text);
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

  resetEditor() {
    const newEditorState = EditorState.push(
      this.state.editorState,
      ContentState.createFromText('')
    );
    this.setState({ editorState: newEditorState });
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
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

    //const { editorState } = this.state.editorState;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = this.state.editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

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
                style={templateStyle}
              >
                Letter
              </button>
              <button
                id="sickNote"
                onClick={this.addSickNote}
                type="button"
                className="btn btn-primary"
                style={templateStyle}
              >
                Sick Leave
              </button>
              <hr />
              <h3>Record</h3>
              <button id="record" style={recordStyle}>
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
            <div>
              <div className="RichEditor-root">
                <BlockStyleControls
                  editorState={this.state.editorState}
                  onToggle={this.toggleBlockType}
                />
                <InlineStyleControls
                  editorState={this.state.editorState}
                  onToggle={this.toggleInlineStyle}
                />
                <div className={className} onClick={this.focus}>
                  <Editor
                    blockStyleFn={getBlockStyle}
                    customStyleMap={styleMap}
                    editorState={this.state.editorState}
                    handleKeyCommand={this.handleKeyCommand}
                    onChange={this.onChange}
                    onTab={this.onTab}
                    placeholder="Begin typing..."
                    ref="editor"
                    spellCheck={true}
                  />
                </div>
              </div>

              <button
                onClick={this.copyToClipboard}
                type="button"
                className="btn btn-info"
                style={actionBtns}
              >
                Copy Text
              </button>
              <button type="button" className="btn btn-info" style={actionBtns}>
                Email Text
              </button>
              <button
                type="button"
                className="btn btn-info"
                style={actionBtns}
                onClick={this.resetEditor}
              >
                Reset Editor
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

function updateState(editorState) {
  this.setState({ editorState });
}

const { Editor, EditorState, RichUtils } = Draft;

class RichEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };

    updateState = updateState.bind(this);

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => this.setState({ editorState });

    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.onTab = (e) => this._onTab(e);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  }

  render() {
    const { editorState } = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div className="RichEditor-root">
        <BlockStyleControls
          editorState={editorState}
          onToggle={this.toggleBlockType}
        />
        <InlineStyleControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
        />
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={updateState}
            onTab={this.onTab}
            placeholder="Tell a story..."
            ref="editor"
            spellCheck={true}
          />
        </div>
      </div>
    );
  }
}

const actionBtns = {
  margin: 10,
};

const templateStyle = {
  display: 'block',
  margin: 10,
};

const recordStyle = {
  backgroundColor: 'red',
  borderWidth: 'medium',
  borderColor: 'black',
  color: 'black',
  padding: 20,
  cursor: 'pointer',
  maxWidth: '50%',
  maxHeight: '15%',
  borderRadius: '50%',
  left: 100,
  right: 100,
};

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

var INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};
