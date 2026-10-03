import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Order } from '../../modules/orders/entities/order.entity';
import { Staff } from '../../modules/staffs/entities/staff.entity';
import { Ticket, TicketStatuses, TicketTypes } from '../../modules/tickets/entities/ticket.entity';
import { User } from '../../modules/users/entities/user.entity';
import { logResult, need, runStandalone } from './seed-utils';

export async function seedTickets(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting tickets seeding...');
  const ticketRepo = ds.getRepository(Ticket);
  const userRepo = ds.getRepository(User);
  const staffRepo = ds.getRepository(Staff);
  const orderRepo = ds.getRepository(Order);
  let created = 0;
  let updated = 0;

  const demo = await need(userRepo, { username: 'demo' }, 'user:demo');
  const mehrdad = await need(userRepo, { username: 'mehrdad' }, 'user:mehrdad');
  const zahra = await need(userRepo, { username: 'zahra' }, 'user:zahra');
  const supporter = await need(userRepo, { username: 'supporter' }, 'user:supporter');
  const editor = await need(userRepo, { username: 'editor' }, 'user:editor');
  const supporterStaff = await need(staffRepo, { userId: supporter.id }, 'staff:supporter');
  const editorStaff = await need(staffRepo, { userId: editor.id }, 'staff:editor');
  const order1 = await orderRepo.findOne({ where: { trackingCode: 'TRK-100001' } });
  const order2 = await orderRepo.findOne({ where: { trackingCode: 'TRK-100002' } });
  const order3 = await orderRepo.findOne({ where: { trackingCode: 'TRK-100003' } });

  const ticketsData = [
    {
      userId: demo.id,
      subject: 'Request: The Brothers Karamazov Behazin translation',
      type: TicketTypes.BookRequest,
      message: 'Please bring the Behazin translation of The Brothers Karamazov — I cannot find it anywhere. The existing translations are not as readable.',
      status: TicketStatuses.Open as TicketStatuses | undefined,
      response: undefined as string | undefined,
      staffId: undefined as string | undefined,
      orderId: undefined as string | undefined,
    },
    {
      userId: demo.id,
      subject: 'Late delivery of TRK-100001',
      type: TicketTypes.Complaint,
      message: 'My order arrived two days later than promised. The books were in perfect condition but the delay was frustrating.',
      status: TicketStatuses.Closed as TicketStatuses | undefined,
      response: 'We are sorry for the delay — a 10% voucher (WELCOME10) was added to your account. The post service experienced delays due to the holiday.' as string | undefined,
      staffId: supporterStaff.id as string | undefined,
      orderId: order1?.id as string | undefined,
    },
    {
      userId: demo.id,
      subject: 'Payment shows pending',
      type: TicketTypes.TechnicalSupport,
      message: 'I paid for TRK-100002 but the status still shows pending. I have the bank receipt.',
      status: TicketStatuses.Open as TicketStatuses | undefined,
      response: undefined as string | undefined,
      staffId: undefined as string | undefined,
      orderId: order2?.id as string | undefined,
    },
    {
      userId: mehrdad.id,
      subject: 'Wrong item received',
      type: TicketTypes.Complaint,
      message: 'I ordered the Persian edition of 1984 (ISBN 9786221000051) but received the English edition instead. Please arrange an exchange.',
      status: TicketStatuses.Open as TicketStatuses | undefined,
      response: undefined as string | undefined,
      staffId: undefined as string | undefined,
      orderId: undefined as string | undefined,
    },
    {
      userId: mehrdad.id,
      subject: 'Request: Kafka complete works',
      type: TicketTypes.BookRequest,
      message: 'Do you plan to stock a complete collection of Kafka\'s works in Persian? The Metamorphosis edition was excellent.',
      status: TicketStatuses.Open as TicketStatuses | undefined,
      response: undefined as string | undefined,
      staffId: undefined as string | undefined,
      orderId: undefined as string | undefined,
    },
    {
      userId: zahra.id,
      subject: 'Refund request for TRK-100006',
      type: TicketTypes.RefundRequest,
      message: 'I returned the book "The Great Gatsby" (TRK-100006) in perfect condition two days ago. When will I receive my refund?',
      status: TicketStatuses.Open as TicketStatuses | undefined,
      response: undefined as string | undefined,
      staffId: undefined as string | undefined,
      orderId: order3?.id as string | undefined,
    },
    {
      userId: demo.id,
      subject: 'Suggestion: Add book rating comparison',
      type: TicketTypes.GeneralInquiry,
      message: 'It would be great to see how our local ratings compare with Goodreads ratings on each book page. Is this something you\'re working on?',
      status: TicketStatuses.Closed as TicketStatuses | undefined,
      response: 'Thank you for the suggestion! We\'ve passed it to our development team. This feature is in our roadmap for Q2.' as string | undefined,
      staffId: editorStaff.id as string | undefined,
      orderId: undefined as string | undefined,
    },
    {
      userId: mehrdad.id,
      subject: 'Discount code not working',
      type: TicketTypes.TechnicalSupport,
      code: 'SUMMER2024',
      message: 'I tried to apply the SUMMER2024 discount code but it says "invalid code". I received it in the newsletter.',
      status: TicketStatuses.Closed as TicketStatuses | undefined,
      response: 'The code was case-sensitive and has now been updated to work regardless of case. Please try again. We\'ve also added a 5% bonus to your account.' as string | undefined,
      staffId: supporterStaff.id as string | undefined,
      orderId: undefined as string | undefined,
    },
    {
      userId: zahra.id,
      subject: 'Damaged book in order',
      type: TicketTypes.Complaint,
      message: 'The spine of "Another Birth" arrived damaged. The book itself is readable but the damage is noticeable. Can I get a replacement?',
      status: TicketStatuses.Open as TicketStatuses | undefined,
      response: undefined as string | undefined,
      staffId: undefined as string | undefined,
      orderId: undefined as string | undefined,
    },
    {
      userId: demo.id,
      subject: 'How to track my order?',
      type: TicketTypes.GeneralInquiry,
      message: 'I placed an order (TRK-100005) and want to know how to track the delivery. The tracking page doesn\'t load.',
      status: TicketStatuses.Closed as TicketStatuses | undefined,
      response: 'You can track your order at tipax.ir using tracking code TRK-100005. The page may take 24 hours to update after shipping.' as string | undefined,
      staffId: supporterStaff.id as string | undefined,
      orderId: undefined as string | undefined,
    },
  ];

  for (const row of ticketsData) {
    let ticket = await ticketRepo.findOne({ where: { userId: row.userId, subject: row.subject } });
    if (!ticket) {
      ticket = await ticketRepo.save(
        ticketRepo.create({
          userId: row.userId,
          type: row.type,
          message: row.message,
          response: row.response,
          status: row.status ?? TicketStatuses.Open,
          orderId: row.orderId,
          staffId: row.staffId,
          subject: row.subject,
        }),
      );
      created++;
      console.log(`✅ Created ticket: ${row.subject}`);
    } else {
      await ticketRepo.update(ticket.id, {
        type: row.type,
        message: row.message,
        response: row.response,
        status: row.status ?? TicketStatuses.Open,
        orderId: row.orderId,
        staffId: row.staffId,
      });
      updated++;
    }
  }

  logResult('Tickets', created, updated);
  console.log('🎉 Tickets seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('tickets', seedTickets).catch(() => process.exit(1));
}
