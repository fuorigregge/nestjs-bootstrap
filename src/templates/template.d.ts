type BabelConfig = {
  presets: any[];
  plugins: string[];
};

export type TemplateServiceConfig = {
  doctype?: string;
  templateDir?: string;
  beautify?: boolean;
  transformViews?: boolean;
  inlineCSS?: boolean;
  babel?: BabelConfig;
};
