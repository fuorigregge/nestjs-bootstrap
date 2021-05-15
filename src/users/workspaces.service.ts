import { Injectable } from '@nestjs/common';
import { CreateWorkspaceInput } from './inputs/create-workspace.input';
import { Workspace } from './schemas/workspace.schema';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: ReturnModelType<typeof Workspace>,
  ) {}

  async create(createWorkspaceInput: CreateWorkspaceInput): Promise<Workspace> {
    const createdWorkspace = new this.workspaceModel(createWorkspaceInput);
    return await createdWorkspace.save();
  }

  async findOneById(id: string): Promise<Workspace | undefined> {
    return this.workspaceModel.findOne({ _id: id });
  }

  async findByIds(ids: string[]): Promise<Workspace[] | undefined> {
    return this.workspaceModel.find({ _id: { $in: ids } });
  }
}
