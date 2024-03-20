import { IsString } from 'class-validator';

export class createPostDto {
  @IsString({
    message: 'title은 string 타입을 입력해줘야합니다',
  })
  title: string;

  @IsString({
    message: 'content은 string 타입을 입력해줘야합니다',
  })
  content: string;
}
