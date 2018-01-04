import React from 'react';
import PropTypes from 'prop-types';

import Editor from './PageEditor/Editor';
import Preview from './PageEditor/Preview';

export default class PageEditor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      markdown: '',
      html: '',
    };

    this.onMarkdownChanged = this.onMarkdownChanged.bind(this);
  }

  /**
   * the change event handler for `markdown` state
   * @param {string} value
   */
  onMarkdownChanged(value) {
    this.setState({
      markdown: value,
      html: '',
    });

    this.renderPreview();
  }

  renderPreview() {
    // generate options obj
    const rendererOptions = {
      // see: https://www.npmjs.com/package/marked
      marked: {
        breaks: false
      }
    };

    // render html
    var context = {
      markdown: this.state.markdown,
      dom: this.previewElement,
      currentPagePath: decodeURIComponent(location.pathname)
    };

    this.props.crowi.interceptorManager.process('preRenderPreview', context)
      .then(() => crowi.interceptorManager.process('prePreProcess', context))
      .then(() => {
        context.markdown = crowiRenderer.preProcess(context.markdown, context.dom);
      })
      .then(() => crowi.interceptorManager.process('postPreProcess', context))
      .then(() => {
        var parsedHTML = crowiRenderer.render(context.markdown, context.dom, rendererOptions);
        context['parsedHTML'] = parsedHTML;
      })
      .then(() => crowi.interceptorManager.process('postRenderPreview', context))
      .then(() => crowi.interceptorManager.process('preRenderPreviewHtml', context))
      .then(() => {
        this.setState({html: context.parsedHTML});
      })
      // process interceptors for post rendering
      .then(() => crowi.interceptorManager.process('postRenderPreviewHtml', context));

  }

  render() {
    return (
      <div>
        <Editor value={this.state.markdown} onChange={this.onMarkdownChanged} />
        <Preview html={this.state.html} inputRef={el => this.previewElement = el} />
      </div>
    )
  }
}

PageEditor.propTypes = {
  crowi: PropTypes.object.isRequired,
};
