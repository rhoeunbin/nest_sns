/**
 * 구현할 기능
 *
 * 1) 요청객체 (request)를 불러오고 authorization header로부터 토큰 가져오기
 * 2) authService.extractTokenFromHeader를 이용해서 사용할 수 있는 형태의 토큰 추출
 * 3) authService.decodeBasicToken를 실행해서 eamil과 password 추출
 * 4) email과 password를 이용해서 사용자를 가져온다
 * 5) 찾아낸 사용자를 (1) 요청 객체에 붙여줌
 *     req.user = user;
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

// authService를 불러와야 하는데 injectable로 불러오기 가능함
@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1)
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다!');
    }
    // 2)
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    // 3)
    const { email, password } = this.authService.decodeBasicToken(token);

    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    // 5)
    req.user = user;

    return true;
  }
}
