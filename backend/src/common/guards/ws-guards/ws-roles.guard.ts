// ws-roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/account/entities/account.entity';
import { Roles } from 'src/common/decorators/roles.decorator';

@Injectable()
export class WsRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const client = context.switchToWs().getClient();
    const user = client.user;

    return requiredRoles.some(
      (role) => (user as { role: UserRole })?.role === role,
    );
  }
}
