import './formik-demo.css';
import './rich-editor.css';
import React from 'react';
import { render } from 'react-dom';
import { withFormik } from 'formik';
import { EditorState } from 'draft-js';
import { RichEditorExample } from './RichEditor';

const formikEnhancer = withFormik({
  mapPropsToValues: (props) => ({
    editorState: new EditorState.createEmpty(),
    email: '',
  }),
  handleSubmit: (values, { setSubmitting }) => {
    setTimeout(() => {
      // you probably want to transform draftjs state to something else, but I'll leave that to you.
      alert(JSON.stringify(values, null, 2));
      setSubmitting(false);
    }, 1000);
  },
  displayName: 'MyForm',
});

const MyForm = ({
  values,
  touched,
  dirty,
  errors,
  handleChange,
  handleBlur,
  handleSubmit,
  handleReset,
  setFieldValue,
  isSubmitting,
}) => (
  <form onSubmit={handleSubmit}>
    <label htmlFor="email" style={{ display: 'block' }}>
      Email
    </label>
    <input
      id="email"
      placeholder="Enter your email"
      type="email"
      value={values.email}
      onChange={handleChange}
      onBlur={handleBlur}
    />
    {errors.email && touched.email && (
      <div style={{ color: 'red', marginTop: '.5rem' }}>{errors.email}</div>
    )}
    <label htmlFor="email" style={{ display: 'block', marginTop: '.5rem' }}>
      Story
    </label>
    <RichEditorExample
      editorState={values.editorState}
      onChange={setFieldValue}
      onBlur={handleBlur}
    />
    <button
      type="button"
      className="outline"
      onClick={handleReset}
      disabled={!dirty || isSubmitting}
    >
      Reset
    </button>
    <button type="submit" disabled={isSubmitting}>
      Submit
    </button>
  </form>
);

export const MyEnhancedForm = formikEnhancer(MyForm);
