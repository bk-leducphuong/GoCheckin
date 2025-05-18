import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { UserRole } from '../src/account/entities/account.entity';
import { JwtPayload } from '../src/common/interfaces/jwt-payload.interface';

/**
 * Creates a testing module with mocked guards
 * @param controllers - Array of controllers to include in the module
 * @param providers - Array of providers to include in the module
 * @returns Test module for the application
 */
export async function createTestingModule(
  controllers: any[],
  providers: any[],
): Promise<TestingModule> {
  // Mock guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  };

  const moduleFixture = await Test.createTestingModule({
    controllers,
    providers,
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockJwtAuthGuard)
    .overrideGuard(RolesGuard)
    .useValue(mockRolesGuard)
    .compile();

  return moduleFixture;
}

/**
 * Creates a test NestJS application with validation pipe
 * @param moduleFixture - The testing module fixture
 * @returns Configured NestJS application for testing
 */
export async function createTestingApp(
  moduleFixture: TestingModule,
): Promise<INestApplication> {
  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();
  return app;
}

/**
 * Injects a mock user into the JWT auth guard
 * @param mockJwtAuthGuard - The mock JWT auth guard
 * @param role - The role to assign to the mock user
 * @returns A mock user with the specified role
 */
export function injectMockUser(
  mockJwtAuthGuard: any,
  role: UserRole = UserRole.ADMIN,
): JwtPayload {
  const mockUser: JwtPayload = {
    userId: 'user-uuid',
    email: `${role.toLowerCase()}@example.com`,
    role: role,
  };

  // Update the mockJwtAuthGuard to inject the user
  mockJwtAuthGuard.canActivate.mockImplementation((context) => {
    const req = context.switchToHttp().getRequest();
    req.user = mockUser;
    return true;
  });

  return mockUser;
}

/**
 * Gets the mock JWT auth guard from the testing module
 * @param moduleFixture - The testing module fixture
 * @returns The mock JWT auth guard
 */
export function getMockJwtAuthGuard(moduleFixture: TestingModule): any {
  const guards = (moduleFixture as any)._instanceLinks.get(JwtAuthGuard);
  return guards ? guards.instance : null;
}

/**
 * Gets the mock roles guard from the testing module
 * @param moduleFixture - The testing module fixture
 * @returns The mock roles guard
 */
export function getMockRolesGuard(moduleFixture: TestingModule): any {
  const guards = (moduleFixture as any)._instanceLinks.get(RolesGuard);
  return guards ? guards.instance : null;
}
