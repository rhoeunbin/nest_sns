import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';

/**
 * author: string
 * title:string
 * content: string
 * likeCount: number
 * commentCount: number
 */

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: 'newjeans_official',
    title: '민지',
    content: '민지 짱이쁜',
    likeCount: 101010,
    commentCount: 20202,
  },
  {
    id: 2,
    author: 'newjeans_official',
    title: '해린',
    content: '해린 짱이쁜',
    likeCount: 101010,
    commentCount: 20202,
  },
  {
    id: 3,
    author: 'newjeans_official',
    title: '하니',
    content: '하니 짱이쁜',
    likeCount: 101010,
    commentCount: 20202,
  },
];

@Injectable()
export class PostsService {
  constructor(
    // typeorm으로부터 주입받은 모델이다라는 의미로 @InjectRepository 사용
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostModel>,
    // postsRepository라는 파라미터 생성: 타입<모델이름>
  ) {}

  // Find 함수로 다수의 데이터 가져오기
  async getAllPosts() {
    return this.postsRepository.find();
  }

  // FindOne 함수 이용해서 하나의 데이터만 찾기
  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(author: string, title: string, content: string) {
    // 1) create -> 저장할 객체 생성
    // 2) save -> 객체 저장 (create 매서드에서 생성한 객체로)

    const post = this.postsRepository.create({
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(
    postId: number,
    author: string,
    title: string,
    content: string,
  ) {
    // save의 기능
    // 1. 만약에 데이터가 존재하지 않는다면 (id 기준으로) 새로 생성
    // 2. 만약에 데이터가 존재한다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트함

    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (author) {
      post.author = author;
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    // id에 해당하는 post 없을 경우 에러 처리
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException(); // nestjs에서 기본으로 제공하는 error type
    }

    await this.postsRepository.delete(postId);

    return postId;
  }
}
