import { Test, TestingModule } from '@nestjs/testing';
import { CardReminderService } from './card-reminder.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { MailService } from '../mail/mail.service';

describe('CardReminderService', () => {
  let service: CardReminderService;
  let cardRepo: jest.Mocked<Repository<Card>>;
  let mailService: jest.Mocked<MailService>;

  const mockCardRepo = {
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
  };

  const mockMailService = {
    sendReminderEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardReminderService,
        { provide: getRepositoryToken(Card), useValue: mockCardRepo },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get(CardReminderService);
    cardRepo = module.get(getRepositoryToken(Card));
    mailService = module.get(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* ================= SUCCESS CASE ================= */

  it('should send reminder and mark as sent', async () => {
    const now = new Date();

    const mockCard = {
      id: 1,
      title: 'Test Card',
      dueDate: new Date(now.getTime() - 60000), // already due
      reminderMinutes: 0,
      reminderSent: false,
      list: {
        board: {
          owner: { email: 'test@mail.com' },
        },
      },
    };

    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockCard]),
    };

    mockCardRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockMailService.sendReminderEmail.mockResolvedValue(true);

    await service.sendReminders();

    expect(mockMailService.sendReminderEmail).toHaveBeenCalledWith(
      'test@mail.com',
      'Test Card',
      mockCard.dueDate,
    );

    expect(mockCardRepo.save).toHaveBeenCalled();
  });

  /* ================= EMAIL FAIL ================= */

  it('should not mark reminderSent if email fails', async () => {
    const mockCard = {
      id: 1,
      title: 'Card',
      dueDate: new Date(),
      reminderMinutes: 0,
      reminderSent: false,
      list: {
        board: {
          owner: { email: 'test@mail.com' },
        },
      },
    };

    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockCard]),
    };

    mockCardRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockMailService.sendReminderEmail.mockResolvedValue(false);

    await service.sendReminders();

    expect(mockCardRepo.save).not.toHaveBeenCalled();
  });

  /* ================= SKIP NO DUE DATE ================= */

  it('should skip card without dueDate', async () => {
    const mockCard = {
      id: 1,
      reminderMinutes: 10,
      reminderSent: false,
      list: { board: { owner: { email: 'test@mail.com' } } },
    };

    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockCard]),
    };

    mockCardRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    await service.sendReminders();

    expect(mockMailService.sendReminderEmail).not.toHaveBeenCalled();
  });

  /* ================= SKIP NO REMINDER MINUTES ================= */

  it('should skip if reminderMinutes is missing', async () => {
    const mockCard = {
      id: 1,
      dueDate: new Date(),
      reminderSent: false,
      list: { board: { owner: { email: 'test@mail.com' } } },
    };

    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockCard]),
    };

    mockCardRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    await service.sendReminders();

    expect(mockMailService.sendReminderEmail).not.toHaveBeenCalled();
  });

  /* ================= SKIP NO OWNER EMAIL ================= */

  it('should skip if owner email missing', async () => {
    const mockCard = {
      id: 1,
      dueDate: new Date(),
      reminderMinutes: 10,
      reminderSent: false,
      list: { board: { owner: {} } },
    };

    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockCard]),
    };

    mockCardRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    await service.sendReminders();

    expect(mockMailService.sendReminderEmail).not.toHaveBeenCalled();
  });

  /* ================= SKIP IF NOT TIME YET ================= */

  it('should not send if reminder time not reached', async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour later

    const mockCard = {
      id: 1,
      title: 'Future Card',
      dueDate: futureDate,
      reminderMinutes: 10,
      reminderSent: false,
      list: {
        board: {
          owner: { email: 'test@mail.com' },
        },
      },
    };

    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockCard]),
    };

    mockCardRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    await service.sendReminders();

    expect(mockMailService.sendReminderEmail).not.toHaveBeenCalled();
  });
});