import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.const';

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    // 1) 길이가 20을 넘지 않을 것
    // 2) 유일무이한 값
    length: 20,
    unique: true,
  })
  nickname: string;

  @Column({ unique: true })
  // 1) 유일무이한 값
  email: string;

  @Column()
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    // enum 프로퍼티에 RolesEnum의 모든 value 값들을 가져와서 enum으로 쓸 것을 인지시켜줌
    default: RolesEnum.USER, // 기본값 지정
  })
  role: RolesEnum;
}
