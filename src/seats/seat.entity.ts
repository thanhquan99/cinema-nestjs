import { Ticket } from './../tickets/ticket.entity';
import { Room } from './../rooms/room.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum SeatType {
  NORMAL = 'Normal',
  COUPLE = 'Couple',
  VIP = 'VIP',
}

export enum SEAT_TYPE_PRICE {
  Normal = 0,
  Couple = 5000,
  VIP = 10000,
}

@Entity()
@Unique(['row', 'column', 'room'])
export class Seat extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column()
  row: string;

  @Column()
  column: number;

  @Column()
  type: string;

  @ManyToOne(() => Room, (room) => room.seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  room: Room;

  @OneToMany(() => Ticket, (ticket) => ticket.seat, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  tickets: Ticket[];
}
