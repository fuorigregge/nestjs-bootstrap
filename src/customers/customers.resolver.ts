import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { CustomersService } from './customers.service';
import { CreateCustomerInput } from './inputs/create-customer.input';
import { Customer, PaginatedCustomers } from './graphql/customer.graphql';
import { CheckPolicies } from 'src/auth/casl/decorators/check-policy.decorator';
import { PolicyInterceptor } from 'src/auth/casl/policies.interceptor';
import { Action } from 'src/auth/casl/actions.casl';
import { Customer as CustomerDocument } from './schemas/customer.schema';
import { PoliciesGuard } from 'src/auth/casl/policy-guard.casl';
import { UserAbility } from 'src/auth/casl/decorators/ability.decorator';
import { AppAbility } from 'src/auth/casl/ability-factory.casl';
import { PaginationInput } from 'src/core/pagination/pagination.input';

@Resolver((of) => Customer)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies({ action: Action.Read, resource: CustomerDocument })
  @UseInterceptors(PolicyInterceptor)
  @Query((retuns) => [Customer], { nullable: 'items' })
  async customers(@UserAbility() ability: AppAbility) {
    return this.customersService.findByWorkspace(ability);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies({ action: Action.Read, resource: CustomerDocument })
  @UseInterceptors(PolicyInterceptor)
  @Query((retuns) => PaginatedCustomers)
  async paginatedCustomers(
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @UserAbility() ability: AppAbility,
  ) {
    return this.customersService.paginateByWorkspace(pagination, ability);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies({ action: Action.Read, resource: CustomerDocument })
  @UseInterceptors(PolicyInterceptor)
  @Query((returns) => Customer, { nullable: true })
  async customer(@Args('id') id: string, @UserAbility() ability: AppAbility) {
    return this.customersService.findOneByWorkspace(id, ability);
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies({ action: Action.Create, resource: CustomerDocument })
  @Mutation((returns) => String, { name: 'createCustomer' })
  async create(
    @Args('customer') args: CreateCustomerInput,
    @CurrentUser() user: User,
  ) {
    const customer = await this.customersService.create(args, user);
    return customer.id;
  }

  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies({ action: Action.Update, resource: CustomerDocument })
  @Mutation((returns) => String, { name: 'updateCustomer' })
  async update(
    @Args('id') id: string,
    @Args('customer') args: CreateCustomerInput,
    @CurrentUser() user: User,
  ): Promise<string> {
    const customer = await this.customersService.update(id, args);
    return customer.id;
  }
}
