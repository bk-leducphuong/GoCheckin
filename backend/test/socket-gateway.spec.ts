/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';

describe('EventsGateway', () => {
  let app: INestApplication;
  let clientSocket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach((done) => {
    clientSocket = io('http://localhost:8000');
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  it('should join room successfully', (done) => {
    clientSocket.emit('join_room', 'EVENT-123', (response) => {
      expect(response.success).toBe(true);
      done();
    });
  });

  it('should send message to room', (done) => {
    clientSocket.emit(
      'new_checkin',
      {
        eventCode: 'EVENT-123',
        guestCode: 'G001',
        guestInfo: {
          guestCode: 'G001',
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '123-456-7890',
          imageUrl: 'https://example.com/image.jpg',
          description: 'Check-in description',
        },
        checkinInfo: {
          pointCode: 'P001',
          checkinTime: '2023-01-01T00:00:00.000Z',
        },
      },
      (response) => {
        expect(response.success).toBe(true);
        done();
      },
    );
  });

  it('should leave room successfully', (done) => {
    clientSocket.emit('leave_room', 'EVENT-123', (response) => {
      expect(response.success).toBe(true);
      done();
    });
  });
});
