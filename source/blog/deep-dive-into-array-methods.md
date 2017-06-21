---
title: Deep Dive into Array Methods
description: Deep dive into JavaScript Array methods for begginers and experts.
draft: false
ogimage: images/posts/deep-dive-into-array-methods/deep-dive-into-array-methods-og.jpg
tumb: /images/posts/deep-dive-into-array-methods/deep-dive-into-array-methods
created: 2017-06-21
categories:
- JavaScript
- Functional Programming
---
Knowledge of JavaScript `Array` methods is really important. It allows writing code in functional style. As not all of those methods are immutable developers should know when to handle or avoid data mutations. Another important feature of array methods is context handling as it could dramatically simplify your code.

In this article, I want to show you some examples that are close to real use-cases rather than theory. If you need documentation you can get it on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

## Immutable methods
JavaScript provides a bunch of immutable methods for arrays manipulations. What does it mean? These methods not mutate data and always return a new modified array.

### Map
The method is used to map array dataset, make some modifications on each array element. In difference to `forEach` method, it always returns a new array instead modifying existing. For example, you have a list of blog posts and you want to get a list of posts ids to get comments for each of them:

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

Combining map method with *arrow function* makes the code more readable and declarative. Another example, after getting posts comments from some source (back-end API for example), we want to add comments data to each post, no problems it'll be easy with `map`:

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
  post.comments = comments
    .filter(comment => comment.post === post.id);

  return post;
});
```
You might figure out that we used another method to find the comment by post id -- `filter`. Let take a look on this method.

### Filter
Filter method is very useful when we need to make the partial copy of data that is aligned to some rule. In the previous example we get comments that have `post` property equals post `id`. As you may know, methods could be *chained*, for example, you need to get ids of posts that are related to "JavaScript" category:

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

Another example, you want to remove duplicated items from the list, the simplest way is to filter list with the condition:

```js
const duplicates = [1, 2, 3, 2, 5, 6, 4, 8, 1, 4, 9];

const unique = duplicates
  .filter(item => duplicates.indexOf(item) === duplicates.lastIndexOf(item));

console.log(unique); // [3, 5, 6, 8, 9]
```

Here we used `indexOf` and `lastIndexOf` methods to check item uniquness. Those methods often used to check if item is present in list, but better to use new `includes` method for that, if possible of cource 🤓:

```js
// indexOf return -1 if no occurances found.
[1, 2, 3].indexOf(4) !== -1 // true,

// Less readable variation, please do NOT use it.
~[1, 2, 3].indexOf(4) // true.

// Better ES6 way
[1, 2, 3].includes(4) // false.
```

### Concat
Sometimes you need to add new element or elements to the array, here is `concat` method on a rescue. It returns new united array:

```js
// Mutation way to add the new item.
const postIds = [23, 67, 87];

postIds.push(12); // [23, 67, 87, 12]

// Immutable way.
let postIds = [23, 67, 87];

postIds = postIds.concat([12]); // [23, 67, 87, 12]
```

But in ES2015 there is another way to join arrays -- *spread operator*. It is more readable in my taste 😇:

```js
let postIds = [23, 67, 87];

postIds = [...postIds, 12] // [23, 67, 87, 12]

// Merging 2 arrays
const list1 = [1, 2, 3];
const list2 = [6, 5, 4];

const union = [...list1, ...list2]; // [1, 2, 3, 6, 5, 4]
```

The good news that spread operator works with new JavaScript types as well, for example with `Set`

```js
const setOfIds = new Set([45, 32, 11]);

setOfIds.add(45); // [45, 32, 11] only unique values
setOfIds.add(12); // [45, 32, 11, 12]

const listOfIds = [13, 14, 15];
const allIds = [...setOfIds, ...listOfIds];
// [45, 32, 11, 12, 13, 14, 15]
```

### Reduce
`reduce` one of the most powerful methods of the array. It is commonly used in functional style JavaScript. You could aggregate data using this method or transparently transform `Array` to another type. Reduce could be used to replace other methods as well, for example, `filter` implementation with `reduce`:

```js
const numbers = [1, 2, 3, 4];
const oddNums = numbers.reduce((filtered ,num) => {
  if (num %2 !== 0) {
    filtered.push(num);
  }

  return filtered;
}, []);

console.log(oddNums); // [1, 3]
```

Other example, gather statistics about letters occurance in array of strings:

```js
const words = ['html', 'css', 'js'];
const statistics = words.reduce((stats, word) => {
  const letters = word.split('');

  letters.forEach(letter => {
    if (typeof stats[letter] !== 'undefined') {
      stats[letter]++;
    } else {
      stats[letter] = 1;
    }
  });

  return stats;
}, {});

console.log(statistics);
// {h: 1, t: 1, m: 1, l: 1, c: 1, j: 1, s: 3}
```

In this example, we transformed `Array` into statistics `Object` with reducing help. Here we used `forEach` method to iterate over letters in a word because we haven't modified letters array, but when you need to change items in a list prefer `map` method instead.

There is `reduceRight` method in the specification, the only difference that it starts iterate from the end of an array instead start in `reduce`.

### Every & Some
`every` and `some` methods could be implemented with `reduce` as well because they transform `Array` into `boolean`. Every check if all items align with provided condition. Some instead return `true` if any of items follow condition. As the example imagine that you need to check all items have a `children` property:

```js
const normalizedTree = [
  {
    id: 1,
    children: [2, 3]
  },
  {
    id: 2,
    children: []
  },
  {
    id: 3,
    children: []
  }
];

const isValidTreeItems = normalizedTree.every(item => item.children);

console.log(isValidTreeItems); // true
```

Here is the situation when you need to set the intermediate state for parent checkbox if any child selected:

```js
const parent = {
  id: 1,
  value: 'JS',
  children: [
    {
      id: 2,
      value: 'React',
      selected: true
    },
    {
      id: 3,
      value: 'Vue',
      selected: false
    },
    {
      id: 4,
      value: 'Angular',
      selected: false
    }
  ];
};

const intermediate = parent.chilred.some(item => item.selected);

console.log(intermediate); // true.
```

### Slice
Slice is used to make partial or full copy of array, the API is pretty clear:

```js
const list = [1, 2, 3];
const partial = list.slice(0, 1); // [1, 2]
```

It is usefull to make copy of array to use some of mutation methods on it:

```js
const list = [3, 2, 1];
// Make a copy.
const sorted = list.slice();
sorted.sort();

console.log(sorted); // [1, 2, 3];
```

Here we made sorted copy of the initial array. To sort the array we used `sort` method, we can pass callback inside it to compare non-primitive items. This callback should return number: negative if the first element less than previous, zero if they are equal or positive if first value bigger than second. Here is the simple example to sort the list of objects by date:

```js
const sortByDate = (a, b) => {
  a.date.getTime() - b.date.getTime();
}

const posts = [
  {
    id: 1,
    date: new Date('2017-06-22')
  },
  {
    id: 2,
    date: new Date('2017-06-01')
  },
  {
    id: 3,
    date: new Date('2017-06-16')
  }
];

posts.sort(sortByDate);
```

### Of & From
Those two methods are compabions to create new array, `of` creates array of all passed arguments. `from` creates array from any *iterable* object, like `Map`, `Set` or `String`:

```js
const list = Array.of(1, 2, 3); // [1, 2, 3]

const box = new Set();
box.add(1);
box.add(2);

const boxList = Array.from(box); // [1, 2]

// But also remember about spread operator

const otherBoxList = [...box]; // [1, 2]
```

## Context handling
Some of the array methods, like `map`, has the ability to pass context as the last argument. In some cases, it is really helpful, but nobody knows/remember about such possibility and start to use `bind` / `call` / `apply` to change execution context.

Let us imagine you have some service to fetch data from REST API, and after response, you need to map all received data, using the same class method and/or properties:

```js
class PostsService {
  constructor(http, dataParse) {
    this.http = http;
    this.dateParse = dateParse;
  }

  getPosts() {
    return this.http.get('api/v1/posts')
      .then(response => {
        const data = response.json();

        return data.map(this.postsMapper, this);
      });
  }

  postsMapper(post) {
    post.date = this.dateParse(post.date);

    return post;
  }
}
```

So you can see that we are injecting some date parsing function into our service. Then we use it to parse date on each received post. As `postsMapper` used `PostsService` method inside it need to have the same context. Instead, bind context in the constructor we simply pass `this` as the last argument. Here is the full list of `Array` methods that have possibility to pass context as the last argument:

- every
- filter
- find
- findIndex
- forEach
- map
- some

## Epilog
This is all that I've wanted to tell about most useful array methods, hope some of the examples will find their place in your projects and will improve your JavaScript skills 😎.
