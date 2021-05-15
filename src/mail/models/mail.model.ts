import { kebabCase } from 'lodash';

export class Mail {
  public key: string;

  public locale: string;

  public from: string;

  public to = [];

  public cc = [];

  public bcc = [];

  public replyTo = [];

  public subject: string;

  public payload: any = {};

  public template: string;

  public text = '';

  setDefault() {
    if (!this.key) {
      this.key = kebabCase(this.template).replace(/-/g, '_');
    }
  }
}
