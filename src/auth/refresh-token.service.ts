import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mongoose, ReturnModelType } from '@typegoose/typegoose';
import { User } from 'src/users/schemas/user.schema';
import { RefreshToken } from './schemas/refresh-token.schema';

//import { User, RefreshToken } from '../../models'

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly tokenModel: ReturnModelType<typeof RefreshToken>,
  ) {}

  public async createRefreshToken(
    user: User,
    ttl: number,
  ): Promise<RefreshToken> {
    const token = new this.tokenModel();

    token.user_id = new mongoose.Types.ObjectId(user.id);

    token.is_revoked = false;

    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + ttl);
    token.expires_at = expires;

    return token.save();
  }

  public async findTokenById(id: string): Promise<RefreshToken | null> {
    return this.tokenModel.findOne({ _id: id });
  }
}
