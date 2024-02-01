import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * 토큰을 사용하게 되는 방식
   *
   * 1) 사용자가 로그인 또는 회원가입을 집행하면 accessToken과 refreshToken을 발급 받음
   * 2) 로그인 할 때는 Basic 토큰과 함께 요청을 보냄
   *   Basic 토큰은 '이메일:비밀번호'를 Basi64로 인코딩한 형태
   *   ex) {authorization: 'Basic {token}'}
   * 3) 아무나 접근할 수 없는 정보 (private route)를 접근할 때는
   *   accessToken을 Header에 추가해서 요청과 함께 보냄
   *   ex) {authorization: 'Bearer {token}'}
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자가 누군지 알 수 있음
   *   ex) 현재 로그인한 사용자가 작성한 포스트만 가져오려면 토큰의 sub 값에 입력되어 있는 사용자의 포스트만 따로 필터링 할 수 있음
   *   => 특정 사용자의 토큰이 없다면 다른 사용자의 데이터를 접근 못함
   * 5) 모든 토큰은 만료 기간이 있음. 만료 기간이 지나면 새로 토큰을 발급받아야함
   *   그렇지 않으면 jwtService.verify()에서 인증이 통과 안 됨
   *   그러니 access토큰을 새로 발급 받을 수 있는 /auth/token/access와 refresh토큰을 새로 발급 받을 수 있는 /auth/token/refresh가 필요
   * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청을 해서 새로운 토큰을 발급받고
   *   새로운 토큰을 사용해서 private route에 접근한다.
   */

  /**
   * 만드려는 기능
   * 1) registerWithEmail
    - email, nickname, password를 입력받고 사용자를 생성
    - 생성이 완료되면 accessToekn과 refreshToken을 반환, 회원가입 후 다시 로그인해주세요 ← 이런 쓸데없는 과정을 방지하기 위해
    2) loginWithEmail
    - email, password를 입력하면 사용자 검증 진행
    - 검증이 완료되면 accessToken과 refreshToken 반환
    3)loginUser
    - 1과 2에서 필요한 accessToken과 refreshToken 반환하는 로직
    4) signToken
    - 3에서 필요한 accessToken과 refreshToken을 sign하는 로직
    5) authenticateWithEmailAndPassword
    - 2에서 로그인을 진행할 . 때필요한 기본적인 검증 진행
    1. 사용자가 존재하는지 확인 (email)
    2. 비밀번호가 맞는지 확인
    3. 모두 통과되면 찾은 사용자 정보 반환
    4. loginWithEmail에서 변환된 데이터를 기반으로 토큰 생성
   */

  /**
   * Header로부터 토큰을 받을 때
   * {authorization: 'Basic {token}'}
   * {authorization: 'Bearer {token}'}
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    // 'Basic {token}'}
    // [Basic, {token}]
    // 'Bearer {token}'
    // [Bearer, {token}]
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다');
    }

    const token = splitToken[1];

    return token;
  }

  /**
   * Basic aldkfsldfkjskldfjlksdjf
   *
   * aldkfsldfkjskldfjlksdjf -> email:password
   * 2) email:password -> [email, password]
   * 3) {email: email, password: password}
   */
  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }

  /**
   * payload에 들어갈 정보
   * 1) email
   * 2) sub -> 보통 사용자의 id
   * 3) type:'access | 'refresh
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    // jwt 토큰 만들기 -> jwt 설치한 패키지에서 자동으로
    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다');
    }

    // 비밀번호 확인 => bcrypt
    /** 파라미터
     * 1) 입력된 비밀번호
     * 2) 기존 해시 (hash) -> 사용자 정보에 저장돼있는 hash
     */
    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다');
    }
    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);
    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
