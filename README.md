# MojangGameReleaseNoteParser

A small program used to get release noes from mojang server. And convert it to the flowdocument.

# How To Use

> Install

```
  yarn install
  rm -rf ./node_modules/consola/types
```

> Build

```
  yarn build
```

> Configuration

```
  cd build/
  vim(vi) ./config.json
```

> Run (In Production Mode)

```
  node ./index.js Or yarn run
```

> Configuration File Description

***It is important to modify the config.json***

+ checkInterval: News check interval, in millisecond.
+ port: Server port

# How To Get News Using Rest API?
> I provided two routes to get the result from the program

+ "http://[ADDRESS]:[PORT]/rest/api/rN/": This is the default route to get the notes, by default, it will return all of them.
+ "http://[ADDRESS]:[PORT]/rest/api/rN/:type": This api has a custom parameter "type", you can specify which release channel you wanna fetch.
