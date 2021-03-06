import { UsersQueryParams } from './dto/index';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseServiceCRUD } from 'src/base/base-service-CRUD';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from 'src/roles/role.entity';
import { UserRole } from 'src/user-role/userRole.entity';
import { getManager, Not } from 'typeorm';

@Injectable()
export class UsersService extends BaseServiceCRUD<User> {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super(userRepository, User, 'user');
  }

  async adminGetMany(
    query: UsersQueryParams,
    adminId: number,
  ): Promise<{ results: any; total: number }> {
    const { relationsWith, filterByFields, perPage, page, orderBy } =
      await this.modifyQuery(query);

    let role: Role;
    let userIds: any[];
    if (query.roleName) {
      role = await Role.findOne({ where: { name: query.roleName } });
      userIds = await getManager().query(
        `Select DISTINCT "userId" from "user_role" WHERE "roleId" = ${role.id}`,
      );
    }

    const [results, total] = await getManager()
      .findAndCount(User, {
        relations: relationsWith,
        where: (qb) => {
          qb.where({ ...filterByFields, id: Not(adminId) });
          if (query.roleName) {
            qb.andWhereInIds(userIds.map((userId) => userId.userId));
          }
        },
        order: orderBy,
        take: perPage,
        skip: (page - 1) * perPage,
      })
      .catch((err) => {
        throw new InternalServerErrorException(`Failed due to ${err}`);
      });

    return {
      results,
      total,
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, roleName } = createUserDto;
    delete createUserDto.roleName;
    if (await this.userRepository.findOne({ email })) {
      throw new BadRequestException('Email is already exist');
    }

    return await getManager()
      .transaction(async (entityManager) => {
        const user = entityManager.create(User, createUserDto);
        await user.hashPassword();
        await entityManager.save(user);

        const role = await entityManager.findOne(Role, {
          name: roleName,
        });

        const userRole = entityManager.create(UserRole, {
          user,
          role,
        });
        await entityManager.save(userRole);

        delete user.password;
        delete user.salt;
        return { user, role };
      })
      .catch((err) => {
        console.log('Failed due to ', err);
      });
  }

  getMe(user: User): User {
    delete user.password;
    delete user.salt;

    return user;
  }

  async updateMe(id: number, updateDto: UpdateUserDto): Promise<User> {
    const user = await User.findOne(id);
    for (const property in updateDto) {
      user[property] = updateDto[property];
    }
    if (updateDto.password) {
      await user.updatePassword();
    }
    await user.save();

    delete user.password;
    delete user.salt;
    return user;
  }

  async adminUpdateUser(
    updateDto: AdminUpdateUserDto,
    userId: number,
  ): Promise<User> {
    const { isActive, roleName } = updateDto;
    const user = await User.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await getManager().transaction(async (entityManager) => {
      if (isActive !== undefined) {
        user.isActive = isActive;
        await entityManager.save(user);
      }

      if (roleName) {
        const role = await Role.findOne({ where: { name: roleName } });
        const userRole = await UserRole.findOne({ where: { user: user } });
        userRole.role = role;
        await entityManager.save(userRole);
      }
    });

    return await User.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async adminGetOne(id: number): Promise<User> {
    const user = await User.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
