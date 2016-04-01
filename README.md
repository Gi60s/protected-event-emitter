# protected-event-emitter

## How is this event library different?

Any code can listen to any events but not any code can emit any event. This library allows you to control what code is allowed to emit what events.

## Installation

```sh
$ npm install protected-event-emitter
```

## API

### emitter ( namespace )

Create an event emitter that will emit events on the specified namespace. The namespace must be unique.

**Parameters**

* **namespace** [optional, string] - The namespace to emit events on.

**Returns** an emit function that takes two parameters: 1) the type of event being emitted, and 2) the data for the event.

```js
const event = require('protected-event-emmitter');
const emit = event.emitter('my-emitter');

emit('ready', 'Good to go');    // type is "ready", data is "Good to go"
```

### listenerCount ( namespace [, event ] )

Count how many item are listening the the namespace, optionally limiting results to a specific event type.

**Parameters**

* **namespace** [required, string] - The namespace to count events on.
* **event** [optional, string] - The type of event to filter count to.

**Returns** a number.

### namespace ( namespace )

Get an object that has shortcut functions to the off, on, and once event handler functions for this namespace.

**Parameters**

* **namespace** [required, string] - The namespace to get the shortcut functions for.

**Returns** an object with event handler functions that are scoped to the namespace provided.

```js
const event = require('protected-event-emmitter');

function readyHandler(data) {
    console.log('my-emiter is ready with data: ' + data);
}

const listeners = event.namespace('my-emitter');
listeners.on('ready', readyHandler);    // equivalent to: event.on('my-emitter', 'ready', readyHandler);
listeners.off('ready', readyHandler);   // equivalent to: event.off('my-emitter', 'ready', readyHandler);
listeners.once('ready', readyHandler);  // equivalent to: event.once('my-emitter', 'ready', readyHandler);
```
### namespaces

A getter to get all namespaces that have been registered using the [emitter](#emitter) function. Returns an array of strings.

### off ( namespace, event, callback )

Remove an event handler from the specific namespace and event type.

**Parameters**

* **namespace** [required, string] - The namespace to stop listening on.
* **event** [optional, string] - The event type to stop listening for.

**Returns** a number.