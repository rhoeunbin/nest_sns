import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';

/**
 * author: string
 * title:string
 * content: string
 * likeCount: number
 * commentCount: number
 */

interface PostModel {
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

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  // 모든 post를 다 가져옴
  @Get()
  getPosts() {
    return posts;
  }

  // 2) GET /posts/:id
  // id에 해당되는 post 가져옴
  // id = 1일 경우 id가 1인 post 가져옴
  @Get(':id')
  getPost(@Param('id') id: string) {
    // 파라미터에서 가져올 이름은 id다
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException(); // nestjs에서 기본으로 제공하는 error type
    }

    return post;
  }

  // 3) POST /posts
  // post 생성
  @Post()
  postPosts(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const post = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    posts = [...posts, post];

    return post;
  }

  // 4) Patch /posts/:id
  // id에 해당되는 post 변경
  @Patch(':id')
  patchPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    const post = posts.find((post) => post.id === +id);

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

    posts = posts.map((prevPost) => (prevPost.id === +id ? post : prevPost));

    return post;
  }

  // 5) DELETE /posts/:id
  // id에 해당되는 post 삭제
}
