/*eslint-disable @typescript-eslint/no-var-requires*/

/**
 * https://github.com/reactjs/express-react-views
 */
import { Inject, Injectable } from '@nestjs/common';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { TemplateServiceConfig } from './template';
import { MODULE_CONFIG_OPTIONS } from './template.constants';
import path from 'path';
import assign from 'object-assign';
import beautify from 'js-beautify';
import _escaperegexp from 'lodash.escaperegexp';
import { ServerStyleSheet } from 'styled-components';
import juice from 'juice';

const DEFAULT_OPTIONS: TemplateServiceConfig = {
  doctype: '<!DOCTYPE html>',
  templateDir: path.join(process.env.PWD, 'dist', 'templates', 'views'),
  beautify: false,
  transformViews: true,
  inlineCSS: true,
  babel: {
    presets: [
      '@babel/preset-react',
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
    plugins: [
      '@babel/transform-flow-strip-types',
      'babel-plugin-styled-components',
    ],
  },
};

@Injectable()
export class TemplateService {
  private engineOptions: TemplateServiceConfig;

  private registered = false;

  private moduleDetectRegEx: RegExp;

  constructor(
    @Inject(MODULE_CONFIG_OPTIONS) private options: TemplateServiceConfig,
  ) {
    this.engineOptions = assign({}, DEFAULT_OPTIONS, options);
  }

  /**
   * render with styled components
   * @param filename
   * @param data
   */
  public render(filename, data) {
    // Defer babel registration until the first request so we can grab the view path.
    if (!this.moduleDetectRegEx) {
      // Path could contain regexp characters so escape it first.
      // options.settings.views could be a single string or an array
      this.moduleDetectRegEx = new RegExp(
        []
          .concat(this.engineOptions.templateDir)
          .map((viewPath) => '^' + _escaperegexp(viewPath))
          .join('|'),
      );
    }

    //obbligatorio
    if (this.engineOptions.transformViews && !this.registered) {
      require('@babel/register')(
        assign(
          { only: [].concat(this.engineOptions.templateDir) },
          this.engineOptions.babel,
        ),
      );
      this.registered = true;
    }

    let markup,
      html,
      styleTags = '';

    const sheet = new ServerStyleSheet();

    try {
      markup = this.engineOptions.doctype;

      let component = require(`${this.engineOptions.templateDir}/${filename}`);

      // Transpiled ES6 may export components as { default: Component }
      component = component.default || component;
      html = ReactDOMServer.renderToStaticMarkup(
        sheet.collectStyles(React.createElement(component, data)),
      );

      styleTags = sheet.getStyleTags();
    } catch (e) {
      return e;
    } finally {
      if (process.env.NODE_ENV === 'development') {
        // Remove all files from the module cache that are in the view folder.
        Object.keys(require.cache).forEach(function (module) {
          if (this.moduleDetectRegEx.test(require.cache[module].filename)) {
            delete require.cache[module];
          }
        });
      }
      sheet.seal();
    }

    markup += `<head>${styleTags}</head>` + html;

    if (this.engineOptions.beautify) {
      // NOTE: This will screw up some things where whitespace is important, and be
      // subtly different than prod.
      markup = beautify.html(markup);
    }

    if (this.engineOptions.inlineCSS) {
      return juice(markup);
    }

    return markup;
  }
}
