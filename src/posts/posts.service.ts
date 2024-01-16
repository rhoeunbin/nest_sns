import { Injectable, NotFoundException } from '@nestjs/common';

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
  getAllPosts() {
    return posts;
  }

  getPostById(id: number) {
    // 파라미터에서 가져올 이름은 id다
    // id에 해당하는 post 없을 경우 에러 처리
    const post = posts.find((post) => post.id === +id);
    // post.id는 숫자이기 때문에 id가 아닌 +id인 숫자로 변경해줘야함!
    // 위에서 id: string이라고 지정

    if (!post) {
      throw new NotFoundException(); // nestjs에서 기본으로 제공하는 error type
    }

    return post;
  }

  createPost(author: string, title: string, content: string) {
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

  updatePost(postId: number, author: string, title: string, content: string) {
    const post = posts.find((post) => post.id === postId);

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

    posts = posts.map((prevPost) => (prevPost.id === postId ? post : prevPost));

    return post;
  }

  deletePost(postId: number) {
    // id에 해당하는 post 없을 경우 에러 처리
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      throw new NotFoundException(); // nestjs에서 기본으로 제공하는 error type
    }
    posts = posts.filter((post) => post.id !== postId);

    return postId;
  }
}