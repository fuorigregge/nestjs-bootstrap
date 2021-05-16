import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { AppAbility } from 'src/auth/casl/ability-factory.casl';
import { Pagination } from 'src/core/pagination/mongo-pagination';
import { PaginationInput } from 'src/core/pagination/pagination.input';
import { toMongoQuery } from 'src/core/schemas/plugins/casl-mongoose';
import { User } from 'src/users/schemas/user.schema';
import { CreateCustomerInput } from './inputs/create-customer.input';
import { Customer } from './schemas/customer.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: ReturnModelType<typeof Customer>,
  ) {}

  async create(
    createCustomerInput: CreateCustomerInput,
    user: User,
  ): Promise<Customer> {
    const createdCustomer = new this.customerModel({
      ...createCustomerInput,
      workspace_id: user.current_workspace_id,
    });
    return createdCustomer.save();
  }

  async update(
    id: string,
    createCustomerInput: CreateCustomerInput,
  ): Promise<Customer> {
    return await this.customerModel.findByIdAndUpdate(
      { _id: id },
      createCustomerInput,
    );
  }

  async findByWorkspace(ability: AppAbility): Promise<Customer[]> {
    return this.customerModel.find({}).accessibleBy(ability);
  }

  async paginateByWorkspace(
    pagination: PaginationInput,
    ability: AppAbility,
  ): Promise<Pagination<Customer>> {
    const query = toMongoQuery(ability, Customer);
    return await this.customerModel.paginate(query, pagination);
  }

  async findOneByWorkspace(id: string, ability: AppAbility): Promise<Customer> {
    return this.customerModel.findOne({ _id: id }).accessibleBy(ability);
  }
}
