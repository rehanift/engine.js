This example demonstrates how to provide asynchronous functions in a task's context.

Running the example
-------------------
1. Checkout the git repository `git clone git@github.com:rehanift/engine.js.git`

2. Start the basic server `node script/server.js &`

3. Run the `app.js` file: `node examples/get_tweets/app.js`


How it works
------------
- In `app.js` we have the standard boilerplate code to load the
  `engine.js` library and create a new task.
- We load both the `Context` and `Code` from local files (just to make
  things easier)
- In the `Context` we define a function `get_tweets_for` which takes a
  Twitter handle and a callback. 
  - Inside the function use load the standard node `http` module
  - Since this function has asynchronous dependencies (ie. an HTTP
    request) we call `async.start()`. This tells engine.js that every
    invocation of this function from user-code requires a matching
    `async.end()` in order to be considered complete. Without these
    matching calls to the `async` helper the code will exit
    prematurely.
  - We construct a very basic HTTP request to Twitter's REST API using
    the passed in `handle`.
  - When the response has been received in its entirety we parse the
    results, call the callback, and finally call `async.end()`.
- In the `Code` we create a new global variable `tweets` as an empty
  array
- We call `get_tweets_for()` and pass in Twitter handle and a callback
  function
  - The callback function receives one argument: A JSON response of
    Tweets from Twitter
  - We iterate over each tweet and push the text from each into the
    global `tweets` variable
- We run the `Code` against the `Context`.
  - On the task's `eval` event we try and catch errors, both for when
    a problem with the `Context` was detected and when an error was
    thrown in the `Code`.
  - We print out all global variables, which includes our `tweets`
    variable from our `Code`.
