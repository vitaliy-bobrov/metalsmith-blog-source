---
title: Deep Dive into Array Methods
description: Deep dive into JavaScript Array methods for begginers and experts.
draft: false
ogimage: images/posts/deep-dive-into-array-methods/deep-dive-into-array-methods-og.jpg
tumb: /images/posts/deep-dive-into-array-methods/deep-dive-into-array-methods
created: 2017-04-18
categories:
- JavaScript
- Functional Programming
---
Knowledge of JavaScript `Array` methods is really important. It allows to write code in functional style. As not all of those methods are immutable developers should know when to handle or avoid data mutations. Other important feature of array methods is context hendling as it could dramaticaly simplify your code.

In this article I want to show you some examples that are close to real use-cases rather then theory. If you need documentation you can get it on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

## Immutable methods
JavaScript provides bunch of immutable methods for arrays manipulations. What does it mean? This methods not mutate data and always return new modified array.

### Map
Method is used to map array dataset, make some modifications on each array element. In difference to `forEach` method it always returns new array instead modifying existing. For example, you have a list of blog posts and you want to get a list of posts ids to get comments for each of them:

```js
const posts = [
  {
    id: 1,
    title: 'Post 1'
  },
  {
    id: 3,
    title: 'Post 3'
  }
];

const postIDs = posts.map(post => post.id);

console.log(postIDs); // [1, 3]
```

Combining map method with *arrow function* makes code more readable and declarative. Another example, after getting posts comments from some source (back-end API for example), we want to add comments data to each post, no problems it'll be easy with `map`:

```js
const comments = [
  {
    post: 1,
    comment: 'Cool article!',
    author: 'User 1'
  },
  {
    post: 3,
    comment: 'Thanks',
    author: 'User 2'
  },
  {
    post: 1,
    comment: 'Nice',
    author: 'User 3'
  }
];

const postsWithComments = posts.map(post => {
  post.comments = comments.filter(comment => comment.post === post.id);

  return post;
});
```
You might figure out that we used another method to find comment by post id -- `filter`. Let take a look on this method.

### Filter
Filter method is very usefull when we need to make partial copy of data that is alligned to some rule. In previous example we get comments that has `post` property equals post `id`. As you may know, methods could be *chained*, for example you need to get ids of posts that are related to "JavaScript" category:

```js
const posts [
  {
    id: 1,
    title: 'Some title',
    category: 'JavaScript'
  },
  {
    id: 12,
    title: 'Some title',
    category: 'Ruby'
  },
  {
    id: 31,
    title: 'Some title',
    category: 'JavaScript'
  }
];

const jsCatPosts = posts
  .filter(post => post.category === 'JavaScript')
  .map(post => post.id);

console.log(jsCatPosts); // [1, 31]
```

Other example, you want to remove duplicated items from list, the simplest way is to filter list with condition:

```js
const duplicates = [1, 2, 3, 2, 5, 6, 4, 8, 1, 4, 9];

const unique = duplicates
  .filter(item => duplicates.indexOf(item) === duplicates.lastIndexOf(item));

console.log(unique); // [3, 5, 6, 8, 9]
```
