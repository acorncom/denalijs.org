// TODO
// - add internal (i.e. not publically supported interface) flag to distinguish from public/private/protected access
// - add since tags
// - add parentClass
// - add parentInterface to interfaces
// - add kind (i.e. class, function, interface) property
// - add file & line to top level api entries
// - method descriptions seem to be missing
// - filenames are missing top level directory
// - add order to guides
let docs = [
  {
    versionId: '@denali-js:core@v0.1.x',
    createdAt: "2017-10-09T12:34:14Z",
    pages: {
      children: [
        {
            title: 'Guides',
            slug: 'guides',
            children: [
              {
                title: 'Application',
                slug: 'application',
                children: [
                  {
                    title: "Actions",
                    slug: 'actions',
                    body: "Actions form the core of interacting with a Denali application. They are the\ncontroller layer in the MVC architecture, taking in incoming requests,\nperforming business logic, and handing off to the view or serializer to send the\nresponse.\n\nWhen a request comes in, Denali's [Router](api://class/runtime/Router) will map the method\nand URL to a particular Action. It will invoke the `respond()` method on that\nclass, which is where your application logic lives:\n\n```js\nimport ApplicationAction from './application';\n\nexport default class ShowPost extends ApplicationAction {\n\n  respond({ params }) {\n    return this.db.find('post', params.id);\n  }\n\n}\n```\n\n## The respond method\n\nYour `respond()` method is where you perform any business logic, query the\ndatabase, invoke services such as a mailer, and more.\n\nWhen you are ready to send a response to the inbound HTTP request, you can\ninvoke `this.render()`. In it's simplest form, it will simple respond with a\n200 status code and an empty response body:\n\n```js\nthis.render();\n// HTTP/1.1 200 OK\n```\n\nYou can customize the status code using the first argument:\n\n```js\nthis.render(204)\n// HTTP/1.1 204 Accepted\n```\n\nTo send some data in the response body, pass that data in as the second argument:\n\n```js\nthis.render(200, post);\n// HTTP/1.1 200 OK\n// <...serialized post...>\n```\n\nThe above scenario is common enough (respond with HTTP 200 and some data) that\nDenali provides a shortcut: just return the data (or a promise that resolves\nwith that data) from your respond method:\n\n```js\nrespond() {\n  return this.db.find('post', 1);\n}\n// is the same as:\nrespond() {\n  let post = this.db.find('post', 1);\n  this.render(200, post);\n}\n```\n\n> **Actions as controllers**\n>\n> Actions are probably a bit different than most controllers you might be used to.\n> Rather than a single controller class that handles multiple different HTTP\n> endpoints, Actions represent just one endpoint (HTTP method + URL).\n>\n> This might seem like overkill at first, but it enables powerful declarative\n> abstractions now that there is a 1:1 relationship between a class and\n> endpoint, as you'll see soon.\n\n## Parameters, request body, and query strings\n\nAn inbound HTTP request carries several different types of data that you might\nwant to access in your action's responder method. Denali makes each of these\ntypes of data available under a single object, passed as the sole argument to\nyour responder method. Combined with destructuring syntax, this lets you quickly\nand easily get to the data you need:\n\n```js\nrespond({ body, params, query, headers }) {\n  // body - the inbound HTTP request body\n  // params - parameters extracted from dynamic url segments, i.e. /posts/:id -> params.id\n  // query - query params parsed from the querystring, i.e. /posts?sort=id -> query.sort === 'id'\n  // headers - the HTTP headers from the request\n}\n```\n\nThis object is the return value of the Parser that was used to parse the\nincoming request. Parsers should return at least the above properties, but may\nadd additional fields as well. For example, the JSON-API parser adds a\n`included` property containing any sideloaded records sent with the primary data\nin the request body.\n\n## Filters\n\nActions also support the concept of before and after filters. These are methods\nthat run before or after your responder method. Before filters also have the\nability to render a response and abort the rest of the action handling (i.e.\nskip subsequent before filters and the responder).\n\nTo add a filter, simply add the method name to the static `before` or `after` array on your\n Action:\n\n```js\nclass CreatePurchase extends Action {\n\n  static before = [\n    'authenticateUser',\n    'confirmBalance'\n  ];\n  static after = 'trackPurchase';\n\n  authenticateUser() {\n    // makes sure the user is logged in\n  }\n\n  confirmBalance() {\n    // make sure the user has money to make the purchase\n  }\n\n  trackPurchase() {\n    // log the purchase in an analytics tool - we do this as an after filter\n    // because there is no reason why this would block the actual purchase\n  }\n\n}\n```\n\nFilters are inherited from parent classes and mixins. This lets you combine and\nreuse sets of filters, either through a base class or a mixin. For example, want\nto authenticate all requests against your API? Just add an authentication before\nfilter to your base ApplicationAction, and it will run on all requests:\n\n```js\nclass ApplicationAction extends Action {\n\n  static before = [ 'authenticate' ];\n\n  authenticate() {\n    // This will run before all actions\n  }\n\n}\n```\n\nHere we can start to see the power that comes from modeling endpoints with a\nsingle class rather than multiple endpoints per class.\n\nImagine we have an app where _most_ of our routes need authentication, but a\nhandful don't. We could use a mixin to apply authentication to only the routes\nthat need it:\n\n```js\nclass ApplicationAction extends Action.mixin(Authenticate) {\n}\n```\n\nBut now we need to remember to include that mixin every time. Forget once, and\nyou've exposed your app to attackers.\n\nInstead, lets make authentication the default, but allow actions to opt out:\n\n```js\nclass ApplicationAction extends Action {\n\n  static before = [ 'authenticate' ];\n\n  authenticate() {\n    // This allows individual actions to \"opt-out\" of authentication by setting\n    // `protected = false;`\n    if (this.protected !== false) {\n      // authenticate the user\n    }\n\n  }\n\n}\n```\n\nHere, we add authentication to our base ApplicationAction class, which all our\nactions will extend from. This ensures that every action will automatically\nrequire authentication.\n\nBut we also check the `this.protected` flag, which lets an individual action\nopt out of authentication if needed, but in an explicit manner. Much better!\n\nFilters behave much like responders: they receive the request data argument, and if\nthey return any value other than null, undefined, or a Promise that resolves\nsomething other than null or undefined, Denali will halt the request processing\nand attempt to render that value as the response.\n\n> **Note:** this means that you should take extra care with the return values of\n> your filter methods. Accidentally returning a value will cause the request\n> processing to halt prematurely, and Denali will attempt to render that value!\n",
                  },
                  {
                    title: "Dependency Injection",
                    slug: "container-and-dependency-injection",
                    body: "Denali ships with a powerful dependency injection system built into the\nframework, which serves a few goals:\n\n* Make testing easier by allowing tests to inject mocked or stubbed values for\ndependencies rather than hardcoding them.\n* Allow addons to supply functionality, without the consuming application\nknowing exactly which addon is providing it.\n* Decouple the on-disk structure of the application from how dependencies are\nresolved.\n\nFor most users, this all happens under the hood. The primary way most\napplication code will interact with the dependency injection system is via\n`inject()`.\n\n## Injecting dependencies\n\nLet's say we have a `CreatePurchase` action, which is responsible for submitting\nan order to a third party payment processor and sending a confirmation email\nupon success. To do this, our action needs to leverage the `payment-processor`\nservice to charge a credit card, and the `mailer` service to send the email.\n\nUsing `inject()`, we can supply our action with these dependencies as simple\ninstance properties:\n\n```js\nimport { inject } from 'denali';\nimport ApplicationAction from `./application';\n\nexport default class CreatePurchase extends ApplicationAction {\n\n  paymentProcessor = inject('service:payment-processor');\n  mailer = inject('service:mailer');\n\n  respond({ body }) {\n    await this.paymentProcessor.charge(body.amount, body.cardToken);\n    this.mailer.send('order-confirmation', {\n      amount: body.amount\n    });\n    // ...\n  }\n\n}\n```\n\nAs we can see, the injected dependencies are available as properties on our\naction instance. In a test environment, we can now stub out these dependencies\neasily:\n\n```js\ntest('create purchase charges the card', async (t) => {\n  t.plan(1);\n  let container = new Container();\n  container.register('service:payment-processor', class extends Service {\n    charge() {\n      t.pass();\n    }\n  });\n  container.register('action:create-purchase', CreatePurchase);\n  // ...\n});\n```\n\nNow, when we instantiate the action through the container, our fake payment\nprocessor with a mocked `charge()` method will be used instead of the real thing.",
                  },
                  {
                    title: "Errors",
                    slug: "errors",
                    body: "Denali exposes common HTTP error classes for you to use throughout your app.\nThese error classes provide a standardized way to communicate various failure\nscenarios throughout your entire codebase.\n\nThese errors are automatically created with the correct HTTP status code, and Denali\nwill use the status code when sending the response if you return the error from\nyour action's responder method:\n\n```js\nimport { Action, Errors } from 'denali';\n\nexport default class NotFoundAction extends Action {\n\n  // Will send a 404 Not Found response. The response body will be formatted by\n  // your application serializer.\n  respond() {\n    return new Errors.NotFound('The resource you request was not found');\n  }\n\n}\n```\n\nAll defined HTTP error status codes (i.e. status codes 400 and above) are\nimplemented. If your action throws, returns, or renders an error that is not a\nsubclass of one of these supplied HTTP error classes, it defaults to a HTTP 500\nstatus code in the response.",
                  },
                  {
                    title: "Routing",
                    slug: "routing",
                    body: "Routing in Denali should feel familiar to anyone with experience in modern\nserver side frameworks. Routes are defined in `config/routes.js`.\n\nTo add individual routes, just invoke the appropriate method on the router and\nsupply the URL and action to route to:\n\n```js\n// Routes GET requests to /foo to the FooAction at `app/actions/foo.js`\nrouter.get('/foo', 'foo');\n```\n\nAll the common HTTP verbs are supported.\n\n\n## Resourceful Routing\n\nThe router also exposes a `resource()` method for quickly adding an entire suite\nof endpoints for a given resource (it follows the [JSON-API recommendations for\nURL design](http://jsonapi.org/recommendations/#urls)):\n\n```js\nrouter.resource('post');\n```\n\nwill generate the following routes:\n\n| Endpoint                                      |  Action                   |\n|-----------------------------------------------|---------------------------|\n| `GET     /posts`                              | `posts/list`              |\n| `POST    /posts`                              | `posts/create`            |\n| `GET     /posts/:id`                          | `posts/show`              |\n| `PATCH   /posts/:id`                          | `posts/update`            |\n| `DELETE  /posts/:id`                          | `posts/destroy`           |\n| `GET     /posts/:id/:relation`                | `posts/related`           |\n| `GET     /posts/:id/relationships/:relation`  | `posts/fetch-related`     |\n| `PATCH   /posts/:id/relationships/:relation`  | `posts/replace-related`   |\n| `POST    /posts/:id/relationships/:relation`  | `posts/add-related`       |\n| `DELETE  /posts/:id/relationships/:relation`  | `posts/remove-related`    |\n\nYou can limit the generated routes using the `only` or `except` options:\n\n```js\n// Generates only the list and show actions from the table above\nrouter.resource('post', { only: [ 'list', 'show' ] });\n\n// Generates all the routes from the table above, except for the destroy route\nrouter.resource('post', { except: [ 'destroy' ] });\n\n// Shorthand for except: [ 'related', 'fetch-related', 'replace-related', 'add-related', 'remove-related' ]\nrouter.resource('post', { related: false });\n```\n\n## Namespacing\n\nIf you want to nest a group of routes underneath a common namespace, you can use\nthe `router.namespace()` method. You can either supply a function as a second\nargument, or use the return object to declare your nested routes:\n\n```js\nrouter.namespace('admin', function(adminRouter) {\n  adminRouter.get('products');\n});\n// or ...\nlet adminNamespace = router.namespace('admin');\nadminNamespace.get('products');\n```\n\n",
                  },
                  {
                    title: "Services",
                    slug: "services",
                    body: "Services are long lived singletons in your app that usually expose app-wide\nfunctionality. Some good examples might be a caching service, which maintains a\npersistent connection to a Redis database; or a mailer service, which\ncentralizes the logic for formatting and sending emails.\n\nServices are defined as subclasses of the base `Service` class, and are\nautomatically created as singletons:\n\n```js\nimport { Service } from 'denali';\n\nexport default class CacheService extends Service {\n\n  read() {\n    // ...\n  }\n\n  write() {\n    // ...\n  }\n\n  // ...\n}\n```\n\nOnce you have defined your service, you can use it via injection in any of your\nDenali classes:\n\n```js\nimport { Action, inject } from 'denali';\n\nexport default class CachedAction extends Action {\n\n  cache = inject('service:cache');\n\n  respond() {\n    if (this.cache.has(cacheKey)) {\n      return this.cache.read(cacheKey);\n    }\n    // ...\n  }\n}\n```",
                  },
                ]
              },
              {
                title: 'Configuration',
                slug: 'configuration',
                children: [
                  {
                    title: "Environment",
                slug: "environment",
                    body: "nThe environment config file (`config/environment.js`) holds the configuration\nthat varies between environments. It should export a function that takes a\nsingle `environment` argument (the string value of the current environment),\nand returns a configuration object populated with whatever values are\nappropriate.\n\nDenali also supports `.env` files - if you create a `.env` file with variables\ndefined one-per-line, `NAME=VALUE`, then those variables will be loaded into\n`process.env` before your `config/environment.js` file is executed:\n\n\n```js\nexport default function environmentConfig(environment) {\n  let config = {\n    server: {\n      port: process.env.PORT || 3000,\n      detached: process.env.DETACHED\n    },\n    database: {\n      url: process.env.DATABASE_URL // <- could be defined in /.env\n    }\n  };\n\n  if (environment === 'development') {\n    // development-specific config\n  }\n\n  if (environment === 'production') {\n    // production-specific config\n\n    // You can start Denali in SSL mode by providing your private key and\n    // certificate, or your pfx file contents\n    //\n    //   config.server.ssl = {\n    //     key: fs.readFileSync('privatekey.pem'),\n    //     cert: fs.readFileSync('certificate.pem')\n    //   };\n    //\n    // or,\n    //\n    //   config.server.ssl = {\n    //     pfx: fs.readFileSync('server.pfx')\n    //   };\n    //\n  }\n\n  return config;\n}\n```",
                  },
                  {
                    title: "Initializers",
                slug: "initializers",
                    body: "Initializers are functions that run after your application is loaded into memory,\nbut before it binds to a port to start accepting connections. It's the ideal\nspot to do any kind of bootstrapping or setup to get your app ready to start\nserving connections.\n\nInitializers can return a Promise, and the application will wait for it to\nresolve before proceeding to the next initializer (or starting the app if that\nwas the last one).\n\nFor example, here's an initializer that sets up a connection to a hypothetical\ndatabase, and pauses the application startup until the connection is\nestablished:\n\n```js\nimport MyDbManager from 'db-manager';\nimport Promise from 'bluebird';\n\nexport default {\n  name: 'db-connect',\n  initialize(application) {\n    let dbConfig = application.container.lookup('config:environment').db;\n    let db = new MyDbManager(dbConfig);\n    return new Promise((resolve, reject) => {\n      db.on('connect', resolve);\n      db.on('error', reject);\n    });\n  }\n}\n```\n\n## Initializer order\n\nSometimes you may want an initializer to run before or after another. To let\nDenali know what the order should be, just add a `before` and/or `after` string\nor array of strings with names of other initializers to your initializer object:\n\n```js\nexport default {\n  name: 'sync-schema',\n  before: [\n    'seed-data',\n    'setup-admins'\n  ],\n  after: 'db-connect',\n  initialize() {\n    // the 'db-connect' initializer has completed by this point\n  }\n}\n```\n",
                  },
                  {
                    title: "Middleware",
                slug: "middleware",
                    body: "The Node community has developed a rich ecosystem of Connect and Express\ncompatible middleware functions. Denali lets you leverage the power of this open\nsource community by providing a simple integration point to plug these\nmiddleware methods in.\n\nThe `config/middleware.js` file exports a function that will be invoked with a\nreference to the application's Router. You can use that reference to add\nmiddleware to the Router via `router.use()`:\n\n```js\n// config/middleware.js\nexport default function middleware(router) {\n  router.use(function (req, res, next) {\n    // ...\n  });\n}\n```\n\nThese middleware are run in the order they are added, before an incoming request\nis handed off to it's Action.\n\n> **Note** keep in mind that middleware functions run **for all incoming\n> requests**. If you want to limit the scope to certain actions only, try using\n> a `before` filter on the actions themselves.\n",
                  },
                ]
              },
              {
                title: 'Data',
                slug: 'data',
                children: [
                  {
                    title: "Models",
                slug: "models",
                    body: "Denali's Models are actually just thin wrappers over your own ORM's model\ninstances. They leverage\n[Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)\nto let your ORM's methods and properties to continue to work, while guaranteeing\na basic common interface across all ORMs.\n\n## Understanding Denali's Data Layer\n\nIt's important to understand Denali's data layer to get the most out of the\nframework. And the most important commonly misunderstood concept is that Denali\nModels are there to allow you to swap out databases without refactoring your\napp.\n\n**This is incorrect.** In fact, Denali takes the stance that the _goal itself is\na red herring_.\n\nIf your app can swap databases with zero refactoring, that either means:\n\n1. The underlying databases are identical in their querying and storage\nsemantics (rarely the case), or\n2. You were using some lowest common denominator of querying and storage semantics for tthe two databases that is\nequivalent across both (which means you weren't using the strengths of your original\ndatabase)\n\nDenali is built around the assumption that different databases have different\ntradeoffs, and that you should pick the data store best suited to your use case.\nThis means a good data layer should highlight the unique strengths of choice of\ndata store, rather than trying to hide any differences behind a universal\ninterface.\n\nSo then why have a data layer at all for Denali? It's primarly _for addons_.\nHaving some common data interface allows addons to persist and query data\nwithout needing to write their own adapters for every possible data store.\n\nSo if you find yourself skipping past Denali's Model API (as we'll explore\nbelow) in your application, and using lots of database specific features and\nsyntax - **that's a good thing**. Don't shy away from it!\n\n## Defining a Model\n\nModels are defined in the `app/models/` folder. Conventionally, models extend\nfrom a common base, the ApplicationModel:\n\n```js\n// app/models/application.js\nimport { Model } from 'denali';\n\nexport default class ApplicationModel extends Model {\n  // add any common, application-wide model functionality here\n}\n```\n\nLet's create a basic model representing a blog post:\n\n```js\n// app/models/post.js\nimport { attr } from 'denali';\nimport ApplicationModel from './application';\n\nexport default class Post extends ApplicationModel {\n\n  static title = attr('text');\n\n}\n```\n\nHere we started out by adding a `title` attribute to our Post model. We use the\n`attr()` method exported by Denali to define an attribute. The single argument\nis the data type of that attribute. Note the `static` keyword - attributes and\nrelationships should be defined statically, while instance properties will\ncontain the actual values for a given record.\n\n### Data Types\n\nDenali provides a common base set of data types for most ORM adapters:\n\n* `text`\n* `number`\n* `date`\n* `boolean`\n* `object`\n\nIn addition to the basic data types, your ORM adapter can support additional,\nmore specialized data types (i.e. `integer` rather than `number`).\n\nKeep in mind that each ORM adapter decides for itself how best to implement\nthese common data types, and it may be more performant to go with an\nORM-specific type in some cases. For example, ORMs for SQL based data stores\nshould implement the `number` data type as a `float` or `double` rather than an\n`integer`, since JavaScript numbers are floating point. But if you know the\nfield should only container integers, you should use `integer` (assuming your\nORM adapter supports it).\n\nThe value of the common base set of data types is that it allows addons that\nmanage data attributes to safely assume a certain subset of data types.\n\n### Relationships\n\nIn addition to basic data attributes, you can also define relationships on your model classes (assuming your ORM supports relationships):\n\n```js\n// app/models/post.js\nimport { attr, hasMany, hasOne } from 'denali';\nimport ApplicationModel from './application';\n\nexport default class Post extends ApplicationModel {\n\n  static title = attr('text');\n  static comments = hasMany('comment');\n  static author = hasOne('user');\n\n}\n```\n\n## Querying Data\n\nModels expose a few methods for querying data:\n\n```js\n// Find post with id 1\nPost.find(1);\n\n// Find posts that match the filter\nPost.query({ title: 'My cool post' });\n\n// Find posts using ORM specific querying\nPost.query((/* Your ORM can pass in arguments, i.e. a query builder */) => {\n  // You can use ORM-specific syntax here\n});\n\n// Find all posts\nPost.all()\n\n// Find the first post that matches the supplied query (an object or\n// ORM-specific function)\nPost.queryOne()\n```\n\nOnce you have a record, you can read attributes directly:\n\n```js\nlet post = Post.find(1);\nconsole.log(post.title);\n// > \"Denali is a tall mountain\"\n```\n\nTo read related data, you should use the `get[Relationship]` getters:\n\n```js\nlet post = Post.find(1);\npost.getAuthor().then((author) => {\n  console.log(author)\n  // <Author:17 name=\"Dave\">\n});\n\n// or with async/await syntax:\n\nawait post.getAuthor();\n```\n\nFor one-to-one style relationships, you can use `set[Relationship]` to set the\nrelated record. For one-to-many style relationships, you can use\n`set[Relationship]` to replace the entire relationship at once, or\n`add[Relationship]` and `remove[Relationship]` to operate on a single member\nof the relationship at a time.\n\n## Saving Data\n\nModels expose a `.save()` instance method that returns a promise which resolves\nor rejects when the save operation is complete.\n",
                  },
                  {
                    title: "ORM Adapters",
                    slug: "orm-adapters",
                    body: "Denali takes a somewhat unique approach to handling the data layer. Unlike most\nframeworks, it doesn't come bundled with a \"blessed\" ORM, or attempt to build\nit's own. Instead, Denali's Model class works with your ORM of choice by\ncommunicating with it through an ORM Adapter.\n\nThis lets you bring your own ORM to your apps, while still enabling Denali to\nunderstand your data model. This is good news for your app, since it lets you\npick the right ORM for the job and leverage the strengths of the specific data\nstore backing your app, rather than relying on a lowest-common-denominator data\nlayer.\n\nNormally, you won't need to write your own ORM adapters, you can just use any\nof the community supported ones. However, you may need familiarize yourself with\nany additional, custom query APIs, data types, etc that the adapter may support.\n\n## Available ORM Adapters\n\nSeveral popular ORMs have Denali adapters ready to go. Just add them to your\nproject via `$ denali install <adapter package name>`, and set the `ormAdapter`\nproperty in your `config/environment.js` file to the ORM's name.\n\n* [`node-orm2`](https://github.com/denali-js/denali-node-orm2) (beta)\n* [`objection`](https://github.com/denali-js/denali-objection) (beta)\n* ~~`Sequelize`~~ (coming soon)\n* ~~`Bookshelf`~~ (coming soon)\n\n## Creating an ORM Adapter\n\nWant to use an ORM that doesn't have an adapter yet? It's fairly easy to write\nyour own! Just extend from [the base `ORMAdapter` class](https://github.com/denali-js/denali/blob/master/lib/data/orm-adapter.ts),\nand implement each of the hooks defined in the base class.\n",
                  },
                  {
                    title: "Serializers",
                    slug: "serializers",
                    body: "Since Denali is API focused, it doesn't ship with any kind of view layer for\nrendering HTML. However, one way to think of Serializers is like the view layer\nfor a JSON only API.\n\nWhen your app needs to send some data in a response, there's three problems to\nface:\n\n  1. **What data to send**: you'll often want to send only a subset of your\n  record back (i.e. omitting a hashed password).\n\n  2. **Transforming the data**: you may want to transform the content to make it\n  easier to consume or to match consumer expectations (i.e. change underscore_\n  keys to camelCaseKeys).\n\n  3. **Structuring the data**: what is the structure of the response? Is there a\n     root JSON wrapper? Does it conform to a spec, i.e. JSON-API 1.0?\n\nSerializers address all of these problems. They select what data to send, apply\ntransformations to that data (i.e. renaming keys, serializing values), and\nstructure the result according to a particular output format.\n\nTypically, your API will have a standard output format (i.e. JSON-API 1.0) for all response. A\ngood approach is to pick (or create) a base ApplicationSerializer class that renders that\nstructure, much like we used a base ApplicationAction class.\n\nWith a base ApplicationSerializer class in place, you'll then create a subclass\nfor each model you have (PostSerializer, UserSerializer, etc). These subclasses\ntell Denali what attributes and relationships should be sent in a response that\ncontains that particular model.\n\n## Rendering data in a response\n\nSerializers render data based on _whitelists_. That means that if you want any\npart of your Model to render into JSON in the response body, you must specify\nit explicitly in that Model's Serializer. This ensures you won't\naccidentally return sensitive data in a response because you forgot to strip it\nout.\n\nSelecting which attributes to render is as simple as adding them to the\nattributes array on your serializer:\n\n```js\nexport default class UserSerializer extends ApplicationSerializer {\n\n  attributes = [ 'firstName', 'lastName' ];\n\n}\n```\n\nRelationships are slightly more complex.\n\nTODO documentation for relationship serializers\n\n# Built-in Serializers\n\nDenali ships with two base serializers out of the box:\n\n  * **FlatSerializer**, which renders models as simple JSON objects or arrays of\n  objects. Related records are directly embedded under their relationship name.\n\n  * **JSONAPISerializer**, a [JSON-API 1.0] compliant serializer with support\n  for meta, links, errors, and more.\n\n",
                  },
                ]
              },
              {
                title: 'Overview',
                slug: 'overview',
                children: [
                  {
                    title: "App Structure",
                    slug: "app-structure",
                    body: "# `app/`\n\nHolds the majority of your application code. This is where your actual business\nlogic tends to live. All files in this folder are automatically loaded into the\ncontainer, and their directory name is used as the type (i.e. `app/foos/bar`\nwould be loaded into the container under `foo:bar`).\n\n```txt\napp/\n  actions/\n    application.js  <- base action class to extend from\n  models/\n    application.js  <- base model class to extend from\n  serializers/\n    application.js  <- base serializer class to extend from\n```\n\n## `app/application.js`\n\nThis file exports the root Application class used by your entire app. You\ngenerally won't need to modify this file, it's typically advanced use cases\nonly.\n\n# `config/`\n\nHolds the declarative and executable configuration for your app. \\*.js files\n(other than `environment.js` and `initializers/*.js`) in this folder will be\nautomatically loaded into the container under their filename (i.e.\n`config/foo.js` will be loaded under `config:foo`).\n\nConfiguration files in Denali tend to be JS files that export a function which\nreturns the configuration object. This gives the app developer greater\nflexibility in constructing configuration: it allows for inter-dependent values\n(i.e. option A depends on the value of option B), and easily using environment\nvariables via `process.env`.\n\nThird party addons can add their own configuration files this way as well.\n\n## `config/environment.js`\n\nThis file holds the configuration that varies per environment (i.e. development vs.\nstaging vs. production database details).\n\n## `config/middleware.js`\n\nThis file exports a function which is invoked with the application's Router as\nits first argument. It lets you add generic Connect-compatible middleware to\nyour application that will run _before_ the Router hands off to the appropriate\naction.\n\n## `config/routes.js`\n\nYou define your application's routes in this file. See the [Routing\nguide](../../application/routing) for more details.\n\n# `test/`\n\nThe test suite for your app. See the [integration](../../testing/integration)\nand [unit](../../testing/unit) testing guides for more details.\n",
                  },
                  {
                    title: "Introduction",
                    slug: "introduction",
                    body: "# Core Principles\n\nDenali is built on a few core concepts:\n\n  * **API-first.** Most server-side frameworks focus on server-rendered HTML\n  applications, with APIs an afterthought at best. Denali flips this around - its\n  entire focus is data-only JSON APIs. You won't find any HTML templating\n  engines or asset compilers here.\n\n  * **Developer happiness.** Denali aims to go beyond nice syntax and helpful\n  boilerplate to help solve those common workflows and pain points when\n  developing APIs.\n\n  * **Data access / ORM agnostic**. ORMs and data layers are _hard_. Some of the\n  hardest problems around. Denali doesn't pretend to solve that. Instead, it is\n  completely agnostic about how you manage your data. Mongoose, Sequelize,\n  Thinky, or even plain old JS objects - Denali doesn't care.[1]\n\n## Why not [insert other framework]?\n\nThere are a few other framework options besides Denali. Here's a quick run down\nof the major differences with Denali:\n\n1. **Rails** is a great default choice for many, with a large ecosystem and a\n   mature codebase. However, Rails is designed for a much wider range of uses\n   cases, including primarily HTML rendering. That brings along a lot of\n   cognitive overhead to manage. Also, for web apps, Ruby means learning an\n   additional language.\n\n2. **Express.js** is the foundation of much of the Node server-side world. It's\n   lightweight, fast, and simple. But for complex applications, Express only\n   provides the basics (routing and middleware). It lacks the higher level\n   abstractions to make rapid development easier.\n\n3. **Sails.js** is an effort to be the Node equivalent of Rails. However, many\n   of the framework's patterns run counter to the Node ethos. It also comes\n   tightly bound to Waterline, making it difficult to integrate with databases\n   that Waterline doesn't support.\n\n--------------\n[1] If you choose an ORM that doesn't have out of the box support, you will need\nto write an adapter for it. But fear not, adapters are simple. To get started,\ncheck out the [adapter docs](latest/guides/data/orm-adapters) for details.\n",
                  },
                ]
              },
              {
                title: 'Testing',
                slug: 'testing',
                children: [
                  {
                    title: "Acceptance",
                    slug: "acceptance",
                    body: "# Acceptance Testing\n\nDenali comes with some testing helpers out of the box to make acceptance\ntesting simpler. Here's a quick sample of what an acceptance test might look\nlike:\n\n```js\nimport test from 'ava';\nimport { appAcceptanceTest } from 'denali';\n\nappAcceptanceTest(test);\n\ntest('GET /posts/:id returns the requested post', async (t) => {\n  let app = t.context.app;\n  let db = app.lookup('service:db');\n  await db.create('post', { title: 'Hello World' }).save();\n\n  let { status, body } = await app.get('/posts/1');\n\n  t.is(body.title, 'Hello World');\n});\n```\n\n## `appAcceptanceTest(test)`\n\nThis is the starting point of the Denali test helpers. When defining an\nacceptance test suite, just add `appAcceptanceTest()` to the top of the test file:\n\n```js\nimport test from 'ava';\nimport { appAcceptanceTest } from 'denali';\n\nappAcceptanceTest(test);\n\ntest('GET /posts/:id returns the requested post', async (t) => {\n  // ...\n```\n\n`appAcceptanceTest()` will automatically handle the setup, initialization, and teardown\nof an instance of your Application. It also adds the `t.context.app` property to the\ntest suite, and if your ORM adapters support test transactions, will automatically\nstart and rollback a transaction around your test.\n\n## Making test requests\n\nIn your tests, `t.context.app` provides a simple API for interacting with your app in\nthe test environment. In particular, it exposes methods for each HTTP verb (i.e.\n`app.get()`, `app.post()`, etc) which let you simulate a request to\nyour app.\n\nTo make a test request, it's as simple as:\n\n```js\ntest('lists posts', async (t) => {\n  let { status, body } = await t.context.app.get('/posts');\n  t.is(status, 200);\n  t.true(Array.isArray(body));\n});\n```\n\nThere's a few things to note here:\n\n  * The request method (`app.get`) returns a Promise. Don't forget to\n  await or return that Promise to make sure the test waits for your async\n  activity to finish!\n  * The promise resolves to an object with a `status` and `body` property\n  * If the app responds with a status code >= 500, the request method will\n  reject the promise. If it's < 500, it resolves it. This means that error\n  responses from your API like 401 Unauthorized will result in the test request\n  promise being _resolved_.\n\n### Headers\n\nOften when testing you'll need to manipulate the headers sent with the requests.\nThis is frequently done to manage login / logout state (via the Authorization\nheader). The test app provides a way to do this via `app.setHeader(name,\nvalue)`.\n",
                  },
                  {
                    title: "Unit Testing",
                    slug: "unit-testing",
                    body: "# Unit Testing\n\n**Coming soon ...**\n\nWe are hard at work fleshing out the remaining docs. Want to help? Just click\nthe \"Improve this page\" link and chip in!\n",
                  },
                ]
              },
              {
                title: 'Utilities',
                slug: 'utilities',
                children: [
                  {
                    title: "Addons",
                    slug: "addons",
                    body: "# Addons\n\n**In progress ...**\n\nWe are hard at work fleshing out the remaining docs. Want to help? Just click\nthe \"Improve this page\" link and chip in!\n\n## Installing An Addon\n\nTo install an addon, it must first be published to npm. Once you know what\nthe addon is published as, you can use the install command.\n\n```sh\n$ denali install addon-name\n```\n\n## Generating An Addon\n\nTo generate a new addon project you can use the following command\n\n```sh\n$ denali addon my-addon\n```\n\nThis will create a new directory with all of the necessary files\nto get you started writing your first addon.\n\n## Addon Structure\n\nAddons use a similar structure to a regular app.\n\n- `app` - Anything in this directory will be available on the container in the consuming app.\n- `lib` - Anything you want to add here will have to be explicitly imported.\n\n## Publishing Your Own Addon\n\nAddons must publish their compiled code (i.e. the `dist/` folder). To help make sure\nyou don't accidentally publish the wrong files, addons are automatically\ngenerated with a `prepublish` script in their package.json that errors out.\nInstead, you should use `denali publish`, which will ensure that your addon is\nbuilt and the compiled files are published directly.",
                  },
                  {
                    title: "Instrumentation",
                    slug: "instrumentation",
                    body: "# Instrumentation\n\n**Coming soon ...**\n\nWe are hard at work fleshing out the remaining docs. Want to help? Just click\nthe \"Improve this page\" link and chip in!\n",
                  },
                  {
                    title: "Mixins",
                    slug: "mixins",
                    body: "# Mixins\n\n**Coming soon ...**\n\nWe are hard at work fleshing out the remaining docs. Want to help? Just click\nthe \"Improve this page\" link and chip in!\n",
                  }
                ]
              }
            ]
        },
        {
          title: "Quickstart",
          slug: "quickstart",
          body: "It's everyone's favorite first project for a server side framework: let's build\na basic blogging application!\n\n## Installation\n\nFirst off, make sure you install Denali globally via npm:\n\n```sh\n$ npm install -g denali-cli denali\n```\n\n## Scaffolding our application\n\n> Note: Denali requires you to use Node 7.0 or greater.\n\nNext, let's use Denali's handy scaffolding tools to create a blank slate for us\nto start from:\n\n```sh\n$ denali new blog\ncreate blog/.babelrc\ncreate blog/.editorconfig\ncreate blog/.env\ncreate blog/.eslintignore\ncreate blog/.eslintrc\ncreate blog/.gitattributes\ncreate blog/.nvmrc\ncreate blog/.travis.yml\ncreate blog/CHANGELOG.md\ncreate blog/README.md\ncreate blog/app/actions/application.js\ncreate blog/app/actions/index.js\ncreate blog/app/application.js\ncreate blog/app/index.js\ncreate blog/app/models/application.js\ncreate blog/app/serializers/application.js\ncreate blog/app/services/.gitkeep\ncreate blog/config/environment.js\ncreate blog/config/initializers/.gitkeep\ncreate blog/config/middleware.js\ncreate blog/config/routes.js\ncreate blog/denali-build.js\ncreate blog/.gitignore\ncreate blog/package.json\ncreate blog/test/.eslintrc\ncreate blog/test/acceptance/index-test.js\ncreate blog/test/helpers/.gitkeep\ncreate blog/test/unit/.gitkeep\n✔ Dependencies installed\n✔ Git repo initialized\n📦  blog created!\n\nTo launch your application, just run:\n\n  $ cd blog && denali server\n\n```\n\nGo ahead and follow that last instruction:\n\n```sh\n$ cd blog\n$ denali server\n✔ blog build complete (1.829s)\n[2017-01-12T17:36:52.437Z] INFO - blog@0.0.1 server up on port 3000\n```\n\nPerfect! You've got your first Denali app up and running. Now let's see it in\naction. Hit the root endpoint with curl:\n\n```sh\n$ curl localhost:3000\n{\n   \"message\": \"Welcome to Denali!\"\n}\n```\n\n> **Heads up!** Notice that we didn't visit that localhost URL in the browser.\n> That's because Denali is designed to build **APIs** rather than HTML rendering\n> applications. If you are looking for Node framework to build a server rendered\n> web application, you might want to try something like Sails.js or Express.\n\nGreat, we got an app up and running! Now that's cool, but it's not _that_ cool.\nLet's crack open the scaffolded code to see how we got that welcome message, and\nhow to add our own code.\n\n\n### Directory structure\n\nThe `denali new` command did a lot of setup for us. It created the following\ndirectory structure:\n\n```txt\nblog/\n  app/\n    actions/\n      application.js\n      index.js\n    models/\n      application.js\n    serializers/\n      application.js\n    services/\n    application.js\n    index.js\n  config/\n    initializers/\n    environment.js\n    middleware.js\n    routes.js\n  test/\n    acceptance/\n      index-test.js\n    helpers/\n    unit/\n    .eslintrc\n  .babelrc\n  .editorconfig\n  .env\n  .eslintignore\n  .eslintrc\n  .gitattributes\n  .gitignore\n  .nvmrc\n  .travis.yml\n  CHANGELOG.md\n  denali-build.js\n  package.json\n  README.md\n```\n\nThere's a lot there, but for now, let's open up the `config/routes.js` to see\nhow that root endpoint is being handled:\n\n```js\n// config/routes.js\nexport default function drawRoutes(router) {\n\n  router.get('/', 'index');\n\n}\n```\n\nThis should look somewhat familiar if you used frameworks like Rails before. The\n`router.get('/', 'index')` method tells Denali to respond to `GET /` with the\n`index` action.\n\nIn `app/actions/index.js`, we can see how that is handled:\n\n```js\n// app/actions/index.js\nimport ApplicationAction from './application';\n\nexport default class IndexAction extends ApplicationAction {\n\n  respond() {\n    this.render(200, { message: 'Welcome to Denali!' }, { serializer: 'json' });\n  }\n\n}\n```\n\nLet's break down what's going on here:\n\n  * `import ApplicationAction from './application';` - we import the\n    `ApplicationAction` to use as our common base class. You could import the\n    base `Action` class from the `denali` module directly, but having a base\n    class for all actions in your app is handy (and common convention).\n\n  * `respond()` - the `respond()` method is the meat of any action. It defines\n    how the action responds to an incoming request.\n\n  * `this.render(...)` - tells Denali to render the follow as the response. In\n    this case, it says to render an HTTP 200 status code, with the `message`\n    object as the payload, and use the `'json'` serializer to format the response\n    body (which in this case, simply `JSON.stringify()`s the payload).\n\nThe end result here is an action which will always respond with the same JSON\nobject that we saw above: `{ \"message\": \"Welcome to Denali!\" }`.\n\n## Adding a resource\n\nNow let's get a bit more creative. Our blog API is going to need to store and\nretrieve our blog posts. Let's create a `post` resource to enable that.\n\n> Normally, you'd probably store these in some kind of database (i.e. Mongo,\n> Postgres, MySQL, etc). Denali is **database agnostic** though. So for now,\n> we'll use plain ol' JS objects (a.k.a. POJOs). But you can easily substitute\n> your own models in later. For more details, check out the [Data\n> guides](../../data/models).\n\nTo start, let's use that handy scaffolding tool again:\n\n```sh\n$ denali generate resource post\n```\n\nThis scaffold creates several files:\n\n  * A set of **actions** in `app/actions/posts/` for this resource with the\n    basic CRUD operations stubbed out. These files are where you'll implement\n    your application logic to respond to a particular request. We saw these\n    above.\n\n  * A **serializer** to determine how your posts will be rendered in the\n    response. We'll learn more about this in a bit.\n\n  * A **model** to represent your posts.\n\n  * A placeholder **acceptance test suite** for this resource. Denali comes with\n    a first-class testing environment ready to go.\n\nIf we open up `app/actions/posts/list.js` now, you can see the stubbed out\nactions:\n\n```js\n  // app/actions/posts/list.js\n  export default class ListPosts extends ApplicationAction {\n\n    async respond() {\n      return this.db.all('post');\n    }\n\n  }\n```\n\n## Working with a database\n\nYou'll notice that the stubbed out actions reference `this.db`. This is a\nservice automatically injected into actions that handles querying your database\nvia ORM adapters. There's a few key methods to know, all of which return a\npromise that resolves with the query results (except for `db.create`):\n\n* `db.find(id)` - look up a single record by it's id\n* `db.queryOne(query)` - lookup up a single record that matches the given query\n* `db.query(query)` - find all records that match the given query\n* `db.all()` - find all records of a given type\n* `db.create(type, data)` - create a new Model instance of the given type (note:\n   this method is synchronous, and does not immediately persist the newly\n   created record)\n\n##### A quick diversion about how Denali handles models and data\n\nDenali takes a somewhat unique approach. Most frameworks ship with some kind of\nObject Relational Mapper (ORM) baked right in. It transforms rows from a\ndatabase into objects you can manipulate.\n\nHere's the thing: **ORMs are hard. _Really hard._** To make matters worse,\nthere's **no generally accepted \"good\" ORM for Node.js that covers all the\ncommonly used databases**.\n\nWith this in mind, Denali purposefully **does not ship with an ORM**. Instead,\nDenali's Models are essentially a thin shim layer that lets you plug your own\nORM in instead, using ORM adapters.\n\nThere's lots of reasons why this is a powerful approach, but those are covered\nin the Data guides. For now, let's forge ahead and setup our data store.\n\n### The Memory Adapter\n\nTo help us get started, Denali ships with an in-memory ORM adapter, which can be\nuseful for testing and debugging use cases. It's the default ORM for newly\nscaffolded projects, so it's already setup and will be used by default. We'll\nuse it now to get going without needing to setup an actual database.\n\n> **Note:** The provided memory adapter should **not** be used for production\n> applications - data will not be saved across server restarts, and the\n> performance is likely quite poor. It's meant purely for testing and debugging\n> use cases.\n\nWhen you are ready to integrate with a real database, take a look at the various\n[ORM adapters available for Denali](../../data/orm-adapters) for details on\ninstalling and configuring each.\n\n## Adding a model\n\nThe resource generator we ran above already added a blank Post model for us in\n`app/models/post.js`. Let's open that up, and add a `title` attribute so we can\nstore the title of each blog post:\n\n```js\n\nimport { attr /* , hasOne, hasMany */ } from 'denali';\nimport ApplicationModel from './application';\n\nexport default class Post extends ApplicationModel {\n\n  static title = attr('text'); // <- add this\n\n}\n```\n\nOkay, let's break this one down.\n\n```js\nimport { attr /* , hasOne, hasMany */ } from 'denali';\nimport ApplicationModel from './application';\n```\n\nFirst up, we follow the same pattern of having a base \"Application\" class that\nwe did with Actions. We also import the `attr()` helper from Denali, which is\nused to define an attribute on the model:\n\n```js\n  static title = attr('text');\n```\n\nHere, we create our `title` attribute. Note that attributes are declared as\nstatic properties. Now, back in our actions, we can see that the resource\nscaffold added code that will lookup all posts via `this.db.all('post')`:\n\n```js\n// app/actions/posts/list.js\n  respond() {\n    return this.db.all('post');\n  }\n```\n\nOver in our create action, we can let the user create new blog posts too. Notice\nhow here we are taking the body of the incoming request and using that to\npopulate our new Post record.\n\n```js\n// app/actions/posts/create.js\n  respond({ body }) {\n    return this.db.create('post', body);\n  }\n```\n\nGreat! Now we can create and list all the Posts in our in-memory data store.\nLet's test it out by first creating a post:\n\n```sh\n$ curl localhost:3000/posts -X POST -d '{\"title\": \"My first post!\"}'\n\n{\n  \"id\": 1\n}\n```\n\nLooks like our Post was created! But if we look closely - our post's title (`\"My\nfirst post!\") wasn't returned. And if we check the post listing endpoint (`GET\n/posts`):\n\n```sh\n$ curl localhost:3000/posts\n\n[\n  {\n    \"id\": 1\n  }\n]\n```\n\nIt's missing there too! **What's going on here?**\n\n## Working with Serializers\n\nThe reason our `title` field was missing was because we didn't tell Denali that\nwe wanted it returned. We do this with serializers.\n\nIn Denali, a serializer takes a payload object (or array), and transforms it\ninto the string of JSON to send back in the response.\n\nBy default, serializers are configured with a whitelist of allowed attributes.\nSince we haven't touched our `post` serializer yet, the `title` attribute isn't\nin that whitelist, so it gets stripped out of all our responses by default.\n\nLet's fix that now by adding it to the whitelist:\n\n```js\n// app/serializers/post.js\nimport ApplicationSerializer from './application';\n\nexport default class PostSerializer extends ApplicationSerializer {\n\n  attributes = [ 'title' ];\n\n}\n```\n\nAnd now let's try to list the posts again:\n\n```sh\n$ curl localhost:3000/posts\n\n[\n  {\n    \"id\": 1,\n    \"title\": \"My first post!\"\n  }\n]\n```\n\nThere it is! Our blog is off to a promising start.\n\n## Next Steps\n\nCongrats, you made it through the quickstart guide. From here, you can:\n\n* Check out the rest of the guides to learn more about the different parts of\n  the framework\n* Dive into the API documentation to get into the gritty details\n* Explore the [heavily commented source\n  code](https://github.com/denali-js/denali)\n",
        },
        {
          title: "Tutorial",
          slug: "tutorial",
          children: [
            {
              title: 'Getting Started',
              slug: 'getting-started',
              body: ''
            }
          ]
        },
      ],
    },
    api: {
      packages: {
        denali: {
          "classes": {
            "DatabaseService": {
              "name": "DatabaseService",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                }
              },
              "methods": {
                "all": {
                  "name": "all",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/database.ts",
                  "line": 46,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "modelType"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<Model[]>"
                      }
                    }
                  ]
                },
                "create": {
                  "name": "create",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/database.ts",
                  "line": 56,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "modelType"
                        },
                        {
                          "type": "any",
                          "name": "data"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Model"
                      }
                    }
                  ]
                },
                "find": {
                  "name": "find",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/database.ts",
                  "line": 11,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "modelType"
                        },
                        {
                          "type": "any",
                          "name": "id"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<>"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "lookupAdapter": {
                  "name": "lookupAdapter",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/database.ts",
                  "line": 60,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "modelType"
                        }
                      ],
                      "return": {
                        "type": "ORMAdapter"
                      }
                    }
                  ]
                },
                "query": {
                  "name": "query",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/database.ts",
                  "line": 35,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "modelType"
                        },
                        {
                          "type": "any",
                          "name": "query"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<Model[]>"
                      }
                    }
                  ]
                },
                "queryOne": {
                  "name": "queryOne",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/database.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "modelType"
                        },
                        {
                          "type": "any",
                          "name": "query"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "Container": {
              "name": "Container",
              "description": "  * Apps can consume classes that originate from anywhere in the addon dependency tree, without\n    needing to care/specify where.\n  * We can more easily test parts of the framework by mocking out container entries instead of\n    dealing with hardcoding dependencies\n  * Support clean injection syntax, i.e. `mailer = service();`.\n\nIn order to do these, the container must control creating instances of any classes it holds. This\nallows us to ensure injections are applied to every instance. If you need to create your own\ninstance of a class, you can use the `factoryFor` method which allows you to create your own\ninstance with injections properly applied.\n\nHowever, this should be relatiely rare - most of the time you'll be dealing with objects that\nare controlled by the framework.\n",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "classLookups": {
                  "name": "classLookups",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 111,
                  "tags": [],
                  "type": "Dict<Constructor<any>>"
                },
                "factoryLookups": {
                  "name": "factoryLookups",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 116,
                  "tags": [],
                  "type": "Dict<Factory<any>>"
                },
                "lookups": {
                  "name": "lookups",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 106,
                  "tags": [],
                  "type": "Dict<inline literal>"
                },
                "meta": {
                  "name": "meta",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 137,
                  "tags": [],
                  "type": "Map<any, Dict<any>>"
                },
                "registry": {
                  "name": "registry",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 94,
                  "tags": [],
                  "type": "Dict<Constructor<any>>"
                },
                "resolvers": {
                  "name": "resolvers",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 101,
                  "tags": [],
                  "type": "Resolver[]"
                }
              },
              "methods": {
                "addResolver": {
                  "name": "addResolver",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 151,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Resolver",
                          "name": "resolver"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "availableForType": {
                  "name": "availableForType",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 282,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "buildFactory": {
                  "name": "buildFactory",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 351,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        },
                        {
                          "type": "Constructor<T>",
                          "name": "klass"
                        }
                      ],
                      "return": {
                        "type": "Factory<T>"
                      }
                    }
                  ]
                },
                "clearCache": {
                  "name": "clearCache",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 331,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "factoryFor": {
                  "name": "factoryFor",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 171,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Factory<T>"
                      }
                    }
                  ]
                },
                "getOption": {
                  "name": "getOption",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 296,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        },
                        {
                          "name": "optionName"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "lookup": {
                  "name": "lookup",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 233,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "T"
                      }
                    }
                  ]
                },
                "lookupAll": {
                  "name": "lookupAll",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 272,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "Dict<T>"
                      }
                    }
                  ]
                },
                "metaFor": {
                  "name": "metaFor",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 319,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "key"
                        }
                      ],
                      "return": {
                        "type": "Dict<any>"
                      }
                    }
                  ]
                },
                "onFirstLookup": {
                  "name": "onFirstLookup",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 222,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        },
                        {
                          "type": "any",
                          "name": "klass"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "register": {
                  "name": "register",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 158,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        },
                        {
                          "type": "any",
                          "name": "entry"
                        },
                        {
                          "type": "ContainerOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "setOption": {
                  "name": "setOption",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 305,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        },
                        {
                          "name": "optionName"
                        },
                        {
                          "type": "any",
                          "name": "value"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 340,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "Resolver": {
              "name": "Resolver",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "registry": {
                  "name": "registry",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 36,
                  "tags": [],
                  "type": "Registry"
                },
                "root": {
                  "name": "root",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 31,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {
                "availableForApp": {
                  "name": "availableForApp",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 143,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "string",
                          "name": "entry"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "availableForConfig": {
                  "name": "availableForConfig",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 154,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "availableForInitializer": {
                  "name": "availableForInitializer",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 167,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "availableForOther": {
                  "name": "availableForOther",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 132,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "availableForType": {
                  "name": "availableForType",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 113,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "register": {
                  "name": "register",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        },
                        {
                          "type": "any",
                          "name": "value"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "retrieve": {
                  "name": "retrieve",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 58,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "specifier"
                        }
                      ],
                      "return": {
                        "type": "T"
                      }
                    }
                  ]
                },
                "retrieveApp": {
                  "name": "retrieveApp",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 88,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "string",
                          "name": "entry"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "retrieveConfig": {
                  "name": "retrieveConfig",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 96,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "string",
                          "name": "entry"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "retrieveInitializer": {
                  "name": "retrieveInitializer",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 104,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "string",
                          "name": "entry"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "retrieveOther": {
                  "name": "retrieveOther",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/resolver.ts",
                  "line": 80,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "string",
                          "name": "entry"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              }
            },
            "JSONParser": {
              "name": "JSONParser",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "inflate": {
                  "name": "inflate",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 20,
                  "tags": [],
                  "type": "boolean"
                },
                "jsonParserMiddleware": {
                  "name": "jsonParserMiddleware",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 60,
                  "tags": [],
                  "type": "RequestHandler"
                },
                "limit": {
                  "name": "limit",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 27,
                  "tags": [],
                  "type": "string"
                },
                "reviver": {
                  "name": "reviver",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 33,
                  "tags": [],
                  "type": "inline literal"
                },
                "strict": {
                  "name": "strict",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 39,
                  "tags": [],
                  "type": "boolean"
                },
                "type": {
                  "name": "type",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 50,
                  "tags": [],
                  "type": "string"
                },
                "verify": {
                  "name": "verify",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 58,
                  "tags": [],
                  "type": "inline literal"
                }
              },
              "methods": {
                "bufferAndParseBody": {
                  "name": "bufferAndParseBody",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 73,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Request",
                          "name": "request"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 62,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "parse": {
                  "name": "parse",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json.ts",
                  "line": 78,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Request",
                          "name": "request"
                        }
                      ],
                      "return": {
                        "type": "Promise<ResponderParams>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "JSONAPIParser": {
              "name": "JSONAPIParser",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "inflate": {
                  "name": "inflate",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "parse/json.ts",
                  "line": 20,
                  "tags": [],
                  "type": "boolean"
                },
                "jsonParserMiddleware": {
                  "name": "jsonParserMiddleware",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "parse/json.ts",
                  "line": 60,
                  "tags": [],
                  "type": "RequestHandler"
                },
                "limit": {
                  "name": "limit",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "parse/json.ts",
                  "line": 27,
                  "tags": [],
                  "type": "string"
                },
                "reviver": {
                  "name": "reviver",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "parse/json.ts",
                  "line": 33,
                  "tags": [],
                  "type": "inline literal"
                },
                "strict": {
                  "name": "strict",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "parse/json.ts",
                  "line": 39,
                  "tags": [],
                  "type": "boolean"
                },
                "type": {
                  "name": "type",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json-api.ts",
                  "line": 21,
                  "tags": [],
                  "type": "string"
                },
                "verify": {
                  "name": "verify",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "parse/json.ts",
                  "line": 58,
                  "tags": [],
                  "type": "inline literal"
                }
              },
              "methods": {
                "bufferAndParseBody": {
                  "name": "bufferAndParseBody",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "parse/json.ts",
                  "line": 73,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Request",
                          "name": "request"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "parse/json.ts",
                  "line": 62,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "parse": {
                  "name": "parse",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json-api.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Request",
                          "name": "request"
                        }
                      ],
                      "return": {
                        "type": "Promise<ResponderParams>"
                      }
                    }
                  ]
                },
                "parseAttributes": {
                  "name": "parseAttributes",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json-api.ts",
                  "line": 94,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "JsonApiAttributes",
                          "name": "attrs"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "parseId": {
                  "name": "parseId",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json-api.ts",
                  "line": 79,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "id"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "parseRelationships": {
                  "name": "parseRelationships",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json-api.ts",
                  "line": 104,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "JsonApiRelationships",
                          "name": "relationships"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "parseResource": {
                  "name": "parseResource",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json-api.ts",
                  "line": 68,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "JsonApiResourceObject",
                          "name": "resource"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "parseType": {
                  "name": "parseType",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/json-api.ts",
                  "line": 86,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "Parser": {
              "name": "Parser",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                }
              },
              "methods": {
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "parse": {
                  "name": "parse",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "parse/parser.ts",
                  "line": 7,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Request",
                          "name": "request"
                        }
                      ],
                      "return": {
                        "type": "Promise<ResponderParams>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "View": {
              "name": "View",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                }
              },
              "methods": {
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "render": {
                  "name": "render",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/view.ts",
                  "line": 7,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "ServerResponse",
                          "name": "response"
                        },
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "ConfigService": {
              "name": "ConfigService",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "_config": {
                  "name": "_config",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 7,
                  "tags": [],
                  "type": "AppConfig"
                },
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "environment": {
                  "name": "environment",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 9,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {
                "get": {
                  "name": "get",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 14,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        }
                      ],
                      "return": {
                        "type": "S[T1]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        },
                        {
                          "type": "T4",
                          "name": "p4"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3][T4]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        },
                        {
                          "type": "T4",
                          "name": "p4"
                        },
                        {
                          "type": "T5",
                          "name": "p5"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3][T4][T5]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        },
                        {
                          "type": "T4",
                          "name": "p4"
                        },
                        {
                          "type": "T5",
                          "name": "p5"
                        },
                        {
                          "type": "T6",
                          "name": "p6"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3][T4][T5][T6]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        },
                        {
                          "type": "T4",
                          "name": "p4"
                        },
                        {
                          "type": "T5",
                          "name": "p5"
                        },
                        {
                          "type": "T6",
                          "name": "p6"
                        },
                        {
                          "type": "T7",
                          "name": "p7"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3][T4][T5][T6][T7]"
                      }
                    }
                  ]
                },
                "getWithDefault": {
                  "name": "getWithDefault",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 27,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "any",
                          "name": "defaultValue"
                        }
                      ],
                      "return": {
                        "type": "S[T1]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "any",
                          "name": "defaultValue"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        },
                        {
                          "type": "any",
                          "name": "defaultValue"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        },
                        {
                          "type": "T4",
                          "name": "p4"
                        },
                        {
                          "type": "any",
                          "name": "defaultValue"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3][T4]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        },
                        {
                          "type": "T4",
                          "name": "p4"
                        },
                        {
                          "type": "T5",
                          "name": "p5"
                        },
                        {
                          "type": "any",
                          "name": "defaultValue"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3][T4][T5]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        },
                        {
                          "type": "T4",
                          "name": "p4"
                        },
                        {
                          "type": "T5",
                          "name": "p5"
                        },
                        {
                          "type": "T6",
                          "name": "p6"
                        },
                        {
                          "type": "any",
                          "name": "defaultValue"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3][T4][T5][T6]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "T1",
                          "name": "p1"
                        },
                        {
                          "type": "T2",
                          "name": "p2"
                        },
                        {
                          "type": "T3",
                          "name": "p3"
                        },
                        {
                          "type": "T4",
                          "name": "p4"
                        },
                        {
                          "type": "T5",
                          "name": "p5"
                        },
                        {
                          "type": "T6",
                          "name": "p6"
                        },
                        {
                          "type": "T7",
                          "name": "p7"
                        },
                        {
                          "type": "any",
                          "name": "defaultValue"
                        }
                      ],
                      "return": {
                        "type": "S[T1][T2][T3][T4][T5][T6][T7]"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            }
          },
          "interfaces": {
            "ContainerOptions": {
              "name": "ContainerOptions",
              "properties": {
                "instantiate": {
                  "name": "instantiate",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 47,
                  "tags": [],
                  "type": "boolean"
                },
                "singleton": {
                  "name": "singleton",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 42,
                  "tags": [],
                  "type": "boolean"
                }
              },
              "methods": {}
            },
            "Factory": {
              "name": "Factory",
              "description": "The Factory object is used to isolate this injection logic to a single spot. The container uses\nthis Factory object internally when instantiating during a `lookup` call. Users can also fetch\nthis Factory via `factoryFor()` if they want to control instantiation. A good example here is\nModels. We could allow the container to instantiate models by setting `instantiate: true`, but\nthat is inconvenient - Models typically take constructor arguments (container instantiation\ndoesn't support that), and we frequently want to fetch the Model class itself, which is\ncumbersome with `instantiate: true`.\n\nInstead, users can simply use `factoryFor` to fetch this Factory wrapper. Then they can\ninstantiate the object however they like.\n",
              "properties": {
                "class": {
                  "name": "class",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 67,
                  "tags": [],
                  "type": "Constructor<T>"
                }
              },
              "methods": {
                "create": {
                  "name": "create",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/container.ts",
                  "line": 68,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "T"
                      }
                    }
                  ]
                }
              }
            },
            "Injection": {
              "name": "Injection",
              "properties": {
                "lookup": {
                  "name": "lookup",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/inject.ts",
                  "line": 5,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "MixinApplicator": {
              "name": "MixinApplicator",
              "properties": {
                "_args": {
                  "name": "_args",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/mixin.ts",
                  "line": 5,
                  "tags": [],
                  "type": "any[]"
                },
                "_factory": {
                  "name": "_factory",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/mixin.ts",
                  "line": 6,
                  "tags": [],
                  "type": "MixinFactory<T, U>"
                }
              },
              "methods": {}
            },
            "MixinFactory": {
              "name": "MixinFactory",
              "properties": {},
              "methods": {}
            },
            "AvailableForTypeMethod": {
              "name": "AvailableForTypeMethod",
              "properties": {},
              "methods": {}
            },
            "Context": {
              "name": "Context",
              "description": "",
              "properties": {
                "action": {
                  "name": "action",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 161,
                  "tags": [],
                  "type": "Action"
                },
                "body": {
                  "name": "body",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 162,
                  "tags": [],
                  "type": "any"
                },
                "document": {
                  "name": "document",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 164,
                  "tags": [],
                  "type": "JsonApiDocument"
                },
                "options": {
                  "name": "options",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 163,
                  "tags": [],
                  "type": "Options"
                }
              },
              "methods": {}
            },
            "JsonApiAttributes": {
              "name": "JsonApiAttributes",
              "properties": {},
              "methods": {}
            },
            "JsonApiDocument": {
              "name": "JsonApiDocument",
              "description": "",
              "properties": {
                "data": {
                  "name": "data",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 25,
                  "tags": []
                },
                "errors": {
                  "name": "errors",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 26,
                  "tags": [],
                  "type": "JsonApiError[]"
                },
                "included": {
                  "name": "included",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 30,
                  "tags": [],
                  "type": "JsonApiResourceObject[]"
                },
                "jsonapi": {
                  "name": "jsonapi",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 28,
                  "tags": [],
                  "type": "inline literal"
                },
                "links": {
                  "name": "links",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 29,
                  "tags": [],
                  "type": "JsonApiLinks"
                },
                "meta": {
                  "name": "meta",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 27,
                  "tags": [],
                  "type": "JsonApiMeta"
                }
              },
              "methods": {}
            },
            "JsonApiError": {
              "name": "JsonApiError",
              "properties": {
                "code": {
                  "name": "code",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 51,
                  "tags": [],
                  "type": "string"
                },
                "detail": {
                  "name": "detail",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 61,
                  "tags": [],
                  "type": "string"
                },
                "id": {
                  "name": "id",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 37,
                  "tags": [],
                  "type": "string"
                },
                "links": {
                  "name": "links",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 38,
                  "tags": [],
                  "type": "inline literal"
                },
                "meta": {
                  "name": "meta",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 76,
                  "tags": [],
                  "type": "JsonApiMeta"
                },
                "source": {
                  "name": "source",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 65,
                  "tags": [],
                  "type": "inline literal"
                },
                "status": {
                  "name": "status",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 47,
                  "tags": [],
                  "type": "string"
                },
                "title": {
                  "name": "title",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 56,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "JsonApiLinks": {
              "name": "JsonApiLinks",
              "properties": {
                "related": {
                  "name": "related",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 130,
                  "tags": [],
                  "type": "JsonApiLink"
                },
                "self": {
                  "name": "self",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 125,
                  "tags": [],
                  "type": "JsonApiLink"
                }
              },
              "methods": {}
            },
            "JsonApiMeta": {
              "name": "JsonApiMeta",
              "properties": {},
              "methods": {}
            },
            "JsonApiRelationship": {
              "name": "JsonApiRelationship",
              "properties": {
                "data": {
                  "name": "data",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 101,
                  "tags": [],
                  "type": "JsonApiRelationshipData"
                },
                "links": {
                  "name": "links",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 100,
                  "tags": [],
                  "type": "JsonApiLinks"
                },
                "meta": {
                  "name": "meta",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 102,
                  "tags": [],
                  "type": "JsonApiMeta"
                }
              },
              "methods": {}
            },
            "JsonApiRelationships": {
              "name": "JsonApiRelationships",
              "properties": {},
              "methods": {}
            },
            "JsonApiResourceIdentifier": {
              "name": "JsonApiResourceIdentifier",
              "properties": {
                "id": {
                  "name": "id",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 108,
                  "tags": [],
                  "type": "string"
                },
                "meta": {
                  "name": "meta",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 110,
                  "tags": [],
                  "type": "JsonApiMeta"
                },
                "type": {
                  "name": "type",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 109,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "JsonApiResourceObject": {
              "name": "JsonApiResourceObject",
              "properties": {
                "attributes": {
                  "name": "attributes",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 82,
                  "tags": [],
                  "type": "JsonApiAttributes"
                },
                "id": {
                  "name": "id",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 80,
                  "tags": [],
                  "type": "string"
                },
                "links": {
                  "name": "links",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 84,
                  "tags": [],
                  "type": "JsonApiLinks"
                },
                "meta": {
                  "name": "meta",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 85,
                  "tags": [],
                  "type": "JsonApiMeta"
                },
                "relationships": {
                  "name": "relationships",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 83,
                  "tags": [],
                  "type": "JsonApiRelationships"
                },
                "type": {
                  "name": "type",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 81,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "Options": {
              "name": "Options",
              "properties": {
                "attributes": {
                  "name": "attributes",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "runtime/action.ts",
                  "line": 71,
                  "tags": [],
                  "type": "string[]"
                },
                "included": {
                  "name": "included",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 145,
                  "tags": [],
                  "type": "Model[]"
                },
                "links": {
                  "name": "links",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 153,
                  "tags": [],
                  "type": "JsonApiLinks"
                },
                "meta": {
                  "name": "meta",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 149,
                  "tags": [],
                  "type": "JsonApiMeta"
                },
                "relationships": {
                  "name": "relationships",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "runtime/action.ts",
                  "line": 75,
                  "tags": [],
                  "type": "RelationshipConfigs"
                },
                "serializer": {
                  "name": "serializer",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "runtime/action.ts",
                  "line": 67,
                  "tags": [],
                  "type": "string"
                },
                "view": {
                  "name": "view",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "runtime/action.ts",
                  "line": 60,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "RelationshipConfig": {
              "name": "RelationshipConfig",
              "properties": {
                "key": {
                  "name": "key",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 9,
                  "tags": [],
                  "type": "string"
                },
                "serializer": {
                  "name": "serializer",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 10,
                  "tags": [],
                  "type": "string"
                },
                "strategy": {
                  "name": "strategy",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 8,
                  "tags": []
                }
              },
              "methods": {}
            },
            "RelationshipConfigs": {
              "name": "RelationshipConfigs",
              "properties": {},
              "methods": {}
            },
            "RenderOptions": {
              "name": "RenderOptions",
              "properties": {
                "attributes": {
                  "name": "attributes",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 71,
                  "tags": [],
                  "type": "string[]"
                },
                "relationships": {
                  "name": "relationships",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 75,
                  "tags": [],
                  "type": "RelationshipConfigs"
                },
                "serializer": {
                  "name": "serializer",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 67,
                  "tags": [],
                  "type": "string"
                },
                "view": {
                  "name": "view",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 60,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "Responder": {
              "name": "Responder",
              "properties": {},
              "methods": {}
            },
            "ResponderParams": {
              "name": "ResponderParams",
              "description": "*Note for Typescript users:*\n\nIt's possible to have a parser that returns a query object with non-string properties (i.e. your\nparser automatically converts the `page=4` query param into a number). In that case, you should\nprobably define your own interface that extends from this, and use that interface to type your\nrespond method argument.\n",
              "properties": {
                "body": {
                  "name": "body",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 46,
                  "tags": [],
                  "type": "any"
                },
                "headers": {
                  "name": "headers",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 48,
                  "tags": [],
                  "type": "any"
                },
                "params": {
                  "name": "params",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 49,
                  "tags": [],
                  "type": "any"
                },
                "query": {
                  "name": "query",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 47,
                  "tags": [],
                  "type": "any"
                }
              },
              "methods": {}
            },
            "AddonConfigBuilder": {
              "name": "AddonConfigBuilder",
              "properties": {},
              "methods": {}
            },
            "AppConfigBuilder": {
              "name": "AppConfigBuilder",
              "properties": {},
              "methods": {}
            },
            "ApplicationOptions": {
              "name": "ApplicationOptions",
              "description": "",
              "properties": {
                "addons": {
                  "name": "addons",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 46,
                  "tags": [],
                  "type": "string[]"
                },
                "container": {
                  "name": "container",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 47,
                  "tags": [],
                  "type": "Container"
                },
                "dir": {
                  "name": "dir",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 49,
                  "tags": [],
                  "type": "string"
                },
                "environment": {
                  "name": "environment",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 48,
                  "tags": [],
                  "type": "string"
                },
                "pkg": {
                  "name": "pkg",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 50,
                  "tags": [],
                  "type": "any"
                },
                "router": {
                  "name": "router",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 45,
                  "tags": [],
                  "type": "Router"
                }
              },
              "methods": {}
            },
            "Initializer": {
              "name": "Initializer",
              "description": "",
              "properties": {
                "after": {
                  "name": "after",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 64,
                  "tags": []
                },
                "before": {
                  "name": "before",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 63,
                  "tags": []
                },
                "name": {
                  "name": "name",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 62,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {
                "initialize": {
                  "name": "initialize",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 65,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Application",
                          "name": "application"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                }
              }
            },
            "MiddlewareBuilder": {
              "name": "MiddlewareBuilder",
              "properties": {},
              "methods": {}
            },
            "RoutesMap": {
              "name": "RoutesMap",
              "properties": {},
              "methods": {}
            },
            "AppConfig": {
              "name": "AppConfig",
              "properties": {
                "cookies": {
                  "name": "cookies",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 73,
                  "tags": [],
                  "type": "any"
                },
                "cors": {
                  "name": "cors",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 78,
                  "tags": [],
                  "type": "any"
                },
                "database": {
                  "name": "database",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 119,
                  "tags": [],
                  "type": "any"
                },
                "environment": {
                  "name": "environment",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 48,
                  "tags": [],
                  "type": "string"
                },
                "logging": {
                  "name": "logging",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 50,
                  "tags": [],
                  "type": "inline literal"
                },
                "migrations": {
                  "name": "migrations",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 80,
                  "tags": [],
                  "type": "inline literal"
                },
                "server": {
                  "name": "server",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/config.ts",
                  "line": 89,
                  "tags": [],
                  "type": "inline literal"
                }
              },
              "methods": {}
            },
            "MiddlewareFn": {
              "name": "MiddlewareFn",
              "properties": {},
              "methods": {}
            },
            "ResourceOptions": {
              "name": "ResourceOptions",
              "properties": {
                "except": {
                  "name": "except",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 48,
                  "tags": [],
                  "type": "string[]"
                },
                "only": {
                  "name": "only",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 52,
                  "tags": [],
                  "type": "string[]"
                },
                "related": {
                  "name": "related",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 44,
                  "tags": [
                    {
                      "name": "see",
                      "value": "{@link http://jsonapi.org/recommendations/#urls-relationships|JSON-API URL\nRecommendatiosn}"
                    }
                  ],
                  "type": "boolean"
                }
              },
              "methods": {}
            },
            "RouterDSL": {
              "name": "RouterDSL",
              "properties": {},
              "methods": {
                "delete": {
                  "name": "delete",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 60,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "pattern"
                        },
                        {
                          "type": "string",
                          "name": "action"
                        },
                        {
                          "type": "__type",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "get": {
                  "name": "get",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 56,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "pattern"
                        },
                        {
                          "type": "string",
                          "name": "action"
                        },
                        {
                          "type": "__type",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "head": {
                  "name": "head",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 61,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "pattern"
                        },
                        {
                          "type": "string",
                          "name": "action"
                        },
                        {
                          "type": "__type",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "options": {
                  "name": "options",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 62,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "pattern"
                        },
                        {
                          "type": "string",
                          "name": "action"
                        },
                        {
                          "type": "__type",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "patch": {
                  "name": "patch",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 59,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "pattern"
                        },
                        {
                          "type": "string",
                          "name": "action"
                        },
                        {
                          "type": "__type",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "post": {
                  "name": "post",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 57,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "pattern"
                        },
                        {
                          "type": "string",
                          "name": "action"
                        },
                        {
                          "type": "__type",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "put": {
                  "name": "put",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 58,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "pattern"
                        },
                        {
                          "type": "string",
                          "name": "action"
                        },
                        {
                          "type": "__type",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "resource": {
                  "name": "resource",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 63,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "resourceName"
                        },
                        {
                          "type": "ResourceOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "RoutesCache": {
              "name": "RoutesCache",
              "properties": {
                "DELETE": {
                  "name": "DELETE",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 26,
                  "tags": [],
                  "type": "Route[]"
                },
                "GET": {
                  "name": "GET",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 22,
                  "tags": [],
                  "type": "Route[]"
                },
                "HEAD": {
                  "name": "HEAD",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 27,
                  "tags": [],
                  "type": "Route[]"
                },
                "OPTIONS": {
                  "name": "OPTIONS",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 28,
                  "tags": [],
                  "type": "Route[]"
                },
                "PATCH": {
                  "name": "PATCH",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 25,
                  "tags": [],
                  "type": "Route[]"
                },
                "POST": {
                  "name": "POST",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 23,
                  "tags": [],
                  "type": "Route[]"
                },
                "PUT": {
                  "name": "PUT",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 24,
                  "tags": [],
                  "type": "Route[]"
                }
              },
              "methods": {}
            },
            "MockMessageOptions": {
              "name": "MockMessageOptions",
              "properties": {
                "body": {
                  "name": "body",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 17,
                  "tags": []
                },
                "headers": {
                  "name": "headers",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 13,
                  "tags": [],
                  "type": "IncomingHttpHeaders"
                },
                "httpVersion": {
                  "name": "httpVersion",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 15,
                  "tags": [],
                  "type": "string"
                },
                "json": {
                  "name": "json",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 16,
                  "tags": [],
                  "type": "any"
                },
                "method": {
                  "name": "method",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 11,
                  "tags": [],
                  "type": "string"
                },
                "trailers": {
                  "name": "trailers",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 14,
                  "tags": [],
                  "type": "Dict<string>"
                },
                "url": {
                  "name": "url",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 12,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "Vertex": {
              "name": "Vertex",
              "properties": {
                "after": {
                  "name": "after",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "utils/topsort.ts",
                  "line": 6,
                  "tags": []
                },
                "before": {
                  "name": "before",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "utils/topsort.ts",
                  "line": 5,
                  "tags": []
                },
                "name": {
                  "name": "name",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "utils/topsort.ts",
                  "line": 4,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "Constructor": {
              "name": "Constructor",
              "properties": {},
              "methods": {}
            },
            "Dict": {
              "name": "Dict",
              "properties": {},
              "methods": {}
            }
          },
          "functions": [
            {
              "name": "attr",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "data/descriptors.ts",
              "line": 68,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "string",
                      "name": "type"
                    },
                    {
                      "type": "any",
                      "name": "options"
                    }
                  ],
                  "return": {
                    "type": "AttributeDescriptor"
                  }
                }
              ]
            },
            {
              "name": "hasMany",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "data/descriptors.ts",
              "line": 117,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "string",
                      "name": "type"
                    },
                    {
                      "type": "any",
                      "name": "options"
                    }
                  ],
                  "return": {
                    "type": "HasManyRelationshipDescriptor"
                  }
                }
              ]
            },
            {
              "name": "hasOne",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "data/descriptors.ts",
              "line": 165,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "string",
                      "name": "type"
                    },
                    {
                      "type": "any",
                      "name": "options"
                    }
                  ],
                  "return": {
                    "type": "HasOneRelationshipDescriptor"
                  }
                }
              ]
            },
            {
              "name": "eachPrototype",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "metal/each-prototype.ts",
              "line": 13,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "any",
                      "name": "obj"
                    },
                    {
                      "type": "inline literal",
                      "name": "fn"
                    }
                  ],
                  "return": {
                    "type": "void"
                  }
                }
              ]
            },
            {
              "name": "inject",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "metal/inject.ts",
              "line": 14,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "string",
                      "name": "lookup"
                    }
                  ],
                  "return": {
                    "type": "T"
                  }
                }
              ]
            },
            {
              "name": "injectInstance",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "metal/inject.ts",
              "line": 21,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "any",
                      "name": "instance"
                    },
                    {
                      "type": "Container",
                      "name": "container"
                    }
                  ],
                  "return": {
                    "type": "void"
                  }
                }
              ]
            },
            {
              "name": "isInjection",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "metal/inject.ts",
              "line": 10,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "any",
                      "name": "value"
                    }
                  ],
                  "return": {
                    "type": "boolean"
                  }
                }
              ]
            },
            {
              "name": "createMixin",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "metal/mixin.ts",
              "line": 66,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "MixinFactory<T, U>",
                      "name": "mixinFactory"
                    }
                  ],
                  "return": {
                    "type": "MixinApplicator<T, U>"
                  }
                }
              ]
            },
            {
              "name": "mixin",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "metal/mixin.ts",
              "line": 42,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "Function",
                      "name": "baseClass"
                    },
                    {
                      "type": "any[]",
                      "name": "mixins"
                    }
                  ],
                  "return": {
                    "type": "any"
                  }
                }
              ]
            },
            {
              "name": "appAcceptanceTest",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "test/app-acceptance.ts",
              "line": 236,
              "tags": [],
              "signatures": [
                {
                  "parameters": [],
                  "return": {
                    "type": "RegisterContextual<inline literal>"
                  }
                }
              ]
            },
            {
              "name": "requireDir",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "utils/require-dir.ts",
              "line": 12,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "string",
                      "name": "dirpath"
                    },
                    {
                      "type": "inline literal",
                      "name": "options"
                    }
                  ],
                  "return": {
                    "type": "inline literal"
                  }
                }
              ]
            },
            {
              "name": "result",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "utils/result.ts",
              "line": 1,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "name": "valueOrFn"
                    },
                    {
                      "type": "any[]",
                      "name": "args"
                    }
                  ],
                  "return": {
                    "type": "T"
                  }
                }
              ]
            },
            {
              "name": "setIfNotEmpty",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "utils/set-if-not-empty.ts",
              "line": 3,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "any",
                      "name": "obj"
                    },
                    {
                      "type": "string",
                      "name": "key"
                    },
                    {
                      "type": "any",
                      "name": "value"
                    }
                  ],
                  "return": {
                    "type": "void"
                  }
                }
              ]
            },
            {
              "name": "topsort",
              "access": "public",
              "deprecated": false,
              "inherited": false,
              "file": "utils/topsort.ts",
              "line": 16,
              "tags": [],
              "signatures": [
                {
                  "parameters": [
                    {
                      "type": "Vertex[]",
                      "name": "items"
                    },
                    {
                      "type": "inline literal",
                      "name": "options"
                    }
                  ],
                  "return": {
                    "type": "any[]"
                  }
                }
              ]
            }
          ]
        },
        data: {
          "classes": {
            "AttributeDescriptor": {
              "name": "AttributeDescriptor",
              "description": "    import { attr } from 'denali';\n    class Post extends ApplicationModel {\n      static title = attr('text');\n    }\n\nNote that attributes must be defined as `static` properties on your Model\nclass.\n\nThe `attr()` method takes two arguments:\n\n  * `type` - a string indicating the type of this attribute. Denali doesn't\n  care what this string is. Your ORM adapter should specify what types it\n  expects.\n  * `options` - any additional options for this attribute. At the moment,\n  these are used solely by your ORM adapter, there are no additional options\n  that Denali expects itself.\n",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "isAttribute": {
                  "name": "isAttribute",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/descriptors.ts",
                  "line": 58,
                  "tags": [],
                  "type": "boolean"
                },
                "options": {
                  "name": "options",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/descriptors.ts",
                  "line": 16,
                  "tags": [],
                  "type": "any"
                },
                "type": {
                  "name": "type",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/descriptors.ts",
                  "line": 11,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "Descriptor": {
              "name": "Descriptor",
              "description": "",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "options": {
                  "name": "options",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/descriptors.ts",
                  "line": 16,
                  "tags": [],
                  "type": "any"
                },
                "type": {
                  "name": "type",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/descriptors.ts",
                  "line": 11,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "HasManyRelationshipDescriptor": {
              "name": "HasManyRelationshipDescriptor",
              "description": "    import { hasMany } from 'denali';\n    class Post extends ApplicationModel {\n      static comments = hasMany('comment');\n    }\n\nNote that relationships must be defined as `static` properties on your Model\nclass.\n\nThe `hasMany()` method takes two arguments:\n\n  * `type` - a string indicating the type of model for this relationship.\n  * `options` - any additional options for this attribute. At the moment,\n  these are used solely by your ORM adapter, there are no additional options\n  that Denali expects itself.\n",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "isRelationship": {
                  "name": "isRelationship",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/descriptors.ts",
                  "line": 102,
                  "tags": [],
                  "type": "boolean"
                },
                "mode": {
                  "name": "mode",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/descriptors.ts",
                  "line": 107,
                  "tags": []
                },
                "options": {
                  "name": "options",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/descriptors.ts",
                  "line": 16,
                  "tags": [],
                  "type": "any"
                },
                "type": {
                  "name": "type",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/descriptors.ts",
                  "line": 11,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "HasOneRelationshipDescriptor": {
              "name": "HasOneRelationshipDescriptor",
              "description": "    import { hasOne } from 'denali';\n    class Post extends ApplicationModel {\n      static author = hasOne('user');\n    }\n\nNote that relationships must be defined as `static` properties on your Model\nclass.\n\nThe `hasOne()` method takes two arguments:\n\n  * `type` - a string indicating the type of model for this relationship.\n  * `options` - any additional options for this attribute. At the moment,\n  these are used solely by your ORM adapter, there are no additional options\n  that Denali expects itself.\n",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "isRelationship": {
                  "name": "isRelationship",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/descriptors.ts",
                  "line": 150,
                  "tags": [],
                  "type": "boolean"
                },
                "mode": {
                  "name": "mode",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/descriptors.ts",
                  "line": 155,
                  "tags": []
                },
                "options": {
                  "name": "options",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/descriptors.ts",
                  "line": 16,
                  "tags": [],
                  "type": "any"
                },
                "type": {
                  "name": "type",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/descriptors.ts",
                  "line": 11,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {}
            },
            "MemoryAdapter": {
              "name": "MemoryAdapter",
              "description": "",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "_cache": {
                  "name": "_cache",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 29,
                  "tags": [],
                  "type": "inline literal"
                },
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "testTransaction": {
                  "name": "testTransaction",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/orm-adapter.ts",
                  "line": 18,
                  "tags": [],
                  "type": "any"
                }
              },
              "methods": {
                "_cacheFor": {
                  "name": "_cacheFor",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 35,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "inline literal"
                      }
                    }
                  ]
                },
                "addRelated": {
                  "name": "addRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 114,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "relationship"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "type": "Model",
                          "name": "relatedModel"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "all": {
                  "name": "all",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 52,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "Promise<any[]>"
                      }
                    }
                  ]
                },
                "buildRecord": {
                  "name": "buildRecord",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 60,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "any",
                          "name": "data"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "defineModels": {
                  "name": "defineModels",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/orm-adapter.ts",
                  "line": 141,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "T[]",
                          "name": "models"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "deleteAttribute": {
                  "name": "deleteAttribute",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 85,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "property"
                        }
                      ],
                      "return": {
                        "type": "true"
                      }
                    }
                  ]
                },
                "deleteRecord": {
                  "name": "deleteRecord",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 136,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "find": {
                  "name": "find",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 44,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "number",
                          "name": "id"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "getAttribute": {
                  "name": "getAttribute",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 76,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "property"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "getRelated": {
                  "name": "getRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 90,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "relationship"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "type": "any",
                          "name": "query"
                        }
                      ],
                      "return": {
                        "type": "Promise<>"
                      }
                    }
                  ]
                },
                "idFor": {
                  "name": "idFor",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 65,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "query": {
                  "name": "query",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 56,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "any",
                          "name": "query"
                        }
                      ],
                      "return": {
                        "type": "Promise<any[]>"
                      }
                    }
                  ]
                },
                "queryOne": {
                  "name": "queryOne",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "any",
                          "name": "query"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "removeRelated": {
                  "name": "removeRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 122,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "relationship"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "type": "Model",
                          "name": "relatedModel"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "rollbackTestTransaction": {
                  "name": "rollbackTestTransaction",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/orm-adapter.ts",
                  "line": 154,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "saveRecord": {
                  "name": "saveRecord",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 126,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "setAttribute": {
                  "name": "setAttribute",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 80,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "property"
                        },
                        {
                          "type": "any",
                          "name": "value"
                        }
                      ],
                      "return": {
                        "type": "true"
                      }
                    }
                  ]
                },
                "setId": {
                  "name": "setId",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 69,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "number",
                          "name": "value"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "setRelated": {
                  "name": "setRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/memory.ts",
                  "line": 105,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "relationship"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "name": "relatedModels"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "startTestTransaction": {
                  "name": "startTestTransaction",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "data/orm-adapter.ts",
                  "line": 149,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "Model": {
              "name": "Model",
              "description": "Models are able to maintain their relatively clean interface thanks to the way the constructor\nactually returns a Proxy which wraps the Model instance, rather than the Model instance directly.\nThis means you can directly get and set properties on your records, and the record (which is a\nProxy-wrapped Model) will translate and forward those calls to the underlying ORM adapter.\n",
              "staticProperties": {
                "abstract": {
                  "name": "abstract",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 30,
                  "tags": [],
                  "type": "boolean"
                }
              },
              "staticMethods": {
                "__computed": {
                  "name": "__computed",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 37,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "ModelClass"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "getType": {
                  "name": "getType",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 126,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Container",
                          "name": "container"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                },
                "mapAttributeDescriptors": {
                  "name": "mapAttributeDescriptors",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 96,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "inline literal",
                          "name": "fn"
                        }
                      ],
                      "return": {
                        "type": "T[]"
                      }
                    }
                  ]
                },
                "mapRelationshipDescriptors": {
                  "name": "mapRelationshipDescriptors",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 111,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "inline literal",
                          "name": "fn"
                        }
                      ],
                      "return": {
                        "type": "T[]"
                      }
                    }
                  ]
                },
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "record": {
                  "name": "record",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 136,
                  "tags": [],
                  "type": "any"
                },
                "adapter": {
                  "name": "adapter",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 149,
                  "tags": [],
                  "type": "ORMAdapter"
                },
                "id": {
                  "name": "id",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 157,
                  "tags": [],
                  "type": "any"
                },
                "type": {
                  "name": "type",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 141,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {
                "addRelated": {
                  "name": "addRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 215,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "relationshipName"
                        },
                        {
                          "type": "Model",
                          "name": "relatedModel"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "delete": {
                  "name": "delete",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 184,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "getRelated": {
                  "name": "getRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 191,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "relationshipName"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<>"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 167,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "data"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "inspect": {
                  "name": "inspect",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 232,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                },
                "removeRelated": {
                  "name": "removeRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 223,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "relationshipName"
                        },
                        {
                          "type": "Model",
                          "name": "relatedModel"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "save": {
                  "name": "save",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 175,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<Model>"
                      }
                    }
                  ]
                },
                "setRelated": {
                  "name": "setRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 207,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "relationshipName"
                        },
                        {
                          "name": "relatedModels"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "toString": {
                  "name": "toString",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/model.ts",
                  "line": 242,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                }
              }
            },
            "ORMAdapter": {
              "name": "ORMAdapter",
              "description": "",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "testTransaction": {
                  "name": "testTransaction",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 18,
                  "tags": [],
                  "type": "any"
                }
              },
              "methods": {
                "addRelated": {
                  "name": "addRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 111,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model",
                          "description": "The model whose related records are being altered"
                        },
                        {
                          "type": "string",
                          "name": "relationship",
                          "description": "The name of the relationship on the model that should be altered"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor",
                          "description": "The RelationshipDescriptor of the relationship being altered"
                        },
                        {
                          "name": "related",
                          "description": "The related record(s) that should be linked to the given relationship\n"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "all": {
                  "name": "all",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 33,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any[]>"
                      }
                    }
                  ]
                },
                "buildRecord": {
                  "name": "buildRecord",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 54,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "any",
                          "name": "data"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "defineModels": {
                  "name": "defineModels",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 141,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "T[]",
                          "name": "models"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "deleteAttribute": {
                  "name": "deleteAttribute",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 76,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "attribute"
                        }
                      ],
                      "return": {
                        "type": "boolean",
                        "description": "returns true if delete operation was successful\n"
                      }
                    }
                  ]
                },
                "deleteRecord": {
                  "name": "deleteRecord",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 135,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "find": {
                  "name": "find",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "any",
                          "name": "id"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "getAttribute": {
                  "name": "getAttribute",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 59,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "attribute"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "getRelated": {
                  "name": "getRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 86,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model",
                          "description": "The model whose related records are being fetched"
                        },
                        {
                          "type": "string",
                          "name": "relationship",
                          "description": "The name of the relationship on the model that should be fetched"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor",
                          "description": "The RelationshipDescriptor of the relationship being fetch"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<>"
                      }
                    }
                  ]
                },
                "idFor": {
                  "name": "idFor",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 43,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "query": {
                  "name": "query",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 38,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "any",
                          "name": "query"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any[]>"
                      }
                    }
                  ]
                },
                "queryOne": {
                  "name": "queryOne",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 28,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "type"
                        },
                        {
                          "type": "any",
                          "name": "query"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "removeRelated": {
                  "name": "removeRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 125,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model",
                          "description": "The model whose related records are being altered"
                        },
                        {
                          "type": "string",
                          "name": "relationship",
                          "description": "The name of the relationship on the model that should be altered"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor",
                          "description": "The RelationshipDescriptor of the relationship being altered"
                        },
                        {
                          "name": "related",
                          "description": "The related record(s) that should be removed from the relationship; if not\n               provided, then all related records should be removed\n"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "rollbackTestTransaction": {
                  "name": "rollbackTestTransaction",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 154,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "saveRecord": {
                  "name": "saveRecord",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 130,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "setAttribute": {
                  "name": "setAttribute",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 66,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "string",
                          "name": "attribute"
                        },
                        {
                          "type": "any",
                          "name": "value"
                        }
                      ],
                      "return": {
                        "type": "boolean",
                        "description": "returns true if set operation was successful\n"
                      }
                    }
                  ]
                },
                "setId": {
                  "name": "setId",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "any",
                          "name": "value"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "setRelated": {
                  "name": "setRelated",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 100,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model",
                          "description": "The model whose related records are being altered"
                        },
                        {
                          "type": "string",
                          "name": "relationship",
                          "description": "The name of the relationship on the model that should be altered"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor",
                          "description": "The RelationshipDescriptor of the relationship being altered"
                        },
                        {
                          "type": "any",
                          "name": "related",
                          "description": "The related record(s) that should be linked to the given relationship\n"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "startTestTransaction": {
                  "name": "startTestTransaction",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "data/orm-adapter.ts",
                  "line": 149,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "JSONSerializer": {
              "name": "JSONSerializer",
              "description": "",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "attributes": {
                  "name": "attributes",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 32,
                  "tags": []
                },
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "contentType": {
                  "name": "contentType",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 24,
                  "tags": [],
                  "type": "string"
                },
                "relationships": {
                  "name": "relationships",
                  "description": "Out of the box, one option is supported:\n\n**strategy**\n\nIt has one of two possible values:\n\n  * `embed`: embed all related records in the response payload\n  * `id`: include only the id of the related record(s)\n\nWhat the embedded records or ids look like is up to each serializer to determine.\n",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 49,
                  "tags": []
                }
              },
              "methods": {
                "attributesToSerialize": {
                  "name": "attributesToSerialize",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 55,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "relationshipsToSerialize": {
                  "name": "relationshipsToSerialize",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 63,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "RelationshipConfigs"
                      }
                    }
                  ]
                },
                "render": {
                  "name": "render",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 67,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "ServerResponse",
                          "name": "response"
                        },
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "renderError": {
                  "name": "renderError",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 163,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "error"
                        },
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "any",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "renderItem": {
                  "name": "renderItem",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 51,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "item"
                        },
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "renderModel": {
                  "name": "renderModel",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 61,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "renderPrimary": {
                  "name": "renderPrimary",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 39,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "payload"
                        },
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "serialize": {
                  "name": "serialize",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 29,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "serializeAttributeName": {
                  "name": "serializeAttributeName",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 89,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "attributeName"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                },
                "serializeAttributeValue": {
                  "name": "serializeAttributeValue",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 99,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "value"
                        },
                        {
                          "type": "string",
                          "name": "key"
                        },
                        {
                          "type": "any",
                          "name": "model"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "serializeAttributes": {
                  "name": "serializeAttributes",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 71,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "serializeRelationship": {
                  "name": "serializeRelationship",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 126,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "relationship"
                        },
                        {
                          "type": "RelationshipConfig",
                          "name": "config"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "type": "Model",
                          "name": "model"
                        },
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "serializeRelationshipName": {
                  "name": "serializeRelationshipName",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 156,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name",
                          "description": ""
                        }
                      ],
                      "return": {
                        "type": "string",
                        "description": "\n"
                      }
                    }
                  ]
                },
                "serializeRelationships": {
                  "name": "serializeRelationships",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json.ts",
                  "line": 106,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "model"
                        },
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<inline literal>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "JSONAPISerializer": {
              "name": "JSONAPISerializer",
              "description": "",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "attributes": {
                  "name": "attributes",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 32,
                  "tags": []
                },
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "contentType": {
                  "name": "contentType",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 178,
                  "tags": [],
                  "type": "string"
                },
                "relationships": {
                  "name": "relationships",
                  "description": "Out of the box, one option is supported:\n\n**strategy**\n\nIt has one of two possible values:\n\n  * `embed`: embed all related records in the response payload\n  * `id`: include only the id of the related record(s)\n\nWhat the embedded records or ids look like is up to each serializer to determine.\n",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 49,
                  "tags": []
                }
              },
              "methods": {
                "attributesForRecord": {
                  "name": "attributesForRecord",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 300,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {
                        "type": "JsonApiAttributes"
                      }
                    }
                  ]
                },
                "attributesToSerialize": {
                  "name": "attributesToSerialize",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 55,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "dataForRelatedRecord": {
                  "name": "dataForRelatedRecord",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 391,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "string",
                          "name": "name"
                        },
                        {
                          "type": "Model",
                          "name": "relatedRecord"
                        },
                        {
                          "type": "RelationshipConfig",
                          "name": "config"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {
                        "type": "Promise<JsonApiResourceIdentifier>"
                      }
                    }
                  ]
                },
                "dataForRelationship": {
                  "name": "dataForRelationship",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 377,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "string",
                          "name": "name"
                        },
                        {
                          "type": "RelationshipConfig",
                          "name": "config"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {
                        "type": "Promise<JsonApiRelationshipData>"
                      }
                    }
                  ]
                },
                "dedupeIncluded": {
                  "name": "dedupeIncluded",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 514,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "idForError": {
                  "name": "idForError",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 475,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "any",
                          "name": "error"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                },
                "includeRecord": {
                  "name": "includeRecord",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 444,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "string",
                          "name": "name"
                        },
                        {
                          "type": "Model",
                          "name": "relatedRecord"
                        },
                        {
                          "type": "RelationshipConfig",
                          "name": "config"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "linksForError": {
                  "name": "linksForError",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 507,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "any",
                          "name": "error"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "linksForRecord": {
                  "name": "linksForRecord",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 428,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {
                        "type": "JsonApiLinks"
                      }
                    }
                  ]
                },
                "linksForRelationship": {
                  "name": "linksForRelationship",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 403,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "string",
                          "name": "name"
                        },
                        {
                          "type": "RelationshipConfig",
                          "name": "config"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {
                        "type": "JsonApiLinks"
                      }
                    }
                  ]
                },
                "metaForError": {
                  "name": "metaForError",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 499,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "any",
                          "name": "error"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "metaForRecord": {
                  "name": "metaForRecord",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 437,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "metaForRelationship": {
                  "name": "metaForRelationship",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 420,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "string",
                          "name": "name"
                        },
                        {
                          "type": "RelationshipConfig",
                          "name": "config"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "relationshipsForRecord": {
                  "name": "relationshipsForRecord",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 336,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {
                        "type": "Promise<JsonApiRelationships>"
                      }
                    }
                  ]
                },
                "relationshipsToSerialize": {
                  "name": "relationshipsToSerialize",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 63,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "RelationshipConfigs"
                      }
                    }
                  ]
                },
                "render": {
                  "name": "render",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "render/serializer.ts",
                  "line": 67,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "ServerResponse",
                          "name": "response"
                        },
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "renderError": {
                  "name": "renderError",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 458,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "any",
                          "name": "error"
                        }
                      ],
                      "return": {
                        "type": "JsonApiError"
                      }
                    }
                  ]
                },
                "renderIncluded": {
                  "name": "renderIncluded",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 243,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "renderLinks": {
                  "name": "renderLinks",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 265,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "renderMeta": {
                  "name": "renderMeta",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 256,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "renderPrimary": {
                  "name": "renderPrimary",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 203,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "renderPrimaryArray": {
                  "name": "renderPrimaryArray",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 226,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "any",
                          "name": "payload"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "renderPrimaryObject": {
                  "name": "renderPrimaryObject",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 215,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "any",
                          "name": "payload"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "renderRecord": {
                  "name": "renderRecord",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 283,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {
                        "type": "Promise<JsonApiResourceObject>"
                      }
                    }
                  ]
                },
                "renderVersion": {
                  "name": "renderVersion",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 274,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "serialize": {
                  "name": "serialize",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 184,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<JsonApiDocument>"
                      }
                    }
                  ]
                },
                "serializeAttributeName": {
                  "name": "serializeAttributeName",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 319,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                },
                "serializeAttributeValue": {
                  "name": "serializeAttributeValue",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 329,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "any",
                          "name": "value"
                        },
                        {
                          "type": "string",
                          "name": "key"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "serializeRelationship": {
                  "name": "serializeRelationship",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 366,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "string",
                          "name": "name"
                        },
                        {
                          "type": "RelationshipConfig",
                          "name": "config"
                        },
                        {
                          "type": "RelationshipDescriptor",
                          "name": "descriptor"
                        },
                        {
                          "type": "Model",
                          "name": "record"
                        }
                      ],
                      "return": {
                        "type": "Promise<JsonApiRelationship>"
                      }
                    }
                  ]
                },
                "serializeRelationshipName": {
                  "name": "serializeRelationshipName",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 357,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                },
                "sourceForError": {
                  "name": "sourceForError",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 491,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "any",
                          "name": "error"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "titleForError": {
                  "name": "titleForError",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/json-api.ts",
                  "line": 483,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Context",
                          "name": "context"
                        },
                        {
                          "type": "any",
                          "name": "error"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                }
              }
            },
            "Serializer": {
              "name": "Serializer",
              "description": "",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "attributes": {
                  "name": "attributes",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 32,
                  "tags": []
                },
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "contentType": {
                  "name": "contentType",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 26,
                  "tags": [],
                  "type": "string"
                },
                "relationships": {
                  "name": "relationships",
                  "description": "Out of the box, one option is supported:\n\n**strategy**\n\nIt has one of two possible values:\n\n  * `embed`: embed all related records in the response payload\n  * `id`: include only the id of the related record(s)\n\nWhat the embedded records or ids look like is up to each serializer to determine.\n",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 49,
                  "tags": []
                }
              },
              "methods": {
                "attributesToSerialize": {
                  "name": "attributesToSerialize",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 55,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "relationshipsToSerialize": {
                  "name": "relationshipsToSerialize",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 63,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "RelationshipConfigs"
                      }
                    }
                  ]
                },
                "render": {
                  "name": "render",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 67,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "ServerResponse",
                          "name": "response"
                        },
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "serialize": {
                  "name": "serialize",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "render/serializer.ts",
                  "line": 78,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Action",
                          "name": "action"
                        },
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            }
          },
          "interfaces": {},
          "functions": []
        },
        metal: {
          "classes": {
            "InstrumentationEvent": {
              "name": "InstrumentationEvent",
              "description": "For example, if you wanted to instrument how long a particular action was taking:\n\n    import { Instrumentation, Action } from 'denali';\n    export default class MyAction extends Action {\n      respond() {\n        let Post = this.modelFor('post');\n        return Instrumentation.instrument('post lookup', { currentUser: this.user.id }, () => {\n          Post.find({ user: this.user });\n        });\n      }\n    }\n",
              "staticProperties": {
                "_emitter": {
                  "name": "_emitter",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 28,
                  "tags": [],
                  "type": "internal"
                }
              },
              "staticMethods": {
                "emit": {
                  "name": "emit",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 57,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "eventName"
                        },
                        {
                          "type": "InstrumentationEvent",
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "instrument": {
                  "name": "instrument",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 50,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "eventName"
                        },
                        {
                          "type": "any",
                          "name": "data"
                        }
                      ],
                      "return": {
                        "type": "InstrumentationEvent"
                      }
                    }
                  ]
                },
                "subscribe": {
                  "name": "subscribe",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 33,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "eventName"
                        },
                        {
                          "type": "inline literal",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "unsubscribe": {
                  "name": "unsubscribe",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 40,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "eventName"
                        },
                        {
                          "type": "inline literal",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "data": {
                  "name": "data",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 74,
                  "tags": [],
                  "type": "any"
                },
                "duration": {
                  "name": "duration",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 69,
                  "tags": [],
                  "type": "number"
                },
                "eventName": {
                  "name": "eventName",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 64,
                  "tags": [],
                  "type": "string"
                },
                "startTime": {
                  "name": "startTime",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 79,
                  "tags": []
                }
              },
              "methods": {
                "finish": {
                  "name": "finish",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/instrumentation.ts",
                  "line": 91,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "data"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "DenaliObject": {
              "name": "DenaliObject",
              "description": "",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                }
              },
              "methods": {
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            }
          },
          "interfaces": {},
          "functions": []
        },
        runtime: {
          "classes": {
            "Action": {
              "name": "Action",
              "description": "When a request comes in, Denali will invoke the `respond` method (or `respondWith__` for content\nnegotiated requests) on the matching Action class. The return value (or resolved return value) of\nthis method is used to render the response.\n\nActions also support filters. Simply define a method on your action, and add the method name to\nthe `before` or `after` array. Filters behave similar to responders in that they receive the\nrequest params and can return a promise which will be waited on before continuing. Filters are\ninheritable, so child classes will run filters added by parent classes.\n",
              "staticProperties": {
                "after": {
                  "name": "after",
                  "description": "Filters can be synchronous, or return a promise (which will pause the before/respond/after\nchain until it resolves).\n\nFilters must be defined as static properties to allow Denali to extract the values. Instance\nfields are not visible until instantiation, so there's no way to build an \"accumulated\" value\nfrom each step in the inheritance chain.\n",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 129,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string[]"
                },
                "before": {
                  "name": "before",
                  "description": "Filters can be synchronous, or return a promise (which will pause the before/respond/after\nchain until it resolves).\n\nIf a before filter returns any value (or returns a promise which resolves to any value) other\nthan null or undefined, Denali will attempt to render that response and halt further processing\nof the request (including remaining before filters).\n\nFilters must be defined as static properties to allow Denali to extract the values. Instance\nfields are not visible until instantiation, so there's no way to build an \"accumulated\" value\nfrom each step in the inheritance chain.\n",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 114,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string[]"
                }
              },
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "actionPath": {
                  "name": "actionPath",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 182,
                  "tags": [],
                  "type": "string"
                },
                "config": {
                  "name": "config",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 134,
                  "tags": [],
                  "type": "ConfigService"
                },
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "db": {
                  "name": "db",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 151,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "DatabaseService"
                },
                "hasRendered": {
                  "name": "hasRendered",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 177,
                  "tags": [],
                  "type": "boolean"
                },
                "logger": {
                  "name": "logger",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 158,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Logger"
                },
                "parser": {
                  "name": "parser",
                  "description": "By default it uses the application parser, but you can override with the name of the parser\nyou'd rather use instead.\n",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 144,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Parser"
                },
                "request": {
                  "name": "request",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 165,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Request"
                },
                "response": {
                  "name": "response",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 172,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "ServerResponse"
                }
              },
              "methods": {
                "_buildFilterChains": {
                  "name": "_buildFilterChains",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 334,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "inline literal"
                      }
                    }
                  ]
                },
                "_invokeFilters": {
                  "name": "_invokeFilters",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 306,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string[]",
                          "name": "chain"
                        },
                        {
                          "type": "ResponderParams",
                          "name": "parsedRequest"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "render": {
                  "name": "render",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 193,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "status"
                        },
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "RenderOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "respond": {
                  "name": "respond",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 301,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "ResponderParams",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "run": {
                  "name": "run",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/action.ts",
                  "line": 251,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Request",
                          "name": "request"
                        },
                        {
                          "type": "ServerResponse",
                          "name": "response"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "Addon": {
              "name": "Addon",
              "description": "## Structure\n\nAddons are packaged as npm modules for easy sharing. When Denali boots up, it searches your\nnode_modules for available Denali Addons (identified by the `denali-addon` keyword in the\npackage.json). Addons can be nested (i.e. an addon can itself depend on another addon).\n\nEach addon can be composed of one or several of the following parts:\n\n  * Config\n  * Initializers\n  * Middleware\n  * App classes\n  * Routes\n\n## Load order\n\nAfter Denali discovers the available addons, it then merges them to form a unified application.\nAddons higher in the dependency tree take precedence, and sibling addons can specify load order\nvia their package.json files:\n\n    \"denali\": {\n      \"before\": [ \"another-addon-name\" ],\n      \"after\": [ \"cool-addon-name\" ]\n    }\n",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 87,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Container"
                },
                "dir": {
                  "name": "dir",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 66,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "environment": {
                  "name": "environment",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 59,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "pkg": {
                  "name": "pkg",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 73,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "any"
                },
                "resolver": {
                  "name": "resolver",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 80,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Resolver"
                },
                "name": {
                  "name": "name",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 106,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                }
              },
              "methods": {
                "shutdown": {
                  "name": "shutdown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 116,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Application",
                          "name": "application"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                }
              }
            },
            "Application": {
              "name": "Application",
              "description": "",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "addons": {
                  "name": "addons",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 112,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Addon[]"
                },
                "config": {
                  "name": "config",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 86,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "any"
                },
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 93,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Container"
                },
                "dir": {
                  "name": "dir",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "runtime/addon.ts",
                  "line": 66,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "drainers": {
                  "name": "drainers",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 98,
                  "tags": [],
                  "type": "inline literal[]"
                },
                "environment": {
                  "name": "environment",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "runtime/addon.ts",
                  "line": 59,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "logger": {
                  "name": "logger",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 105,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Logger"
                },
                "pkg": {
                  "name": "pkg",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "runtime/addon.ts",
                  "line": 73,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "any"
                },
                "resolver": {
                  "name": "resolver",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "runtime/addon.ts",
                  "line": 80,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Resolver"
                },
                "router": {
                  "name": "router",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 79,
                  "tags": [],
                  "type": "Router"
                },
                "name": {
                  "name": "name",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "runtime/addon.ts",
                  "line": 106,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                }
              },
              "methods": {
                "buildAddons": {
                  "name": "buildAddons",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 139,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string[]",
                          "name": "preseededAddons"
                        }
                      ],
                      "return": {
                        "type": "Addon[]"
                      }
                    }
                  ]
                },
                "compileRouter": {
                  "name": "compileRouter",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 208,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "createServer": {
                  "name": "createServer",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 251,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "port"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "generateConfig": {
                  "name": "generateConfig",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 186,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "runInitializers": {
                  "name": "runInitializers",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 276,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "shutdown": {
                  "name": "shutdown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 289,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "start": {
                  "name": "start",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/application.ts",
                  "line": 233,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                }
              }
            },
            "Logger": {
              "name": "Logger",
              "description": "",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "colorize": {
                  "name": "colorize",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/logger.ts",
                  "line": 31,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "boolean"
                },
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                },
                "levels": {
                  "name": "levels",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/logger.ts",
                  "line": 36,
                  "tags": [],
                  "type": "LogLevel[]"
                },
                "loglevel": {
                  "name": "loglevel",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/logger.ts",
                  "line": 24,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "LogLevel"
                }
              },
              "methods": {
                "error": {
                  "name": "error",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/logger.ts",
                  "line": 74,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "msg"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "info": {
                  "name": "info",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/logger.ts",
                  "line": 56,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "msg"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "log": {
                  "name": "log",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/logger.ts",
                  "line": 81,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "LogLevel",
                          "name": "level"
                        },
                        {
                          "type": "string",
                          "name": "msg"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "warn": {
                  "name": "warn",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/logger.ts",
                  "line": 65,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "msg"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "Request": {
              "name": "Request",
              "description": "",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "_originalAction": {
                  "name": "_originalAction",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 45,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "config": {
                  "name": "config",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 59,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "inline literal"
                },
                "id": {
                  "name": "id",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 30,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "incomingMessage": {
                  "name": "incomingMessage",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 52,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ]
                },
                "params": {
                  "name": "params",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 84,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "any"
                },
                "route": {
                  "name": "route",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 37,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Route"
                },
                "hasBody": {
                  "name": "hasBody",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 225,
                  "tags": [],
                  "type": "boolean"
                },
                "headers": {
                  "name": "headers",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 100,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Dict<>"
                },
                "hostname": {
                  "name": "hostname",
                  "description": "When the \"trust proxy\" setting trusts the socket address, the\n\"X-Forwarded-Host\" header field will be trusted.\n",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 173,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "ip": {
                  "name": "ip",
                  "description": "The is the remote address on the socket unless \"trust proxy\" is set.\n",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 201,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "ips": {
                  "name": "ips",
                  "description": "For example if the value were \"client, proxy1, proxy2\" you would receive\nthe array `[\"client\", \"proxy1\", \"proxy2\"]` where \"proxy2\" is the furthest\ndown-stream and \"proxy1\" and \"proxy2\" were trusted.\n",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 215,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string[]"
                },
                "method": {
                  "name": "method",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 66,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "path": {
                  "name": "path",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 75,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string"
                },
                "protocol": {
                  "name": "protocol",
                  "description": "If you're running behind a reverse proxy that supplies https for you this\nmay be enabled.\n",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 138,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ]
                },
                "query": {
                  "name": "query",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 91,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "Dict<string>"
                },
                "subdomains": {
                  "name": "subdomains",
                  "description": "Subdomains are the dot-separated parts of the host before the main domain\nof the app. By default, the domain of the app is assumed to be the last\ntwo parts of the host. This can be changed by setting\nconfig.server.subdomainOffset\n\nFor example, if the domain is \"tobi.ferrets.example.com\": If the subdomain\noffset is not set, req.subdomains is `[\"ferrets\", \"tobi\"]`. If the\nsubdomain offset is 3, req.subdomains is `[\"tobi\"]`.\n",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 118,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "string[]"
                },
                "xhr": {
                  "name": "xhr",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 160,
                  "tags": [
                    {
                      "name": "since",
                      "value": "0.1.0"
                    }
                  ],
                  "type": "boolean"
                }
              },
              "methods": {
                "accepts": {
                  "name": "accepts",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 297,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "string[]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "string[]",
                          "name": "type"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "acceptsCharsets": {
                  "name": "acceptsCharsets",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 322,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "string[]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "string[]",
                          "name": "charset"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "acceptsEncodings": {
                  "name": "acceptsEncodings",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 309,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "string[]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "string[]",
                          "name": "encoding"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "acceptsLanguages": {
                  "name": "acceptsLanguages",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 335,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "string[]"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "string[]",
                          "name": "lang"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "getHeader": {
                  "name": "getHeader",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 251,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "is": {
                  "name": "is",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 393,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string[]",
                          "name": "types"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "range": {
                  "name": "range",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/request.ts",
                  "line": 362,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "size"
                        },
                        {
                          "type": "parseRange.Options",
                          "name": "options"
                        }
                      ],
                      "return": {}
                    }
                  ]
                }
              }
            },
            "Route": {
              "name": "Route",
              "description": "",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "action": {
                  "name": "action",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/route.ts",
                  "line": 29,
                  "tags": [],
                  "type": "Factory<Action>"
                },
                "actionPath": {
                  "name": "actionPath",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/route.ts",
                  "line": 34,
                  "tags": [],
                  "type": "string"
                },
                "additionalParams": {
                  "name": "additionalParams",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/route.ts",
                  "line": 24,
                  "tags": [],
                  "type": "any"
                },
                "spec": {
                  "name": "spec",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/route.ts",
                  "line": 16,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {
                "match": {
                  "name": "match",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/route-parser/index.d.ts",
                  "line": 26,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "pathname"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "reverse": {
                  "name": "reverse",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/route-parser/index.d.ts",
                  "line": 35,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "inline literal",
                          "name": "params"
                        }
                      ],
                      "return": {}
                    }
                  ]
                }
              }
            },
            "Router": {
              "name": "Router",
              "description": "",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 98,
                  "tags": [],
                  "type": "Container"
                },
                "middleware": {
                  "name": "middleware",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 93,
                  "tags": [],
                  "type": "any"
                },
                "config": {
                  "name": "config",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 100,
                  "tags": [],
                  "type": "ConfigService"
                }
              },
              "methods": {
                "delete": {
                  "name": "delete",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 279,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "rawPattern"
                        },
                        {
                          "type": "string",
                          "name": "actionPath"
                        },
                        {
                          "type": "any",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "get": {
                  "name": "get",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 243,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "rawPattern"
                        },
                        {
                          "type": "string",
                          "name": "actionPath"
                        },
                        {
                          "type": "any",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "handle": {
                  "name": "handle",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 120,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "IncomingMessage",
                          "name": "req"
                        },
                        {
                          "type": "ServerResponse",
                          "name": "res"
                        }
                      ],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "handleError": {
                  "name": "handleError",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 168,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Request",
                          "name": "request"
                        },
                        {
                          "type": "ServerResponse",
                          "name": "res"
                        },
                        {
                          "type": "Error",
                          "name": "error"
                        }
                      ],
                      "return": {
                        "type": "Promise<any>"
                      }
                    }
                  ]
                },
                "head": {
                  "name": "head",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 288,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "rawPattern"
                        },
                        {
                          "type": "string",
                          "name": "actionPath"
                        },
                        {
                          "type": "any",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "map": {
                  "name": "map",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 110,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "inline literal",
                          "name": "fn"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "namespace": {
                  "name": "namespace",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 390,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "namespace"
                        },
                        {
                          "type": "inline literal",
                          "name": "fn"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "options": {
                  "name": "options",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 297,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "rawPattern"
                        },
                        {
                          "type": "string",
                          "name": "actionPath"
                        },
                        {
                          "type": "any",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "patch": {
                  "name": "patch",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 270,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "rawPattern"
                        },
                        {
                          "type": "string",
                          "name": "actionPath"
                        },
                        {
                          "type": "any",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "post": {
                  "name": "post",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 252,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "rawPattern"
                        },
                        {
                          "type": "string",
                          "name": "actionPath"
                        },
                        {
                          "type": "any",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "put": {
                  "name": "put",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 261,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "rawPattern"
                        },
                        {
                          "type": "string",
                          "name": "actionPath"
                        },
                        {
                          "type": "any",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "resource": {
                  "name": "resource",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 329,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "resourceName"
                        },
                        {
                          "type": "ResourceOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "route": {
                  "name": "route",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 198,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "method"
                        },
                        {
                          "type": "string",
                          "name": "rawPattern"
                        },
                        {
                          "type": "string",
                          "name": "actionPath"
                        },
                        {
                          "type": "any",
                          "name": "params"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "urlFor": {
                  "name": "urlFor",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 223,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "actionPath"
                        },
                        {
                          "type": "any",
                          "name": "data"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "use": {
                  "name": "use",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/router.ts",
                  "line": 181,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MiddlewareFn",
                          "name": "middleware"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            },
            "Service": {
              "name": "Service",
              "description": "Services are mostly conventional - they are just singletons with no\nspecial behavior. The common base class ensures they are\nsingletons, makes user intent clear, and paves the way for introducing\nadditional common functionality in future versions of Denali.\n",
              "staticProperties": {},
              "staticMethods": {
                "mixin": {
                  "name": "mixin",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 23,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "MixinApplicator<any, any>[]",
                          "name": "mixins"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "container": {
                  "name": "container",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 30,
                  "tags": [],
                  "type": "Container"
                }
              },
              "methods": {
                "init": {
                  "name": "init",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 41,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "teardown": {
                  "name": "teardown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "metal/object.ts",
                  "line": 48,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            }
          },
          "interfaces": {
            "AddonOptions": {
              "name": "AddonOptions",
              "description": "",
              "properties": {
                "container": {
                  "name": "container",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 16,
                  "tags": [],
                  "type": "Container"
                },
                "dir": {
                  "name": "dir",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 15,
                  "tags": [],
                  "type": "string"
                },
                "environment": {
                  "name": "environment",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 14,
                  "tags": [],
                  "type": "string"
                },
                "pkg": {
                  "name": "pkg",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "runtime/addon.ts",
                  "line": 17,
                  "tags": [],
                  "type": "any"
                }
              },
              "methods": {}
            }
          },
          "functions": []
        },
        test: {
          "classes": {
            "AppAcceptance": {
              "name": "AppAcceptance",
              "description": "",
              "staticProperties": {},
              "staticMethods": {},
              "properties": {
                "_injections": {
                  "name": "_injections",
                  "description": "",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 45,
                  "tags": [],
                  "type": "inline literal"
                },
                "application": {
                  "name": "application",
                  "description": "",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 29,
                  "tags": [],
                  "type": "Application"
                }
              },
              "methods": {
                "delete": {
                  "name": "delete",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 129,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "url"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<inline literal>"
                      }
                    }
                  ]
                },
                "get": {
                  "name": "get",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 113,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "url"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<inline literal>"
                      }
                    }
                  ]
                },
                "getHeader": {
                  "name": "getHeader",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 162,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "string"
                      }
                    }
                  ]
                },
                "head": {
                  "name": "head",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 121,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "url"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<inline literal>"
                      }
                    }
                  ]
                },
                "inject": {
                  "name": "inject",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 199,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        },
                        {
                          "type": "any",
                          "name": "value"
                        },
                        {
                          "type": "ContainerOptions",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "lookup": {
                  "name": "lookup",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 189,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "patch": {
                  "name": "patch",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 153,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "url"
                        },
                        {
                          "type": "string",
                          "name": "body"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<inline literal>"
                      }
                    }
                  ]
                },
                "post": {
                  "name": "post",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 137,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "url"
                        },
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<inline literal>"
                      }
                    }
                  ]
                },
                "put": {
                  "name": "put",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 145,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "url"
                        },
                        {
                          "type": "any",
                          "name": "body"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<inline literal>"
                      }
                    }
                  ]
                },
                "removeHeader": {
                  "name": "removeHeader",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 180,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "request": {
                  "name": "request",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 74,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "Promise<inline literal>"
                      }
                    }
                  ]
                },
                "restore": {
                  "name": "restore",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 211,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "setHeader": {
                  "name": "setHeader",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 171,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        },
                        {
                          "type": "string",
                          "name": "value"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "shutdown": {
                  "name": "shutdown",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 221,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                },
                "start": {
                  "name": "start",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/app-acceptance.ts",
                  "line": 65,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Promise<void>"
                      }
                    }
                  ]
                }
              }
            },
            "MockRequest": {
              "name": "MockRequest",
              "description": "",
              "staticProperties": {
                "defaultMaxListeners": {
                  "name": "defaultMaxListeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 762,
                  "tags": [],
                  "type": "number"
                }
              },
              "staticMethods": {
                "listenerCount": {
                  "name": "listenerCount",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 761,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "EventEmitter",
                          "name": "emitter"
                        },
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "number"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "connection": {
                  "name": "connection",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 36,
                  "tags": [],
                  "type": "Socket"
                },
                "headers": {
                  "name": "headers",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 41,
                  "tags": [],
                  "type": "IncomingHttpHeaders"
                },
                "httpVersion": {
                  "name": "httpVersion",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 28,
                  "tags": [],
                  "type": "string"
                },
                "method": {
                  "name": "method",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 46,
                  "tags": [],
                  "type": "string"
                },
                "readable": {
                  "name": "readable",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 54,
                  "tags": [],
                  "type": "boolean"
                },
                "trailers": {
                  "name": "trailers",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 49,
                  "tags": [],
                  "type": "Dict<string>"
                },
                "url": {
                  "name": "url",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 47,
                  "tags": [],
                  "type": "string"
                },
                "writable": {
                  "name": "writable",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5148,
                  "tags": [],
                  "type": "boolean"
                },
                "httpVersionMajor": {
                  "name": "httpVersionMajor",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 29,
                  "tags": [],
                  "type": "number"
                },
                "httpVersionMinor": {
                  "name": "httpVersionMinor",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 32,
                  "tags": [],
                  "type": "number"
                },
                "rawHeaders": {
                  "name": "rawHeaders",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 42,
                  "tags": [],
                  "type": "string[]"
                },
                "rawTrailers": {
                  "name": "rawTrailers",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 50,
                  "tags": [],
                  "type": "string[]"
                },
                "socket": {
                  "name": "socket",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 37,
                  "tags": [],
                  "type": "Socket"
                }
              },
              "methods": {
                "_destroy": {
                  "name": "_destroy",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5151,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Error",
                          "name": "err"
                        },
                        {
                          "type": "Function",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "_final": {
                  "name": "_final",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5152,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Function",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "_read": {
                  "name": "_read",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4976,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "size"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "_transform": {
                  "name": "_transform",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5170,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "string",
                          "name": "encoding"
                        },
                        {
                          "type": "Function",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "_write": {
                  "name": "_write",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5150,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "string",
                          "name": "encoding"
                        },
                        {
                          "type": "Function",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "addListener": {
                  "name": "addListener",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4997,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "cork": {
                  "name": "cork",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5159,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "destroy": {
                  "name": "destroy",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 105,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "emit": {
                  "name": "emit",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5005,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "name": "chunk"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "Error",
                          "name": "err"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    }
                  ]
                },
                "end": {
                  "name": "end",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5156,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "Function",
                          "name": "cb"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "string",
                          "name": "encoding"
                        },
                        {
                          "type": "Function",
                          "name": "cb"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "eventNames": {
                  "name": "eventNames",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 775,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Array<>"
                      }
                    }
                  ]
                },
                "getMaxListeners": {
                  "name": "getMaxListeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 772,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "number"
                      }
                    }
                  ]
                },
                "isPaused": {
                  "name": "isPaused",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4981,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "boolean"
                      }
                    }
                  ]
                },
                "listenerCount": {
                  "name": "listenerCount",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 776,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "number"
                      }
                    }
                  ]
                },
                "listeners": {
                  "name": "listeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 773,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "Function[]"
                      }
                    }
                  ]
                },
                "on": {
                  "name": "on",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5012,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "once": {
                  "name": "once",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5019,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "pause": {
                  "name": "pause",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4979,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "pipe": {
                  "name": "pipe",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4959,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "T",
                          "name": "destination"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "T"
                      }
                    }
                  ]
                },
                "prependListener": {
                  "name": "prependListener",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5026,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "prependOnceListener": {
                  "name": "prependOnceListener",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5033,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "push": {
                  "name": "push",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4985,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "string",
                          "name": "encoding"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    }
                  ]
                },
                "read": {
                  "name": "read",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4977,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "size"
                        }
                      ],
                      "return": {
                        "type": "any"
                      }
                    }
                  ]
                },
                "removeAllListeners": {
                  "name": "removeAllListeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 770,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "removeListener": {
                  "name": "removeListener",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5040,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "resume": {
                  "name": "resume",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4980,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "setDefaultEncoding": {
                  "name": "setDefaultEncoding",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5155,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "encoding"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "setEncoding": {
                  "name": "setEncoding",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4978,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "encoding"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "setMaxListeners": {
                  "name": "setMaxListeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 771,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "n"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "setTimeout": {
                  "name": "setTimeout",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-request.ts",
                  "line": 102,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "msecs"
                        },
                        {
                          "type": "inline literal",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "uncork": {
                  "name": "uncork",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5160,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "unpipe": {
                  "name": "unpipe",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4982,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "T",
                          "name": "destination"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "unshift": {
                  "name": "unshift",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4983,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "wrap": {
                  "name": "wrap",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4984,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "ReadableStream",
                          "name": "oldStream"
                        }
                      ],
                      "return": {
                        "type": "Readable"
                      }
                    }
                  ]
                },
                "write": {
                  "name": "write",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5153,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "Function",
                          "name": "cb"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "string",
                          "name": "encoding"
                        },
                        {
                          "type": "Function",
                          "name": "cb"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    }
                  ]
                }
              }
            },
            "MockResponse": {
              "name": "MockResponse",
              "description": "",
              "staticProperties": {
                "defaultMaxListeners": {
                  "name": "defaultMaxListeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 762,
                  "tags": [],
                  "type": "number"
                }
              },
              "staticMethods": {
                "listenerCount": {
                  "name": "listenerCount",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 761,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "EventEmitter",
                          "name": "emitter"
                        },
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "number"
                      }
                    }
                  ]
                }
              },
              "properties": {
                "_body": {
                  "name": "_body",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 37,
                  "tags": [],
                  "type": "string"
                },
                "_customStatusMessage": {
                  "name": "_customStatusMessage",
                  "access": "protected",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 35,
                  "tags": [],
                  "type": "string"
                },
                "_headers": {
                  "name": "_headers",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 20,
                  "tags": [],
                  "type": "OutgoingHttpHeaders"
                },
                "_json": {
                  "name": "_json",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 38,
                  "tags": [],
                  "type": "any"
                },
                "chunkedEncoding": {
                  "name": "chunkedEncoding",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 24,
                  "tags": [],
                  "type": "boolean"
                },
                "connection": {
                  "name": "connection",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 33,
                  "tags": [],
                  "type": "Socket"
                },
                "finished": {
                  "name": "finished",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 30,
                  "tags": [],
                  "type": "boolean"
                },
                "headersSent": {
                  "name": "headersSent",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 31,
                  "tags": [],
                  "type": "boolean"
                },
                "sendDate": {
                  "name": "sendDate",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 27,
                  "tags": [],
                  "type": "boolean"
                },
                "shouldKeepAlive": {
                  "name": "shouldKeepAlive",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 25,
                  "tags": [],
                  "type": "boolean"
                },
                "statusCode": {
                  "name": "statusCode",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 16,
                  "tags": [],
                  "type": "number"
                },
                "upgrading": {
                  "name": "upgrading",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 23,
                  "tags": [],
                  "type": "boolean"
                },
                "useChunkedEncodingByDefault": {
                  "name": "useChunkedEncodingByDefault",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 26,
                  "tags": [],
                  "type": "boolean"
                },
                "writable": {
                  "name": "writable",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5058,
                  "tags": [],
                  "type": "boolean"
                },
                "statusMessage": {
                  "name": "statusMessage",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 17,
                  "tags": [],
                  "type": "string"
                }
              },
              "methods": {
                "_destroy": {
                  "name": "_destroy",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5061,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Error",
                          "name": "err"
                        },
                        {
                          "type": "Function",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "_final": {
                  "name": "_final",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5062,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Function",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "_implicitHeader": {
                  "name": "_implicitHeader",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 64,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "_write": {
                  "name": "_write",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5060,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "string",
                          "name": "encoding"
                        },
                        {
                          "type": "Function",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "addListener": {
                  "name": "addListener",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5083,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "addTrailers": {
                  "name": "addTrailers",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 83,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "headers"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "assignSocket": {
                  "name": "assignSocket",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 100,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Socket",
                          "name": "socket"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "cork": {
                  "name": "cork",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5069,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "destroy": {
                  "name": "destroy",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5071,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Error",
                          "name": "error"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "detachSocket": {
                  "name": "detachSocket",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 101,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "Socket",
                          "name": "socket"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "emit": {
                  "name": "emit",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5091,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "any[]",
                          "name": "args"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "name": "chunk"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "Error",
                          "name": "err"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "Readable",
                          "name": "src"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "Readable",
                          "name": "src"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    }
                  ]
                },
                "end": {
                  "name": "end",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5066,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "Function",
                          "name": "cb"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "type": "any",
                          "name": "chunk"
                        },
                        {
                          "type": "string",
                          "name": "encoding"
                        },
                        {
                          "type": "Function",
                          "name": "cb"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "eventNames": {
                  "name": "eventNames",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 775,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "Array<>"
                      }
                    }
                  ]
                },
                "flushHeaders": {
                  "name": "flushHeaders",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 86,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "getHeader": {
                  "name": "getHeader",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 68,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {}
                    }
                  ]
                },
                "getHeaderNames": {
                  "name": "getHeaderNames",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 74,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "string[]"
                      }
                    }
                  ]
                },
                "getHeaders": {
                  "name": "getHeaders",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 71,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "OutgoingHttpHeaders"
                      }
                    }
                  ]
                },
                "getMaxListeners": {
                  "name": "getMaxListeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 772,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "number"
                      }
                    }
                  ]
                },
                "hasHeader": {
                  "name": "hasHeader",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 77,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    }
                  ]
                },
                "listenerCount": {
                  "name": "listenerCount",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 776,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "type"
                        }
                      ],
                      "return": {
                        "type": "number"
                      }
                    }
                  ]
                },
                "listeners": {
                  "name": "listeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 773,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "Function[]"
                      }
                    }
                  ]
                },
                "on": {
                  "name": "on",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5099,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "once": {
                  "name": "once",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5107,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "pipe": {
                  "name": "pipe",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 4959,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "T",
                          "name": "destination"
                        },
                        {
                          "type": "inline literal",
                          "name": "options"
                        }
                      ],
                      "return": {
                        "type": "T"
                      }
                    }
                  ]
                },
                "prependListener": {
                  "name": "prependListener",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5115,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "prependOnceListener": {
                  "name": "prependOnceListener",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5123,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "removeAllListeners": {
                  "name": "removeAllListeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 770,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "event"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "removeHeader": {
                  "name": "removeHeader",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 80,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "removeListener": {
                  "name": "removeListener",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5131,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    },
                    {
                      "parameters": [
                        {
                          "name": "event"
                        },
                        {
                          "type": "inline literal",
                          "name": "listener"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "setDefaultEncoding": {
                  "name": "setDefaultEncoding",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5065,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "encoding"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "setHeader": {
                  "name": "setHeader",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 65,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "string",
                          "name": "name"
                        },
                        {
                          "name": "value"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "setMaxListeners": {
                  "name": "setMaxListeners",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 771,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "n"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "setTimeout": {
                  "name": "setTimeout",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 102,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "msecs"
                        },
                        {
                          "type": "inline literal",
                          "name": "callback"
                        }
                      ],
                      "return": {
                        "type": "this"
                      }
                    }
                  ]
                },
                "uncork": {
                  "name": "uncork",
                  "access": "public",
                  "deprecated": false,
                  "inherited": true,
                  "file": "/Users/daw/oss/denali/denali/node_modules/@types/node/index.d.ts",
                  "line": 5070,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "write": {
                  "name": "write",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 52,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "name": "chunk"
                        },
                        {
                          "name": "encoding"
                        },
                        {
                          "type": "Function",
                          "name": "cb"
                        }
                      ],
                      "return": {
                        "type": "boolean"
                      }
                    }
                  ]
                },
                "writeContinue": {
                  "name": "writeContinue",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 98,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                },
                "writeHead": {
                  "name": "writeHead",
                  "access": "public",
                  "deprecated": false,
                  "inherited": false,
                  "file": "test/mock-response.ts",
                  "line": 88,
                  "tags": [],
                  "signatures": [
                    {
                      "parameters": [
                        {
                          "type": "number",
                          "name": "statusCode"
                        },
                        {
                          "name": "statusMessage"
                        },
                        {
                          "type": "OutgoingHttpHeaders",
                          "name": "headers"
                        }
                      ],
                      "return": {
                        "type": "void"
                      }
                    }
                  ]
                }
              }
            }
          },
          "interfaces": {},
          "functions": []
        }
      }
    }
  }
];

docs.push(Object.assign({}, docs[0], { versionId: '@denali-js:core@latest' }))

export default docs;