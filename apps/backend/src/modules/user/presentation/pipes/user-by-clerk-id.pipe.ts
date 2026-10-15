import { type JwtPayload } from '@clerk/types';
import {
  Injectable,
  NotFoundException,
  type PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';

import { UserService } from '@/modules/user/application/services/user.service';
import { User } from '@/modules/user/domain';

@Injectable()
export class UserByClerkIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: JwtPayload): Promise<User> {
    const providerId = value.sub;

    if (!providerId) {
      throw new UnauthorizedException('Missing provider ID in auth payload');
    }

    const user = await this.userService.findByProviderId(providerId);

    // Signed in with Clerk, but the user.created webhook hasn't reached us
    // (yet). Not the request's fault (400) nor a bad session (401)
    if (!user) {
      throw new NotFoundException(
        'Your account is still being set up. Please try again in a moment.',
      );
    }

    return user;
  }
}
