import { DynamicModule } from '@nestjs/common';
import { TemplateServiceConfig } from './template';
import { MODULE_CONFIG_OPTIONS } from './template.constants';
import { TemplateService } from './template.service';

export class TemplateModule {
  static register(options: TemplateServiceConfig = {}): DynamicModule {
    return {
      module: TemplateModule,
      providers: [
        {
          provide: MODULE_CONFIG_OPTIONS,
          useValue: options,
        },
        TemplateService,
      ],
      exports: [TemplateService],
    };
  }
}
